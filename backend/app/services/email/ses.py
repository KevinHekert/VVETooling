"""Amazon SES email provider implementation.

Implements STORY-050: Amazon SES integratie implementeren.
Uses AWS SDK (boto3) for email delivery via Simple Email Service.
"""

import base64
import logging
from email.mime.application import MIMEApplication
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from typing import Any

import boto3
from botocore.exceptions import BotoCoreError, ClientError

from app.services.email.base import (
    Attachment,
    EmailOptions,
    EmailProvider,
    EmailProviderType,
    EmailResult,
    EmailStatus,
)

logger = logging.getLogger(__name__)


class AmazonSESError(Exception):
    """Amazon SES specific error."""
    
    def __init__(self, message: str, code: str | None = None):
        super().__init__(message)
        self.code = code


class AmazonSESProvider(EmailProvider):
    """Amazon Simple Email Service provider.
    
    Implements STORY-050 requirements:
    - Connection via AWS SDK (boto3)
    - Region configuration support
    - Support for to, subject, body, HTML, CC, BCC, attachments, reply-to
    - Response translation to unified status
    - Proper sandbox mode error handling
    """
    
    def __init__(
        self,
        access_key_id: str,
        secret_access_key: str,
        region: str = "eu-west-1",
    ):
        """Initialize Amazon SES provider.
        
        Args:
            access_key_id: AWS Access Key ID
            secret_access_key: AWS Secret Access Key
            region: AWS region (e.g., eu-west-1, us-east-1)
        """
        self.access_key_id = access_key_id
        self.secret_access_key = secret_access_key
        self.region = region
        self._client: Any = None
    
    def _get_client(self) -> Any:
        """Get or create SES client."""
        if self._client is None:
            self._client = boto3.client(
                "ses",
                aws_access_key_id=self.access_key_id,
                aws_secret_access_key=self.secret_access_key,
                region_name=self.region,
            )
        return self._client
    
    async def send_email(
        self,
        to: list[str],
        subject: str,
        body: str,
        sender_email: str,
        sender_name: str | None = None,
        options: EmailOptions | None = None,
    ) -> EmailResult:
        """Send an email via Amazon SES.
        
        Uses SendRawEmail for full attachment support.
        """
        options = options or EmailOptions()
        
        try:
            # Format sender
            source = f"{sender_name} <{sender_email}>" if sender_name else sender_email
            
            # Build destination
            destination = {"ToAddresses": to}
            if options.cc:
                destination["CcAddresses"] = options.cc
            if options.bcc:
                destination["BccAddresses"] = options.bcc
            
            # If we have attachments, use raw email
            if options.attachments:
                return await self._send_raw_email(
                    source=source,
                    destinations=to + options.cc + options.bcc,
                    subject=subject,
                    body=body,
                    options=options,
                )
            
            # Otherwise use simple SendEmail
            client = self._get_client()
            
            # Build message body
            message_body: dict[str, Any] = {}
            if options.is_html:
                message_body["Html"] = {"Charset": "UTF-8", "Data": body}
            else:
                message_body["Text"] = {"Charset": "UTF-8", "Data": body}
            
            # Build parameters
            params: dict[str, Any] = {
                "Source": source,
                "Destination": destination,
                "Message": {
                    "Subject": {"Charset": "UTF-8", "Data": subject},
                    "Body": message_body,
                },
            }
            
            # Reply-to
            if options.reply_to:
                params["ReplyToAddresses"] = [options.reply_to]
            
            # Tags
            if options.tags:
                params["Tags"] = [
                    {"Name": "category", "Value": tag}
                    for tag in options.tags[:10]  # SES limits tags
                ]
            
            # Send
            response = client.send_email(**params)
            
            return EmailResult(
                success=True,
                message_id=response.get("MessageId"),
                provider=EmailProviderType.AMAZON_SES,
                status=EmailStatus.SENT,
            )
            
        except ClientError as e:
            error_code = e.response.get("Error", {}).get("Code", "Unknown")
            user_message, code = self.translate_error(e)
            return EmailResult.failure_result(
                error_message=user_message,
                error_code=code,
                provider=EmailProviderType.AMAZON_SES,
            )
        except (BotoCoreError, Exception) as e:
            logger.exception("SES send error")
            user_message, code = self.translate_error(e)
            return EmailResult.failure_result(
                error_message=user_message,
                error_code=code,
                provider=EmailProviderType.AMAZON_SES,
            )
    
    async def _send_raw_email(
        self,
        source: str,
        destinations: list[str],
        subject: str,
        body: str,
        options: EmailOptions,
    ) -> EmailResult:
        """Send raw email with attachments."""
        try:
            # Create multipart message
            msg = MIMEMultipart("mixed")
            msg["Subject"] = subject
            msg["From"] = source
            msg["To"] = ", ".join(destinations[:len(options.cc) - len(options.bcc) if options.cc or options.bcc else len(destinations)])
            
            if options.reply_to:
                msg["Reply-To"] = options.reply_to
            
            # Create body part
            body_part = MIMEMultipart("alternative")
            
            if options.is_html:
                html_part = MIMEText(body, "html", "utf-8")
                body_part.attach(html_part)
            else:
                text_part = MIMEText(body, "plain", "utf-8")
                body_part.attach(text_part)
            
            msg.attach(body_part)
            
            # Add attachments
            for attachment in options.attachments:
                att = MIMEApplication(attachment.content)
                att.add_header(
                    "Content-Disposition",
                    "attachment",
                    filename=attachment.filename,
                )
                att.add_header("Content-Type", attachment.content_type)
                msg.attach(att)
            
            # Send raw email
            client = self._get_client()
            response = client.send_raw_email(
                Source=source,
                Destinations=destinations,
                RawMessage={"Data": msg.as_string()},
            )
            
            return EmailResult(
                success=True,
                message_id=response.get("MessageId"),
                provider=EmailProviderType.AMAZON_SES,
                status=EmailStatus.SENT,
            )
            
        except Exception as e:
            logger.exception("SES raw send error")
            user_message, code = self.translate_error(e)
            return EmailResult.failure_result(
                error_message=user_message,
                error_code=code,
                provider=EmailProviderType.AMAZON_SES,
            )
    
    async def validate_configuration(self) -> bool:
        """Validate AWS credentials and SES access."""
        try:
            client = self._get_client()
            # Get send quota to verify access
            response = client.get_send_quota()
            return "Max24HourSend" in response
        except Exception:
            logger.exception("SES validation error")
            return False
    
    def get_provider_name(self) -> str:
        """Get provider display name."""
        return "Amazon SES"
    
    def get_provider_type(self) -> EmailProviderType:
        """Get provider type."""
        return EmailProviderType.AMAZON_SES
    
    def translate_error(self, error: Exception) -> tuple[str, str | None]:
        """Translate SES errors to Dutch user messages."""
        if isinstance(error, ClientError):
            error_code = error.response.get("Error", {}).get("Code", "")
            
            error_map = {
                "MessageRejected": (
                    "E-mail geweigerd door Amazon SES",
                    "MESSAGE_REJECTED",
                ),
                "MailFromDomainNotVerifiedException": (
                    "Sender domein is niet geverifieerd in AWS SES",
                    "DOMAIN_NOT_VERIFIED",
                ),
                "ConfigurationSetDoesNotExistException": (
                    "Configuratie niet gevonden",
                    "CONFIG_NOT_FOUND",
                ),
                "InvalidParameterValue": (
                    "Ongeldige e-mailgegevens",
                    "INVALID_PARAMETER",
                ),
                "AccessDeniedException": (
                    "Geen toegang tot AWS SES",
                    "ACCESS_DENIED",
                ),
                "AccountSendingPausedException": (
                    "E-mail verzending is gepauzeerd voor dit account",
                    "SENDING_PAUSED",
                ),
                # Sandbox mode errors
                "MessageRejected.EmailAddressNotVerified": (
                    "E-mailadres is niet geverifieerd (sandbox mode)",
                    "SANDBOX_NOT_VERIFIED",
                ),
            }
            
            if error_code in error_map:
                return error_map[error_code]
            
            # Check for sandbox-related message
            error_msg = str(error)
            if "not verified" in error_msg.lower():
                return (
                    "Sender e-mailadres is niet geverifieerd in AWS SES",
                    "SANDBOX_NOT_VERIFIED",
                )
            
            return (f"AWS SES fout: {error_code}", error_code)
        
        if isinstance(error, BotoCoreError):
            return ("AWS verbindingsfout", "BOTO_ERROR")
        
        return super().translate_error(error)
