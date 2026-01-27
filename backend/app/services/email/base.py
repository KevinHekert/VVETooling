"""Base email provider interface and common types.

Implements STORY-052: E-mail provider abstractie laag.
Defines the contract for all email providers.
"""

from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum
from typing import Any
from uuid import UUID, uuid4


class EmailStatus(str, Enum):
    """Status of an email send operation."""
    
    QUEUED = "queued"
    SENDING = "sending"
    SENT = "sent"
    FAILED = "failed"
    REJECTED = "rejected"
    BOUNCED = "bounced"


class EmailProviderType(str, Enum):
    """Supported email providers."""
    
    MAILCHIMP = "mailchimp"
    AMAZON_SES = "amazon_ses"
    SENDGRID = "sendgrid"


@dataclass
class Attachment:
    """Email attachment data."""
    
    filename: str
    content: bytes
    content_type: str


@dataclass
class EmailOptions:
    """Options for sending an email.
    
    Implements the options interface from STORY-052 acceptance criteria.
    """
    
    cc: list[str] = field(default_factory=list)
    bcc: list[str] = field(default_factory=list)
    reply_to: str | None = None
    attachments: list[Attachment] = field(default_factory=list)
    is_html: bool = True
    tags: list[str] = field(default_factory=list)
    metadata: dict[str, Any] = field(default_factory=dict)


@dataclass
class EmailResult:
    """Result of an email send operation.
    
    Implements the result interface from STORY-052 acceptance criteria.
    """
    
    success: bool
    message_id: str | None = None
    error_message: str | None = None
    error_code: str | None = None
    provider: EmailProviderType | None = None
    status: EmailStatus = EmailStatus.QUEUED
    timestamp: datetime = field(default_factory=datetime.utcnow)
    
    @classmethod
    def success_result(
        cls,
        message_id: str,
        provider: EmailProviderType,
    ) -> "EmailResult":
        """Create a successful result."""
        return cls(
            success=True,
            message_id=message_id,
            provider=provider,
            status=EmailStatus.SENT,
        )
    
    @classmethod
    def failure_result(
        cls,
        error_message: str,
        error_code: str | None = None,
        provider: EmailProviderType | None = None,
    ) -> "EmailResult":
        """Create a failed result."""
        return cls(
            success=False,
            error_message=error_message,
            error_code=error_code,
            provider=provider,
            status=EmailStatus.FAILED,
        )


@dataclass
class EmailMessage:
    """Complete email message to be sent."""
    
    to: list[str]
    subject: str
    body: str
    sender_email: str
    sender_name: str | None = None
    options: EmailOptions = field(default_factory=EmailOptions)
    id: UUID = field(default_factory=uuid4)


@dataclass
class EmailConfiguration:
    """Email provider configuration.
    
    Stores provider-specific credentials and settings.
    """
    
    provider_type: EmailProviderType
    sender_email: str
    sender_name: str | None = None
    is_active: bool = False
    
    # Mailchimp specific
    mailchimp_api_key: str | None = None
    
    # Amazon SES specific
    ses_access_key_id: str | None = None
    ses_secret_access_key: str | None = None
    ses_region: str | None = None
    
    # SendGrid specific
    sendgrid_api_key: str | None = None
    
    def mask_credentials(self) -> dict[str, Any]:
        """Return configuration with masked credentials for display."""
        result = {
            "provider_type": self.provider_type.value,
            "sender_email": self.sender_email,
            "sender_name": self.sender_name,
            "is_active": self.is_active,
        }
        
        if self.mailchimp_api_key:
            result["mailchimp_api_key"] = self._mask(self.mailchimp_api_key)
        if self.ses_access_key_id:
            result["ses_access_key_id"] = self._mask(self.ses_access_key_id)
        if self.ses_secret_access_key:
            result["ses_secret_access_key"] = self._mask(self.ses_secret_access_key)
        if self.ses_region:
            result["ses_region"] = self.ses_region
        if self.sendgrid_api_key:
            result["sendgrid_api_key"] = self._mask(self.sendgrid_api_key)
        
        return result
    
    @staticmethod
    def _mask(value: str) -> str:
        """Mask a credential, showing only last 4 characters."""
        if len(value) <= 4:
            return "****"
        return "*" * (len(value) - 4) + value[-4:]


class EmailProvider(ABC):
    """Abstract base class for email providers.
    
    Implements STORY-052 interface requirements:
    - sendEmail(to, subject, body, options) → result
    - validateConfiguration() → boolean
    - getProviderName() → string
    """
    
    @abstractmethod
    async def send_email(
        self,
        to: list[str],
        subject: str,
        body: str,
        sender_email: str,
        sender_name: str | None = None,
        options: EmailOptions | None = None,
    ) -> EmailResult:
        """Send an email.
        
        Args:
            to: List of recipient email addresses
            subject: Email subject
            body: Email body (HTML or plain text based on options.is_html)
            sender_email: Sender email address
            sender_name: Optional sender name
            options: Additional email options (cc, bcc, attachments, etc.)
        
        Returns:
            EmailResult with success status and message_id or error details
        """
        ...
    
    @abstractmethod
    async def validate_configuration(self) -> bool:
        """Validate the provider configuration.
        
        Checks that credentials are valid and the provider is accessible.
        
        Returns:
            True if configuration is valid, False otherwise
        """
        ...
    
    @abstractmethod
    def get_provider_name(self) -> str:
        """Get the human-readable provider name.
        
        Returns:
            Provider name string
        """
        ...
    
    @abstractmethod
    def get_provider_type(self) -> EmailProviderType:
        """Get the provider type enum.
        
        Returns:
            EmailProviderType enum value
        """
        ...
    
    def translate_error(self, error: Exception) -> tuple[str, str | None]:
        """Translate provider-specific errors to user-friendly messages.
        
        Args:
            error: The exception to translate
        
        Returns:
            Tuple of (user_message, error_code)
        """
        # Default implementation
        return (
            "E-mail kon niet worden verstuurd, probeer later opnieuw",
            str(type(error).__name__),
        )
