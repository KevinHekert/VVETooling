"""Tests for email provider abstraction layer.

Tests STORY-052: E-mail provider abstractie laag.
"""

import pytest
from uuid import uuid4

from app.services.email.base import (
    Attachment,
    EmailConfiguration,
    EmailMessage,
    EmailOptions,
    EmailProviderType,
    EmailResult,
    EmailStatus,
)
from app.services.email.factory import (
    EmailProviderFactory,
    EmailProviderRegistry,
    create_provider_from_config,
)
from app.services.email.mailchimp import MailchimpProvider
from app.services.email.ses import AmazonSESProvider
from app.services.email.sendgrid import SendGridProvider


class TestEmailResult:
    """Tests for EmailResult dataclass."""

    def test_success_result_creation(self):
        """Test creating a successful result."""
        result = EmailResult.success_result(
            message_id="msg-123",
            provider=EmailProviderType.SENDGRID,
        )
        
        assert result.success is True
        assert result.message_id == "msg-123"
        assert result.provider == EmailProviderType.SENDGRID
        assert result.status == EmailStatus.SENT
        assert result.error_message is None

    def test_failure_result_creation(self):
        """Test creating a failed result."""
        result = EmailResult.failure_result(
            error_message="Connection failed",
            error_code="CONN_ERROR",
            provider=EmailProviderType.MAILCHIMP,
        )
        
        assert result.success is False
        assert result.error_message == "Connection failed"
        assert result.error_code == "CONN_ERROR"
        assert result.provider == EmailProviderType.MAILCHIMP
        assert result.status == EmailStatus.FAILED


class TestEmailOptions:
    """Tests for EmailOptions dataclass."""

    def test_default_options(self):
        """Test default email options."""
        options = EmailOptions()
        
        assert options.cc == []
        assert options.bcc == []
        assert options.reply_to is None
        assert options.attachments == []
        assert options.is_html is True
        assert options.tags == []

    def test_custom_options(self):
        """Test email options with custom values."""
        attachment = Attachment(
            filename="test.pdf",
            content=b"PDF content",
            content_type="application/pdf",
        )
        
        options = EmailOptions(
            cc=["cc@example.com"],
            bcc=["bcc@example.com"],
            reply_to="reply@example.com",
            attachments=[attachment],
            is_html=False,
            tags=["invoice", "automated"],
        )
        
        assert len(options.cc) == 1
        assert len(options.bcc) == 1
        assert options.reply_to == "reply@example.com"
        assert len(options.attachments) == 1
        assert options.is_html is False
        assert len(options.tags) == 2


class TestEmailConfiguration:
    """Tests for EmailConfiguration dataclass."""

    def test_mailchimp_config(self):
        """Test Mailchimp configuration."""
        config = EmailConfiguration(
            provider_type=EmailProviderType.MAILCHIMP,
            sender_email="sender@vve.nl",
            sender_name="VVE Admin",
            mailchimp_api_key="mc-abcdef123456",
        )
        
        assert config.provider_type == EmailProviderType.MAILCHIMP
        assert config.sender_email == "sender@vve.nl"
        assert config.mailchimp_api_key is not None

    def test_ses_config(self):
        """Test Amazon SES configuration."""
        config = EmailConfiguration(
            provider_type=EmailProviderType.AMAZON_SES,
            sender_email="sender@vve.nl",
            ses_access_key_id="AKIAIOSFODNN7EXAMPLE",
            ses_secret_access_key="wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY",
            ses_region="eu-west-1",
        )
        
        assert config.provider_type == EmailProviderType.AMAZON_SES
        assert config.ses_region == "eu-west-1"

    def test_sendgrid_config(self):
        """Test SendGrid configuration."""
        config = EmailConfiguration(
            provider_type=EmailProviderType.SENDGRID,
            sender_email="sender@vve.nl",
            sendgrid_api_key="SG.abcdef123456",
        )
        
        assert config.provider_type == EmailProviderType.SENDGRID
        assert config.sendgrid_api_key is not None

    def test_mask_credentials(self):
        """Test credential masking for display."""
        config = EmailConfiguration(
            provider_type=EmailProviderType.MAILCHIMP,
            sender_email="sender@vve.nl",
            mailchimp_api_key="mc-abcdef123456789",
        )
        
        masked = config.mask_credentials()
        
        assert masked["sender_email"] == "sender@vve.nl"
        # API key should be masked, showing only last 4 chars
        assert masked["mailchimp_api_key"].endswith("6789")
        assert "*" in masked["mailchimp_api_key"]


