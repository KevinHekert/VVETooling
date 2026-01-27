"""SendGrid email provider implementation.

Implements STORY-051: SendGrid integratie implementeren.
Uses SendGrid Web API v3 for email delivery.
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


class SendGridError(Exception):
    """SendGrid API specific error."""
    
    def __init__(self, message: str, code: str | None = None, status_code: int | None = None):
        super().__init__(message)
        self.code = code
        self.status_code = status_code


class SendGridProvider(EmailProvider):
    """SendGrid email provider.
    
    Implements STORY-051 requirements:
    - Connection via SendGrid Web API v3
    - Support for to, subject, body, HTML, CC, BCC, attachments, reply-to
    - Categories/tags for tracking
    - Response translation to unified status
    - Rate limiting (429) handling with backoff
    """
    
    SENDGRID_API_URL = "https://api.sendgrid.com/v3"
    
    def __init__(self, api_key: str):
        """Initialize SendGrid provider.
        
        Args:
            api_key: SendGrid API key
        """
        self.api_key = api_key
        self._client: httpx.AsyncClient | None = None
    
    async def _get_client(self) -> httpx.AsyncClient:
        """Get or create HTTP client."""
        if self._client is None:
            self._client = httpx.AsyncClient(
                timeout=30.0,
                headers={
                    "Authorization": f"Bearer {self.api_key}",
                    "Content-Type": "application/json",
                },
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
        """Send an email via SendGrid API v3.
        
        Uses the /mail/send endpoint.
        """
        options = options or EmailOptions()
        
        try:
            # Build personalizations (recipients)
            to_list = [{"email": email} for email in to]
            personalizations: dict[str, Any] = {"to": to_list}
            
            # Add CC recipients
            if options.cc:
                personalizations["cc"] = [{"email": email} for email in options.cc]
            
            # Add BCC recipients
            if options.bcc:
                personalizations["bcc"] = [{"email": email} for email in options.bcc]
            
            # Build from
            from_data: dict[str, str] = {"email": sender_email}
            if sender_name:
                from_data["name"] = sender_name
            
            # Build content
            content_type = "text/html" if options.is_html else "text/plain"
            content = [{"type": content_type, "value": body}]
            
            # Build request payload
            payload: dict[str, Any] = {
                "personalizations": [personalizations],
                "from": from_data,
                "subject": subject,
                "content": content,
            }
            
            # Reply-to
            if options.reply_to:
                payload["reply_to"] = {"email": options.reply_to}
            
            # Attachments
            if options.attachments:
                payload["attachments"] = self._format_attachments(options.attachments)
            
            # Categories/tags for tracking
            if options.tags:
                payload["categories"] = options.tags[:10]  # SendGrid limits to 10
            
            # Send request
            client = await self._get_client()
            response = await self._send_with_retry(
                client,
                f"{self.SENDGRID_API_URL}/mail/send",
                payload,
            )
            
            # SendGrid returns 202 Accepted on success with X-Message-Id header
            return response
            
        except SendGridError as e:
            user_message, error_code = self.translate_error(e)
            return EmailResult.failure_result(
                error_message=user_message,
                error_code=error_code,
                provider=EmailProviderType.SENDGRID,
            )
        except Exception as e:
            logger.exception("SendGrid send error")
            user_message, error_code = self.translate_error(e)
            return EmailResult.failure_result(
                error_message=user_message,
                error_code=error_code,
                provider=EmailProviderType.SENDGRID,
            )
    
    async def _send_with_retry(
        self,
        client: httpx.AsyncClient,
        url: str,
        payload: dict[str, Any],
        max_retries: int = 3,
    ) -> EmailResult:
        """Send request with retry logic for rate limiting."""
        import asyncio
        
        for attempt in range(max_retries):
            response = await client.post(url, json=payload)
            
            if response.status_code == 429:
                # Rate limited - wait and retry with exponential backoff
                wait_time = min(2 ** attempt, 8)
                logger.warning(f"SendGrid rate limited, waiting {wait_time}s")
                await asyncio.sleep(wait_time)
                continue
            
            if response.status_code == 202:
                # Success - get message ID from header
                message_id = response.headers.get("X-Message-Id")
                return EmailResult(
                    success=True,
                    message_id=message_id,
                    provider=EmailProviderType.SENDGRID,
                    status=EmailStatus.SENT,
                )
            
            # Error response
            error_data = response.json() if response.content else {}
            errors = error_data.get("errors", [])
            error_msg = errors[0].get("message", "Unknown error") if errors else "Unknown error"
            
            raise SendGridError(
                message=error_msg,
                code=errors[0].get("field") if errors else None,
                status_code=response.status_code,
            )
        
        raise SendGridError("Maximum retries exceeded due to rate limiting")
    
    @staticmethod
    def _format_attachments(attachments: list[Attachment]) -> list[dict[str, str]]:
        """Format attachments for SendGrid API."""
        return [
            {
                "content": base64.b64encode(att.content).decode("utf-8"),
                "filename": att.filename,
                "type": att.content_type,
                "disposition": "attachment",
            }
            for att in attachments
        ]
    
    async def validate_configuration(self) -> bool:
        """Validate the API key by fetching user profile."""
        try:
            client = await self._get_client()
            response = await client.get(f"{self.SENDGRID_API_URL}/user/profile")
            
            # 200 means valid API key
            return response.status_code == 200
        except Exception:
            logger.exception("SendGrid validation error")
            return False
    
    def get_provider_name(self) -> str:
        """Get provider display name."""
        return "SendGrid"
    
    def get_provider_type(self) -> EmailProviderType:
        """Get provider type."""
        return EmailProviderType.SENDGRID
    
    def translate_error(self, error: Exception) -> tuple[str, str | None]:
        """Translate SendGrid errors to Dutch user messages."""
        if isinstance(error, SendGridError):
            # Map common SendGrid errors
            status_map = {
                400: ("Ongeldige e-mailgegevens", "BAD_REQUEST"),
                401: ("Ongeldige API sleutel", "UNAUTHORIZED"),
                403: ("Geen toegang tot SendGrid", "FORBIDDEN"),
                404: ("SendGrid resource niet gevonden", "NOT_FOUND"),
                500: ("SendGrid serverfout", "SERVER_ERROR"),
            }
            
            if error.status_code and error.status_code in status_map:
                return status_map[error.status_code]
            
            return (str(error), error.code)
        
        return super().translate_error(error)
