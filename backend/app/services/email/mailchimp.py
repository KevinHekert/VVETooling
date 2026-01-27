"""Mailchimp/Mandrill email provider implementation.

Implements STORY-049: Mailchimp integratie implementeren.
Uses Mailchimp Transactional (Mandrill) API for email delivery.
"""

import base64
import json
import logging
from typing import Any

import httpx

from app.services.email.base import (
    Attachment,
    EmailOptions,
    EmailProvider,
    EmailProviderType,
    EmailResult,
    EmailStatus,
)

logger = logging.getLogger(__name__)


class MailchimpError(Exception):
    """Mailchimp API specific error."""
    
    def __init__(self, message: str, code: str | None = None, status: str | None = None):
        super().__init__(message)
        self.code = code
        self.status = status


class MailchimpProvider(EmailProvider):
    """Mailchimp Transactional (Mandrill) email provider.
    
    Implements STORY-049 requirements:
    - Connection via Mandrill Transactional API
    - Support for to, subject, body, HTML, CC, BCC, attachments, reply-to
    - Response translation to unified status
    - Rate limiting (429) handling with retry
    """
    
    MANDRILL_API_URL = "https://mandrillapp.com/api/1.0"
    
    def __init__(self, api_key: str):
        """Initialize Mailchimp provider.
        
        Args:
            api_key: Mailchimp/Mandrill API key
        """
        self.api_key = api_key
        self._client: httpx.AsyncClient | None = None
    
    async def _get_client(self) -> httpx.AsyncClient:
        """Get or create HTTP client."""
        if self._client is None:
            self._client = httpx.AsyncClient(
                timeout=30.0,
                headers={"Content-Type": "application/json"},
            )
        return self._client
    
    async def close(self) -> None:
        """Close the HTTP client."""
        if self._client:
            await self._client.aclose()
            self._client = None
    
    async def send_email(
        self,
        to: list[str],
        subject: str,
        body: str,
        sender_email: str,
        sender_name: str | None = None,
        options: EmailOptions | None = None,
    ) -> EmailResult:
        """Send an email via Mailchimp Transactional API.
        
        Uses the /messages/send endpoint.
        """
        options = options or EmailOptions()
        
        try:
            # Build recipient list
            recipients = [{"email": email, "type": "to"} for email in to]
            
            # Add CC recipients
            for cc_email in options.cc:
                recipients.append({"email": cc_email, "type": "cc"})
            
            # Add BCC recipients
            for bcc_email in options.bcc:
                recipients.append({"email": bcc_email, "type": "bcc"})
            
            # Build message
            message: dict[str, Any] = {
                "from_email": sender_email,
                "to": recipients,
                "subject": subject,
            }
            
            if sender_name:
                message["from_name"] = sender_name
            
            # Set body based on HTML flag
            if options.is_html:
                message["html"] = body
            else:
                message["text"] = body
            
            # Reply-to
            if options.reply_to:
                message["headers"] = {"Reply-To": options.reply_to}
            
            # Attachments
            if options.attachments:
                message["attachments"] = self._format_attachments(options.attachments)
            
            # Tags for tracking
            if options.tags:
                message["tags"] = options.tags[:5]  # Mandrill limits to 5 tags
            
            # Build request
            payload = {
                "key": self.api_key,
                "message": message,
            }
            
            # Send request
            client = await self._get_client()
            response = await self._send_with_retry(
                client,
                f"{self.MANDRILL_API_URL}/messages/send",
                payload,
            )
            
            # Parse response
            return self._parse_send_response(response)
            
        except MailchimpError as e:
            user_message, error_code = self.translate_error(e)
            return EmailResult.failure_result(
                error_message=user_message,
                error_code=error_code,
                provider=EmailProviderType.MAILCHIMP,
            )
        except Exception as e:
            logger.exception("Mailchimp send error")
            user_message, error_code = self.translate_error(e)
            return EmailResult.failure_result(
                error_message=user_message,
                error_code=error_code,
                provider=EmailProviderType.MAILCHIMP,
            )
    
    async def _send_with_retry(
        self,
        client: httpx.AsyncClient,
        url: str,
        payload: dict[str, Any],
        max_retries: int = 3,
    ) -> list[dict[str, Any]]:
        """Send request with retry logic for rate limiting."""
        import asyncio
        
        for attempt in range(max_retries):
            response = await client.post(url, json=payload)
            
            if response.status_code == 429:
                # Rate limited - wait and retry
                wait_time = min(2 ** attempt, 8)  # Exponential backoff, max 8 seconds
                logger.warning(f"Mailchimp rate limited, waiting {wait_time}s")
                await asyncio.sleep(wait_time)
                continue
            
            if response.status_code != 200:
                error_data = response.json() if response.content else {}
                raise MailchimpError(
                    message=error_data.get("message", "Unknown error"),
                    code=error_data.get("code"),
                    status=error_data.get("status"),
                )
            
            return response.json()
        
        raise MailchimpError("Maximum retries exceeded due to rate limiting")
    
    def _parse_send_response(self, response: list[dict[str, Any]]) -> EmailResult:
        """Parse Mandrill send response."""
        if not response:
            return EmailResult.failure_result(
                error_message="Geen respons van Mailchimp",
                provider=EmailProviderType.MAILCHIMP,
            )
        
        # Get first result (primary recipient)
        result = response[0]
        status = result.get("status", "")
        
        if status == "sent":
            return EmailResult(
                success=True,
                message_id=result.get("_id"),
                provider=EmailProviderType.MAILCHIMP,
                status=EmailStatus.SENT,
            )
        elif status == "queued":
            return EmailResult(
                success=True,
                message_id=result.get("_id"),
                provider=EmailProviderType.MAILCHIMP,
                status=EmailStatus.QUEUED,
            )
        elif status == "rejected":
            return EmailResult(
                success=False,
                message_id=result.get("_id"),
                error_message=f"E-mail geweigerd: {result.get('reject_reason', 'onbekend')}",
                error_code="REJECTED",
                provider=EmailProviderType.MAILCHIMP,
                status=EmailStatus.REJECTED,
            )
        else:
            return EmailResult.failure_result(
                error_message=f"Onbekende status: {status}",
                error_code="UNKNOWN_STATUS",
                provider=EmailProviderType.MAILCHIMP,
            )
    
    @staticmethod
    def _format_attachments(attachments: list[Attachment]) -> list[dict[str, str]]:
        """Format attachments for Mandrill API."""
        return [
            {
                "type": att.content_type,
                "name": att.filename,
                "content": base64.b64encode(att.content).decode("utf-8"),
            }
            for att in attachments
        ]
    
    async def validate_configuration(self) -> bool:
        """Validate the API key by pinging Mandrill."""
        try:
            client = await self._get_client()
            response = await client.post(
                f"{self.MANDRILL_API_URL}/users/ping",
                json={"key": self.api_key},
            )
            
            if response.status_code == 200:
                # Returns "PONG!" on success
                return response.text.strip('"') == "PONG!"
            
            return False
        except Exception:
            logger.exception("Mailchimp validation error")
            return False
    
    def get_provider_name(self) -> str:
        """Get provider display name."""
        return "Mailchimp"
    
    def get_provider_type(self) -> EmailProviderType:
        """Get provider type."""
        return EmailProviderType.MAILCHIMP
    
    def translate_error(self, error: Exception) -> tuple[str, str | None]:
        """Translate Mailchimp errors to Dutch user messages."""
        if isinstance(error, MailchimpError):
            # Map common Mandrill errors
            error_map = {
                "Invalid_Key": ("Ongeldige API sleutel", "INVALID_KEY"),
                "ValidationError": ("Ongeldige e-mailgegevens", "VALIDATION_ERROR"),
                "GeneralError": ("E-mail kon niet worden verstuurd", "GENERAL_ERROR"),
            }
            
            if error.code and error.code in error_map:
                return error_map[error.code]
            
            return (str(error), error.code)
        
        return super().translate_error(error)