class TestEmailProviderRegistry:
    """Tests for EmailProviderRegistry."""

    def test_builtin_providers_registered(self):
        """Test that built-in providers are registered."""
        providers = EmailProviderRegistry.list_providers()
        
        assert EmailProviderType.MAILCHIMP in providers
        assert EmailProviderType.AMAZON_SES in providers
        assert EmailProviderType.SENDGRID in providers

    def test_get_mailchimp_provider(self):
        """Test getting Mailchimp provider class."""
        provider_class = EmailProviderRegistry.get(EmailProviderType.MAILCHIMP)
        
        assert provider_class == MailchimpProvider

    def test_get_ses_provider(self):
        """Test getting SES provider class."""
        provider_class = EmailProviderRegistry.get(EmailProviderType.AMAZON_SES)
        
        assert provider_class == AmazonSESProvider

    def test_get_sendgrid_provider(self):
        """Test getting SendGrid provider class."""
        provider_class = EmailProviderRegistry.get(EmailProviderType.SENDGRID)
        
        assert provider_class == SendGridProvider


class TestEmailProviderFactory:
    """Tests for EmailProviderFactory."""

    def test_create_mailchimp_provider(self):
        """Test creating Mailchimp provider from config."""
        config = EmailConfiguration(
            provider_type=EmailProviderType.MAILCHIMP,
            sender_email="sender@vve.nl",
            mailchimp_api_key="mc-test-key",
        )
        
        provider = create_provider_from_config(config)
        
        assert provider is not None
        assert isinstance(provider, MailchimpProvider)
        assert provider.get_provider_name() == "Mailchimp"
        assert provider.get_provider_type() == EmailProviderType.MAILCHIMP

    def test_create_ses_provider(self):
        """Test creating SES provider from config."""
        config = EmailConfiguration(
            provider_type=EmailProviderType.AMAZON_SES,
            sender_email="sender@vve.nl",
            ses_access_key_id="AKIAIOSFODNN7EXAMPLE",
            ses_secret_access_key="secret",
            ses_region="eu-west-1",
        )
        
        provider = create_provider_from_config(config)
        
        assert provider is not None
        assert isinstance(provider, AmazonSESProvider)
        assert provider.get_provider_name() == "Amazon SES"
        assert provider.get_provider_type() == EmailProviderType.AMAZON_SES

    def test_create_sendgrid_provider(self):
        """Test creating SendGrid provider from config."""
        config = EmailConfiguration(
            provider_type=EmailProviderType.SENDGRID,
            sender_email="sender@vve.nl",
            sendgrid_api_key="SG.test-key",
        )
        
        provider = create_provider_from_config(config)
        
        assert provider is not None
        assert isinstance(provider, SendGridProvider)
        assert provider.get_provider_name() == "SendGrid"
        assert provider.get_provider_type() == EmailProviderType.SENDGRID

    def test_create_provider_missing_credentials(self):
        """Test that missing credentials returns None."""
        config = EmailConfiguration(
            provider_type=EmailProviderType.MAILCHIMP,
            sender_email="sender@vve.nl",
            # Missing mailchimp_api_key
        )
        
        provider = create_provider_from_config(config)
        
        assert provider is None

    def test_create_ses_provider_partial_credentials(self):
        """Test that partial SES credentials returns None."""
        config = EmailConfiguration(
            provider_type=EmailProviderType.AMAZON_SES,
            sender_email="sender@vve.nl",
            ses_access_key_id="AKIAIOSFODNN7EXAMPLE",
            # Missing secret key and region
        )
        
        provider = create_provider_from_config(config)
        
        assert provider is None

    def test_factory_with_config_loader(self):
        """Test factory with custom config loader."""
        test_config = EmailConfiguration(
            provider_type=EmailProviderType.SENDGRID,
            sender_email="sender@vve.nl",
            sendgrid_api_key="SG.loader-test",
            is_active=True,
        )
        
        def config_loader(tenant_id):
            return test_config
        
        factory = EmailProviderFactory(config_loader=config_loader)
        provider, config = factory.get_provider_for_tenant(uuid4())
        
        assert provider is not None
        assert config is not None
        assert config.is_active is True

    def test_factory_inactive_config(self):
        """Test that inactive config returns None provider."""
        test_config = EmailConfiguration(
            provider_type=EmailProviderType.SENDGRID,
            sender_email="sender@vve.nl",
            sendgrid_api_key="SG.test",
            is_active=False,
        )
        
        def config_loader(tenant_id):
            return test_config
        
        factory = EmailProviderFactory(config_loader=config_loader)
        provider, config = factory.get_provider_for_tenant(uuid4())
        
        assert provider is None
        assert config is not None
        assert config.is_active is False


