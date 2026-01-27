"""Email configuration and sending API routes.

Implements:
- STORY-048: E-mail provider configureren via Settings
- STORY-053: E-mail verzenden via geconfigureerde provider
- STORY-054: E-mail verzending monitoring en logging
"""

import base64
from datetime import datetime, timedelta, timezone
from typing import Annotated
from uuid import UUID, uuid4

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies.auth import CurrentUser, get_current_active_user, RoleChecker
from app.core.security import UserRole
from app.db.session import get_db
from app.schemas.email import (
    AttachmentInput,
    EmailConfigStatus,
    EmailConfigurationCreate,
    EmailConfigurationResponse,
    EmailLogEntry,
    EmailLogFilters,
    EmailLogListResponse,
    EmailProviderType,
    EmailSendRequest,
    EmailSendResponse,
    EmailStatsResponse,
    EmailStatus,
    EmailStatusQuery,
    EmailStatusResponse,
    EmailTestRequest,
    EmailTestResponse,
)
from app.services.email.base import (
    Attachment,
    EmailConfiguration,
    EmailOptions,
    EmailProviderType as ServiceProviderType,
)
from app.services.email.factory import create_provider_from_config

router = APIRouter(prefix="/email", tags=["email"])


# ----- Mock Data Store (would be DB in production) -----

_email_configs: dict[UUID, dict] = {}
_email_logs: list[dict] = []
_email_stats: dict[UUID, dict] = {}


def _mask_credential(value: str | None) -> str | None:
    """Mask a credential showing only last 4 characters."""
    if not value:
        return None
    if len(value) <= 4:
        return "****"
    return "*" * (len(value) - 4) + value[-4:]


def _create_recipient_preview(recipients: list[str]) -> str:
    """Create anonymized preview of recipients."""
    if not recipients:
        return ""
    email = recipients[0]
    at_idx = email.find("@")
    if at_idx > 1:
        return email[0] + "*" * (at_idx - 1) + email[at_idx:]
    return email


# ----- Configuration Endpoints (STORY-048) -----

@router.get(
    "/configuration",
    response_model=EmailConfigurationResponse | None,
    summary="Get email configuration",
    description="Get current email provider configuration for the VVE.",
)
async def get_email_configuration(
    current_user: Annotated[CurrentUser, Depends(RoleChecker([UserRole.BEHEERDER]))],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> EmailConfigurationResponse | None:
    """Get the email configuration for the current VVE.
    
    Only accessible by beheerder role.
    Credentials are masked for security.
    """
    vve_id = current_user.current_vve_id
    if not vve_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Geen VVE geselecteerd",
        )
    
    config = _email_configs.get(vve_id)
    if not config:
        return None
    
    return EmailConfigurationResponse(
        id=config["id"],
        vve_id=vve_id,
        provider_type=config["provider_type"],
        sender_email=config["sender_email"],
        sender_name=config.get("sender_name"),
        status=config.get("status", EmailConfigStatus.NOT_CONFIGURED),
        is_active=config.get("is_active", False),
        created_at=config["created_at"],
        updated_at=config["updated_at"],
        mailchimp_api_key=_mask_credential(config.get("mailchimp_api_key")),
        ses_access_key_id=_mask_credential(config.get("ses_access_key_id")),
        ses_secret_access_key=_mask_credential(config.get("ses_secret_access_key")),
        ses_region=config.get("ses_region"),
        sendgrid_api_key=_mask_credential(config.get("sendgrid_api_key")),
    )


