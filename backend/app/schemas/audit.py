"""Audit Log Pydantic schemas.

Implements FEAT-015 (Audit Logging) and STORY-010 (Audit logging zichtbaar in UI).
Implements STORY-023: Audit logging filters en export.
"""

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class AuditLogBase(BaseModel):
    """Base schema for audit log."""
    
    action: str = Field(..., description="Type of action performed")
    entity_type: str = Field(..., description="Type of entity affected")
    entity_id: str | None = Field(None, description="ID of the affected entity")


class AuditLogCreate(AuditLogBase):
    """Schema for creating an audit log entry."""
    
    vve_id: UUID | None = None
    user_id: UUID | None = None
    old_values: str | None = None
    new_values: str | None = None
    ip_address: str | None = None
    user_agent: str | None = None
    is_financial: bool = False


class AuditLogResponse(BaseModel):
    """Schema for audit log response."""
    
    model_config = ConfigDict(from_attributes=True)
    
    id: UUID
    vve_id: UUID | None
    user_id: UUID | None
    user_name: str | None = None
    action: str
    entity_type: str
    entity_id: str | None
    old_values: str | None = None
    new_values: str | None = None
    ip_address: str | None = None
    is_financial: bool
    created_at: datetime
    result: str = "success"  # Status of the action (success/failed)


class AuditLogListResponse(BaseModel):
    """Paginated list of audit logs."""
    
    items: list[AuditLogResponse]
    total: int
    page: int
    size: int


class AuditLogFilters(BaseModel):
    """Filters for audit log queries."""
    
    action: str | None = None
    entity_type: str | None = None
    user_id: UUID | None = None
    start_date: datetime | None = None
    end_date: datetime | None = None
    is_financial: bool | None = None


# STORY-023: Export schemas
class AuditLogExportRequest(BaseModel):
    """Request for audit log export."""
    
    format: str = Field(default="csv", description="Export format: csv or pdf")
    action: str | None = Field(None, description="Filter by action type")
    entity_type: str | None = Field(None, description="Filter by entity type")
    user_id: UUID | None = Field(None, description="Filter by user ID")
    start_date: datetime | None = Field(None, description="Filter from date")
    end_date: datetime | None = Field(None, description="Filter to date")
    is_financial: bool | None = Field(None, description="Filter financial actions only")


class AuditLogExportResponse(BaseModel):
    """Response for audit log export preparation."""
    
    export_id: UUID
    format: str
    record_count: int
    file_size_estimate: str
    download_url: str
    expires_at: datetime