class TestMailchimpProvider:
    """Tests for MailchimpProvider."""

    def test_provider_properties(self):
        """Test provider name and type."""
        provider = MailchimpProvider(api_key="mc-test")
        
        assert provider.get_provider_name() == "Mailchimp"
        assert provider.get_provider_type() == EmailProviderType.MAILCHIMP

    def test_translate_error_invalid_key(self):
        """Test error translation for invalid key."""
        from app.services.email.mailchimp import MailchimpError
        
        provider = MailchimpProvider(api_key="mc-test")
        error = MailchimpError("Invalid key", code="Invalid_Key")
        
        message, code = provider.translate_error(error)
        
        assert "Ongeldige API sleutel" in message
        assert code == "INVALID_KEY"


class TestAmazonSESProvider:
    """Tests for AmazonSESProvider."""

    def test_provider_properties(self):
        """Test provider name and type."""
        provider = AmazonSESProvider(
            access_key_id="AKIAIOSFODNN7EXAMPLE",
            secret_access_key="secret",
            region="eu-west-1",
        )
        
        assert provider.get_provider_name() == "Amazon SES"
        assert provider.get_provider_type() == EmailProviderType.AMAZON_SES

    def test_region_configuration(self):
        """Test that region is properly configured."""
        provider = AmazonSESProvider(
            access_key_id="AKIAIOSFODNN7EXAMPLE",
            secret_access_key="secret",
            region="us-east-1",
        )
        
        assert provider.region == "us-east-1"


class TestSendGridProvider:
    """Tests for SendGridProvider."""

    def test_provider_properties(self):
        """Test provider name and type."""
        provider = SendGridProvider(api_key="SG.test")
        
        assert provider.get_provider_name() == "SendGrid"
        assert provider.get_provider_type() == EmailProviderType.SENDGRID

    def test_format_attachments(self):
        """Test attachment formatting for SendGrid API."""
        attachments = [
            Attachment(
                filename="test.pdf",
                content=b"PDF content here",
                content_type="application/pdf",
            ),
        ]
        
        formatted = SendGridProvider._format_attachments(attachments)
        
        assert len(formatted) == 1
        assert formatted[0]["filename"] == "test.pdf"
        assert formatted[0]["type"] == "application/pdf"
        assert formatted[0]["disposition"] == "attachment"
        # Content should be base64 encoded
        assert formatted[0]["content"] is not None


class TestEmailMessage:
    """Tests for EmailMessage dataclass."""

    def test_message_creation(self):
        """Test creating an email message."""
        message = EmailMessage(
            to=["recipient@example.com"],
            subject="Test Subject",
            body="<p>Hello World</p>",
            sender_email="sender@vve.nl",
            sender_name="VVE Admin",
        )
        
        assert message.to == ["recipient@example.com"]
        assert message.subject == "Test Subject"
        assert message.sender_email == "sender@vve.nl"
        assert message.id is not None

    def test_message_with_options(self):
        """Test creating message with custom options."""
        options = EmailOptions(
            cc=["cc@example.com"],
            is_html=True,
        )
        
        message = EmailMessage(
            to=["recipient@example.com"],
            subject="Test",
            body="Content",
            sender_email="sender@vve.nl",
            options=options,
        )
        
        assert len(message.options.cc) == 1
        assert message.options.is_html is True