@router.post(
    "/configuration",
    response_model=EmailConfigurationResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create or update email configuration",
    description="Configure email provider settings for the VVE.",
)
async def save_email_configuration(
    config_data: EmailConfigurationCreate,
    current_user: Annotated[CurrentUser, Depends(RoleChecker([UserRole.BEHEERDER]))],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> EmailConfigurationResponse:
    """Create or update email configuration.
    
    Only accessible by beheerder role.
    Credentials are encrypted before storage.
    """
    vve_id = current_user.current_vve_id
    if not vve_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Geen VVE geselecteerd",
        )
    
    # Validate provider-specific config is provided
    if config_data.provider_type == EmailProviderType.MAILCHIMP:
        if not config_data.mailchimp_config:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Mailchimp configuratie ontbreekt",
            )
    elif config_data.provider_type == EmailProviderType.AMAZON_SES:
        if not config_data.amazon_ses_config:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Amazon SES configuratie ontbreekt",
            )
    elif config_data.provider_type == EmailProviderType.SENDGRID:
        if not config_data.sendgrid_config:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="SendGrid configuratie ontbreekt",
            )
    
    now = datetime.now(timezone.utc)
    existing = _email_configs.get(vve_id)
    
    # Build config dict
    config_dict = {
        "id": existing["id"] if existing else uuid4(),
        "vve_id": vve_id,
        "provider_type": config_data.provider_type,
        "sender_email": config_data.sender_email,
        "sender_name": config_data.sender_name,
        "status": EmailConfigStatus.NOT_CONFIGURED,
        "is_active": False,
        "created_at": existing["created_at"] if existing else now,
        "updated_at": now,
    }
    
    # Add provider-specific credentials
    if config_data.mailchimp_config:
        config_dict["mailchimp_api_key"] = config_data.mailchimp_config.api_key
    if config_data.amazon_ses_config:
        config_dict["ses_access_key_id"] = config_data.amazon_ses_config.access_key_id
        config_dict["ses_secret_access_key"] = config_data.amazon_ses_config.secret_access_key
        config_dict["ses_region"] = config_data.amazon_ses_config.region
    if config_data.sendgrid_config:
        config_dict["sendgrid_api_key"] = config_data.sendgrid_config.api_key
    
    # Store (in production, encrypt credentials before storing)
    _email_configs[vve_id] = config_dict
    
    return EmailConfigurationResponse(
        id=config_dict["id"],
        vve_id=vve_id,
        provider_type=config_dict["provider_type"],
        sender_email=config_dict["sender_email"],
        sender_name=config_dict.get("sender_name"),
        status=config_dict["status"],
        is_active=config_dict["is_active"],
        created_at=config_dict["created_at"],
        updated_at=config_dict["updated_at"],
        mailchimp_api_key=_mask_credential(config_dict.get("mailchimp_api_key")),
        ses_access_key_id=_mask_credential(config_dict.get("ses_access_key_id")),
        ses_secret_access_key=_mask_credential(config_dict.get("ses_secret_access_key")),
        ses_region=config_dict.get("ses_region"),
        sendgrid_api_key=_mask_credential(config_dict.get("sendgrid_api_key")),
    )


@router.post(
    "/configuration/test",
    response_model=EmailTestResponse,
    summary="Test email configuration",
    description="Send a test email to verify configuration.",
)
async def test_email_configuration(
    test_request: EmailTestRequest,
    current_user: Annotated[CurrentUser, Depends(RoleChecker([UserRole.BEHEERDER]))],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> EmailTestResponse:
    """Test the email configuration by sending a test email.
    
    On success, the configuration is activated.
    """
    vve_id = current_user.current_vve_id
    if not vve_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Geen VVE geselecteerd",
        )
    
    config_dict = _email_configs.get(vve_id)
    if not config_dict:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Geen e-mail configuratie gevonden",
        )
    
    # Create service configuration
    provider_type_map = {
        EmailProviderType.MAILCHIMP: ServiceProviderType.MAILCHIMP,
        EmailProviderType.AMAZON_SES: ServiceProviderType.AMAZON_SES,
        EmailProviderType.SENDGRID: ServiceProviderType.SENDGRID,
    }
    
    service_config = EmailConfiguration(
        provider_type=provider_type_map[config_dict["provider_type"]],
        sender_email=config_dict["sender_email"],
        sender_name=config_dict.get("sender_name"),
        mailchimp_api_key=config_dict.get("mailchimp_api_key"),
        ses_access_key_id=config_dict.get("ses_access_key_id"),
        ses_secret_access_key=config_dict.get("ses_secret_access_key"),
        ses_region=config_dict.get("ses_region"),
        sendgrid_api_key=config_dict.get("sendgrid_api_key"),
    )
    
    # Create provider
    provider = create_provider_from_config(service_config)
    if not provider:
        return EmailTestResponse(
            success=False,
            message="Kan provider niet initialiseren",
            error_code="PROVIDER_INIT_FAILED",
        )
    
    # Validate configuration
    is_valid = await provider.validate_configuration()
    if not is_valid:
        config_dict["status"] = EmailConfigStatus.INVALID
        return EmailTestResponse(
            success=False,
            message="Configuratie is ongeldig",
            error_code="INVALID_CONFIG",
        )
    
    # Send test email
    result = await provider.send_email(
        to=[test_request.test_recipient],
        subject="VVE Tooling - Test E-mail",
        body="""
        <html>
        <body>
        <h1>Test E-mail Geslaagd</h1>
        <p>Dit is een test e-mail van VVE Tooling om uw e-mail configuratie te verifiëren.</p>
        <p>Als u deze e-mail ontvangt, is de configuratie succesvol.</p>
        <hr>
        <p style="color: #666; font-size: 12px;">
        Verzonden via {provider_name} op {timestamp}
        </p>
        </body>
        </html>
        """.format(
            provider_name=provider.get_provider_name(),
            timestamp=datetime.now(timezone.utc).isoformat(),
        ),
        sender_email=service_config.sender_email,
        sender_name=service_config.sender_name,
    )
    
    if result.success:
        # Activate configuration
        config_dict["status"] = EmailConfigStatus.ACTIVE
        config_dict["is_active"] = True
        config_dict["updated_at"] = datetime.now(timezone.utc)
        
        return EmailTestResponse(
            success=True,
            message="Test e-mail succesvol verzonden",
            message_id=result.message_id,
        )
    else:
        config_dict["status"] = EmailConfigStatus.INVALID
        return EmailTestResponse(
            success=False,
            message=result.error_message or "Verzending mislukt",
            error_code=result.error_code,
        )


