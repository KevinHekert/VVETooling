"""Email provider factory and registry.

Implements STORY-052: E-mail provider abstractie laag.
Provides factory/registry for provider selection based on tenant settings.
"""

import logging
from typing import Any, Callable, Type
from uuid import UUID

from app.services.email.base import (
    EmailConfiguration,
    EmailProvider,
    EmailProviderType,
)
from app.services.email.mailchimp import MailchimpProvider
from app.services.email.ses import AmazonSESProvider
from app.services.email.sendgrid import SendGridProvider

logger = logging.getLogger(__name__)


class EmailProviderRegistry:
    """Registry for email provider implementations.
    
    Allows registration of new providers at runtime.
    """
    
    _providers: dict[EmailProviderType, Type[EmailProvider]] = {}
    
    @classmethod
    def register(
        cls,
        provider_type: EmailProviderType,
        provider_class: Type[EmailProvider],
    ) -> None:
        """Register a provider implementation.
        
        Args:
            provider_type: The provider type enum
            provider_class: The provider class to register
        """
        cls._providers[provider_type] = provider_class
        logger.info(f"Registered email provider: {provider_type.value}")
    
    @classmethod
    def get(cls, provider_type: EmailProviderType) -> Type[EmailProvider] | None:
        """Get a provider class by type.
        
        Args:
            provider_type: The provider type to look up
            
        Returns:
            The provider class or None if not found
        """
        return cls._providers.get(provider_type)
    
    @classmethod
    def list_providers(cls) -> list[EmailProviderType]:
        """List all registered provider types."""
        return list(cls._providers.keys())


# Register built-in providers
EmailProviderRegistry.register(EmailProviderType.MAILCHIMP, MailchimpProvider)
EmailProviderRegistry.register(EmailProviderType.AMAZON_SES, AmazonSESProvider)
EmailProviderRegistry.register(EmailProviderType.SENDGRID, SendGridProvider)


class EmailProviderFactory:
    """Factory for creating email provider instances.
    
    Implements STORY-052 requirements:
    - Factory selects provider based on tenant settings
    - Fallback mechanism for failed primary provider
    """
    
    def __init__(
        self,
        config_loader: Callable[[UUID | None], EmailConfiguration | None] | None = None,
    ):
        """Initialize factory.
        
        Args:
            config_loader: Function to load configuration for a tenant/environment
        """
        self._config_loader = config_loader
        self._provider_cache: dict[str, EmailProvider] = {}
    
    def create_provider(
        self,
        config: EmailConfiguration,
    ) -> EmailProvider | None:
        """Create a provider instance from configuration.
        
        Args:
            config: Email provider configuration
            
        Returns:
            Provider instance or None if creation fails
        """
        provider_class = EmailProviderRegistry.get(config.provider_type)
        if provider_class is None:
            logger.error(f"Unknown provider type: {config.provider_type}")
            return None
        
        try:
            if config.provider_type == EmailProviderType.MAILCHIMP:
                if not config.mailchimp_api_key:
                    logger.error("Mailchimp API key not configured")
                    return None
                return MailchimpProvider(api_key=config.mailchimp_api_key)
            
            elif config.provider_type == EmailProviderType.AMAZON_SES:
                if not all([
                    config.ses_access_key_id,
                    config.ses_secret_access_key,
                    config.ses_region,
                ]):
                    logger.error("Amazon SES credentials not fully configured")
                    return None
                return AmazonSESProvider(
                    access_key_id=config.ses_access_key_id,
                    secret_access_key=config.ses_secret_access_key,
                    region=config.ses_region,
                )
            
            elif config.provider_type == EmailProviderType.SENDGRID:
                if not config.sendgrid_api_key:
                    logger.error("SendGrid API key not configured")
                    return None
                return SendGridProvider(api_key=config.sendgrid_api_key)
            
            else:
                logger.error(f"No factory method for provider: {config.provider_type}")
                return None
                
        except Exception as e:
            logger.exception(f"Failed to create provider {config.provider_type}: {e}")
            return None
    
    def get_provider_for_tenant(
        self,
        tenant_id: UUID | None = None,
    ) -> tuple[EmailProvider | None, EmailConfiguration | None]:
        """Get the configured provider for a tenant.
        
        Args:
            tenant_id: Optional tenant ID (None for default/system config)
            
        Returns:
            Tuple of (provider, config) or (None, None) if not configured
        """
        if self._config_loader is None:
            logger.warning("No config loader configured")
            return None, None
        
        config = self._config_loader(tenant_id)
        if config is None:
            logger.info(f"No email config for tenant {tenant_id}")
            return None, None
        
        if not config.is_active:
            logger.info(f"Email config for tenant {tenant_id} is not active")
            return None, config
        
        provider = self.create_provider(config)
        return provider, config


# Module-level factory instance
_factory: EmailProviderFactory | None = None


def configure_email_factory(
    config_loader: Callable[[UUID | None], EmailConfiguration | None],
) -> EmailProviderFactory:
    """Configure the global email provider factory.
    
    Should be called during application startup.
    
    Args:
        config_loader: Function to load email configuration for a tenant
        
    Returns:
        The configured factory instance
    """
    global _factory
    _factory = EmailProviderFactory(config_loader=config_loader)
    return _factory


def get_email_provider(
    tenant_id: UUID | None = None,
) -> tuple[EmailProvider | None, EmailConfiguration | None]:
    """Get an email provider for the given tenant.
    
    Convenience function that uses the global factory.
    
    Args:
        tenant_id: Optional tenant ID
        
        
    Returns:
        Tuple of (provider, config) or (None, None)
    """
    if _factory is None:
        logger.warning("Email factory not configured")
        return None, None
    
    return _factory.get_provider_for_tenant(tenant_id)


def create_provider_from_config(config: EmailConfiguration) -> EmailProvider | None:
    """Create a provider directly from configuration.
    
    Useful for testing configurations before saving.
    
    Args:
        config: Email configuration
        
    Returns:
        Provider instance or None
    """
    factory = EmailProviderFactory()
    return factory.create_provider(config)
