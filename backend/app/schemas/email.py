"""Email configuration and sending Pydantic schemas.

Implements STORY-048 (Email provider configureren) and STORY-053 (Email verzenden).
"""

from datetime import datetime
from enum import Enum
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, EmailStr


class EmailProviderType(str, Enum):
    """Supported email providers."""
    
    MAILCHIMP = "mailchimp"
    AMAZON_SES = "amazon_ses"
    SENDGRID = "sendgrid"


class EmailConfigStatus(str, Enum):
    """Email configuration status."""
    
    ACTIVE = "active"
    NOT_CONFIGURED = "not_configured"
    INVALID = "invalid"


class EmailStatus(str, Enum):
    """Email send status."""
    
    QUEUED = "queued"
    SENDING = "sending"
    SENT = "sent"
    FAILED = "failed"
    REJECTED = "rejected"
    BOUNCED = "bounced"


# ----- Configuration Schemas -----

class MailchimpConfigInput(BaseModel):
    """Mailchimp-specific configuration input."""
    
    api_key: str = Field(..., min_length=1, description="Mailchimp/Mandrill API key")


class AmazonSESConfigInput(BaseModel):
    """Amazon SES-specific configuration input."""
    
    access_key_id: str = Field(..., min_length=1, description="AWS Access Key ID")
    secret_access_key: str = Field(..., min_length=1, description="AWS Secret Access Key")
    region: str = Field(default="eu-west-1", description="AWS region (e.g., eu-west-1)")


class SendGridConfigInput(BaseModel):
    """SendGrid-specific configuration input."""
    
    api_key: str = Field(..., min_length=1, description="SendGrid API key")


class EmailConfigurationCreate(BaseModel):
    """Schema for creating/updating email configuration.
    
    Implements STORY-048 acceptance criteria for Settings UI.
    """
    
    provider_type: EmailProviderType = Field(..., description="Selected email provider")
    sender_email: EmailStr = Field(..., description="Sender email address")
    sender_name: str | None = Field(None, description="Sender display name")
    
    # Provider-specific configuration (only one should be set based on provider_type)
    mailchimp_config: MailchimpConfigInput | None = None
    amazon_ses_config: AmazonSESConfigInput | None = None
    sendgrid_config: SendGridConfigInput | None = None


class EmailConfigurationResponse(BaseModel):
    """Schema for email configuration response.
    
    Credentials are masked (only last 4 chars visible).
    """
    
    model_config = ConfigDict(from_attributes=True)
    
    id: UUID
    vve_id: UUID
    provider_type: EmailProviderType
    sender_email: str
    sender_name: str | None
    status: EmailConfigStatus
    is_active: bool
    created_at: datetime
    updated_at: datetime
    
    # Masked credentials
    mailchimp_api_key: str | None = None
    ses_access_key_id: str | None = None
    ses_secret_access_key: str | None = None
    ses_region: str | None = None
    sendgrid_api_key: str | None = None


class EmailTestRequest(BaseModel):
    """Request for testing email configuration."""
    
    test_recipient: EmailStr = Field(..., description="Email address to send test to")


class EmailTestResponse(BaseModel):
    """Response from email configuration test."""
    
    success: bool
    message: str
    message_id: str | None = None
    error_code: str | None = None


# ----- Email Sending Schemas -----

class AttachmentInput(BaseModel):
    """Email attachment input."""
    
    filename: str = Field(..., description="Attachment filename")
    content_base64: str = Field(..., description="Base64 encoded content")
    content_type: str = Field(default="application/octet-stream", description="MIME type")


class EmailSendRequest(BaseModel):
    """Request for sending an email.
    
    Implements STORY-053 acceptance criteria.
    """
    
    to: list[EmailStr] = Field(..., min_length=1, description="Recipient email addresses")
    subject: str = Field(..., min_length=1, max_length=998, description="Email subject")
    body: str = Field(..., min_length=1, description="Email body (HTML or plain text)")
    
    cc: list[EmailStr] = Field(default_factory=list, description="CC recipients")
    bcc: list[EmailStr] = Field(default_factory=list, description="BCC recipients")
    reply_to: EmailStr | None = Field(None, description="Reply-to address")
    is_html: bool = Field(default=True, description="Whether body is HTML")
    attachments: list[AttachmentInput] = Field(default_factory=list, description="Attachments")
    tags: list[str] = Field(default_factory=list, description="Tags for tracking")


class EmailSendResponse(BaseModel):
    """Response from email send request.
    
    Implements STORY-053 status tracking.
    """
    
    success: bool
    message_id: str | None = None
    status: EmailStatus
    error_message: str | None = None
    error_code: str | None = None
    provider: EmailProviderType | None = None
    queued_at: datetime = Field(default_factory=datetime.utcnow)


class EmailStatusQuery(BaseModel):
    """Query for checking email status."""
    
    message_id: str = Field(..., description="Message ID to query")


class EmailStatusResponse(BaseModel):
    """Response with email status."""
    
    message_id: str
    status: EmailStatus
    provider: EmailProviderType | None
    sent_at: datetime | None
    error_message: str | None = None


# ----- Monitoring & Logging Schemas (STORY-054) -----

class EmailLogEntry(BaseModel):
    """Email log entry for monitoring.
    
    Implements STORY-054 - AVG compliant (no email content logged).
    """
    
    model_config = ConfigDict(from_attributes=True)
    
    id: UUID
    vve_id: UUID
    message_id: str | None
    recipient_count: int  # Anonymized count instead of full list
    recipient_preview: str  # Masked preview e.g., "j***@example.com"
    subject: str
    provider: EmailProviderType
    status: EmailStatus
    error_message: str | None
    created_at: datetime


class EmailLogListResponse(BaseModel):
    """Paginated list of email logs."""
    
    items: list[EmailLogEntry]
    total: int
    page: int
    size: int


class EmailLogFilters(BaseModel):
    """Filters for email log queries."""
    
    status: EmailStatus | None = None
    provider: EmailProviderType | None = None
    start_date: datetime | None = None
    end_date: datetime | None = None
    recipient_search: str | None = None


class EmailStatsResponse(BaseModel):
    """Email statistics for dashboard widget.
    
    Implements STORY-054 dashboard requirements.
    """
    
    sent_today: int
    sent_week: int
    sent_month: int
    success_rate: float  # Percentage (0-100)
    failures_count: int
    alert_high_failure: bool = False  # True if >5% failure in last 24h