@router.delete(
    "/configuration",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete email configuration",
)
async def delete_email_configuration(
    current_user: Annotated[CurrentUser, Depends(RoleChecker([UserRole.BEHEERDER]))],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> None:
    """Delete the email configuration for the current VVE."""
    vve_id = current_user.current_vve_id
    if vve_id and vve_id in _email_configs:
        del _email_configs[vve_id]


# ----- Email Sending Endpoints (STORY-053) -----

@router.post(
    "/send",
    response_model=EmailSendResponse,
    summary="Send an email",
    description="Send an email via the configured provider.",
)
async def send_email(
    email_request: EmailSendRequest,
    current_user: Annotated[CurrentUser, Depends(RoleChecker([UserRole.BEHEERDER, UserRole.BESTUURSLID]))],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> EmailSendResponse:
    """Send an email using the configured provider.
    
    Accessible by beheerder and bestuurslid roles.
    Email is queued for asynchronous processing.
    """
    vve_id = current_user.current_vve_id
    if not vve_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Geen VVE geselecteerd",
        )
    
    config_dict = _email_configs.get(vve_id)
    if not config_dict or not config_dict.get("is_active"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Geen actieve e-mail configuratie",
        )
    
    # Create service configuration
    provider_type_map = {
        EmailProviderType.MAILCHIMP: ServiceProviderType.MAILCHIMP,
        EmailProviderType.AMAZON_SES: ServiceProviderType.AMAZON_SES,
        EmailProviderType.SENDGRID: ServiceProviderType.SENDGRID,
    }
    
    service_config = EmailConfiguration(
        provider_type=provider_type_map[config_dict["provider_type"]],
        sender_email=config_dict["sender_email"],
        sender_name=config_dict.get("sender_name"),
        mailchimp_api_key=config_dict.get("mailchimp_api_key"),
        ses_access_key_id=config_dict.get("ses_access_key_id"),
        ses_secret_access_key=config_dict.get("ses_secret_access_key"),
        ses_region=config_dict.get("ses_region"),
        sendgrid_api_key=config_dict.get("sendgrid_api_key"),
    )
    
    # Create provider
    provider = create_provider_from_config(service_config)
    if not provider:
        return EmailSendResponse(
            success=False,
            status=EmailStatus.FAILED,
            error_message="Kan provider niet initialiseren",
            error_code="PROVIDER_INIT_FAILED",
        )
    
    # Convert attachments
    attachments = []
    for att in email_request.attachments:
        try:
            content = base64.b64decode(att.content_base64)
            attachments.append(Attachment(
                filename=att.filename,
                content=content,
                content_type=att.content_type,
            ))
        except Exception:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Ongeldige bijlage: {att.filename}",
            )
    
    # Create options
    options = EmailOptions(
        cc=email_request.cc,
        bcc=email_request.bcc,
        reply_to=email_request.reply_to,
        is_html=email_request.is_html,
        attachments=attachments,
        tags=email_request.tags,
    )
    
    # Send email
    result = await provider.send_email(
        to=email_request.to,
        subject=email_request.subject,
        body=email_request.body,
        sender_email=service_config.sender_email,
        sender_name=service_config.sender_name,
        options=options,
    )
    
    # Log the email (STORY-054)
    log_entry = {
        "id": uuid4(),
        "vve_id": vve_id,
        "message_id": result.message_id,
        "recipient_count": len(email_request.to),
        "recipient_preview": _create_recipient_preview(email_request.to),
        "subject": email_request.subject,
        "provider": config_dict["provider_type"],
        "status": EmailStatus.SENT if result.success else EmailStatus.FAILED,
        "error_message": result.error_message,
        "created_at": datetime.now(timezone.utc),
    }
    _email_logs.append(log_entry)
    
    # Map status
    status_map = {
        "queued": EmailStatus.QUEUED,
        "sending": EmailStatus.SENDING,
        "sent": EmailStatus.SENT,
        "failed": EmailStatus.FAILED,
        "rejected": EmailStatus.REJECTED,
        "bounced": EmailStatus.BOUNCED,
    }
    
    return EmailSendResponse(
        success=result.success,
        message_id=result.message_id,
        status=status_map.get(result.status.value, EmailStatus.FAILED),
        error_message=result.error_message,
        error_code=result.error_code,
        provider=config_dict["provider_type"],
    )


