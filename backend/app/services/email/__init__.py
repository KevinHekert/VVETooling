"""Email services module for VVE Tooling.

Implements EPIC-012 (E-mail Integraties).
Provides provider-agnostic email sending abstraction.
"""

from app.services.email.base import EmailProvider, EmailResult, EmailOptions
from app.services.email.factory import EmailProviderFactory, get_email_provider
from app.services.email.mailchimp import MailchimpProvider
from app.services.email.ses import AmazonSESProvider
from app.services.email.sendgrid import SendGridProvider

__all__ = [
    "EmailProvider",
    "EmailResult",
    "EmailOptions",
    "EmailProviderFactory",
    "get_email_provider",
    "MailchimpProvider",
    "AmazonSESProvider",
    "SendGridProvider",
]