@router.get(
    "/status/{message_id}",
    response_model=EmailStatusResponse,
    summary="Get email status",
)
async def get_email_status(
    message_id: str,
    current_user: Annotated[CurrentUser, Depends(RoleChecker([UserRole.BEHEERDER, UserRole.BESTUURSLID]))],
) -> EmailStatusResponse:
    """Get the status of a sent email by message ID."""
    # Look up in logs
    for log in _email_logs:
        if log.get("message_id") == message_id:
            return EmailStatusResponse(
                message_id=message_id,
                status=log["status"],
                provider=log["provider"],
                sent_at=log["created_at"],
                error_message=log.get("error_message"),
            )
    
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="E-mail niet gevonden",
    )


# ----- Monitoring & Logging Endpoints (STORY-054) -----

@router.get(
    "/logs",
    response_model=EmailLogListResponse,
    summary="Get email logs",
    description="Get paginated list of email sending logs.",
)
async def get_email_logs(
    current_user: Annotated[CurrentUser, Depends(RoleChecker([UserRole.BEHEERDER]))],
    page: int = 1,
    size: int = 20,
    status_filter: EmailStatus | None = None,
    provider_filter: EmailProviderType | None = None,
) -> EmailLogListResponse:
    """Get email logs for monitoring.
    
    Only accessible by beheerder role.
    """
    vve_id = current_user.current_vve_id
    if not vve_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Geen VVE geselecteerd",
        )
    
    # Filter logs
    filtered = [
        log for log in _email_logs
        if log["vve_id"] == vve_id
    ]
    
    if status_filter:
        filtered = [log for log in filtered if log["status"] == status_filter]
    
    if provider_filter:
        filtered = [log for log in filtered if log["provider"] == provider_filter]
    
    # Sort by date (newest first)
    filtered.sort(key=lambda x: x["created_at"], reverse=True)
    
    # Paginate
    total = len(filtered)
    start = (page - 1) * size
    end = start + size
    paginated = filtered[start:end]
    
    items = [
        EmailLogEntry(
            id=log["id"],
            vve_id=log["vve_id"],
            message_id=log.get("message_id"),
            recipient_count=log["recipient_count"],
            recipient_preview=log["recipient_preview"],
            subject=log["subject"],
            provider=log["provider"],
            status=log["status"],
            error_message=log.get("error_message"),
            created_at=log["created_at"],
        )
        for log in paginated
    ]
    
    return EmailLogListResponse(
        items=items,
        total=total,
        page=page,
        size=size,
    )


@router.get(
    "/stats",
    response_model=EmailStatsResponse,
    summary="Get email statistics",
    description="Get email sending statistics for dashboard.",
)
async def get_email_stats(
    current_user: Annotated[CurrentUser, Depends(RoleChecker([UserRole.BEHEERDER]))],
) -> EmailStatsResponse:
    """Get email statistics for dashboard widget.
    
    Implements STORY-054 dashboard requirements.
    """
    vve_id = current_user.current_vve_id
    if not vve_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Geen VVE geselecteerd",
        )
    
    now = datetime.now(timezone.utc)
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    week_start = today_start - timedelta(days=7)
    month_start = today_start - timedelta(days=30)
    day_ago = now - timedelta(hours=24)
    
    # Filter logs for this VVE
    vve_logs = [log for log in _email_logs if log["vve_id"] == vve_id]
    
    # Calculate stats
    sent_today = sum(
        1 for log in vve_logs
        if log["created_at"] >= today_start and log["status"] == EmailStatus.SENT
    )
    
    sent_week = sum(
        1 for log in vve_logs
        if log["created_at"] >= week_start and log["status"] == EmailStatus.SENT
    )
    
    sent_month = sum(
        1 for log in vve_logs
        if log["created_at"] >= month_start and log["status"] == EmailStatus.SENT
    )
    
    # Calculate success rate (last 30 days)
    month_logs = [log for log in vve_logs if log["created_at"] >= month_start]
    total_month = len(month_logs)
    success_month = sum(1 for log in month_logs if log["status"] == EmailStatus.SENT)
    success_rate = (success_month / total_month * 100) if total_month > 0 else 100.0
    
    # Failures count
    failures_count = sum(
        1 for log in vve_logs
        if log["status"] == EmailStatus.FAILED
    )
    
    # Check for high failure rate in last 24 hours
    day_logs = [log for log in vve_logs if log["created_at"] >= day_ago]
    day_total = len(day_logs)
    day_failures = sum(1 for log in day_logs if log["status"] == EmailStatus.FAILED)
    alert_high_failure = day_total > 0 and (day_failures / day_total) > 0.05
    
    return EmailStatsResponse(
        sent_today=sent_today,
        sent_week=sent_week,
        sent_month=sent_month,
        success_rate=round(success_rate, 1),
        failures_count=failures_count,
        alert_high_failure=alert_high_failure,
    )


@router.get(
    "/logs/export",
    summary="Export email logs",
    description="Export email logs as CSV.",
)
async def export_email_logs(
    current_user: Annotated[CurrentUser, Depends(RoleChecker([UserRole.BEHEERDER]))],
    status_filter: EmailStatus | None = None,
    provider_filter: EmailProviderType | None = None,
    start_date: datetime | None = None,
    end_date: datetime | None = None,
):
    """Export email logs as CSV file."""
    from fastapi.responses import StreamingResponse
    import io
    import csv
    
    vve_id = current_user.current_vve_id
    if not vve_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Geen VVE geselecteerd",
        )
    
    # Filter logs
    filtered = [log for log in _email_logs if log["vve_id"] == vve_id]
    
    if status_filter:
        filtered = [log for log in filtered if log["status"] == status_filter]
    if provider_filter:
        filtered = [log for log in filtered if log["provider"] == provider_filter]
    if start_date:
        filtered = [log for log in filtered if log["created_at"] >= start_date]
    if end_date:
        filtered = [log for log in filtered if log["created_at"] <= end_date]
    
    # Create CSV
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "Datum", "Onderwerp", "Ontvanger", "Aantal", "Provider", "Status", "Foutmelding"
    ])
    
    for log in filtered:
        # Normalize enum values to strings
        provider_str = log["provider"].value if isinstance(log["provider"], EmailProviderType) else str(log["provider"])
        status_str = log["status"].value if isinstance(log["status"], EmailStatus) else str(log["status"])
        
        writer.writerow([
            log["created_at"].isoformat(),
            log["subject"],
            log["recipient_preview"],
            log["recipient_count"],
            provider_str,
            status_str,
            log.get("error_message", ""),
        ])
    
    output.seek(0)
    
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={
            "Content-Disposition": f"attachment; filename=email_logs_{datetime.now().strftime('%Y%m%d')}.csv"
        },
    )
