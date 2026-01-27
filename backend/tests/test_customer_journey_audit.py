"""Tests for Customer Journey: Audit Logging.

Based on customer journeys:
- Security requirement: Audit trail van transacties
- STORY-010: Audit logging zichtbaar in UI
- STORY-023: Audit logging filters en export

Customer journey touchpoints:
- 3.4 Voorzitter: "Zien wie wat heeft gedaan"
- 5.2 Penningmeester Corrigeert Fout: "Audit trail"
"""

import uuid
from datetime import datetime, timezone, timedelta

import pytest

from app.schemas.audit import (
    AuditLogBase,
    AuditLogCreate,
    AuditLogResponse,
    AuditLogListResponse,
    AuditLogFilters,
    AuditLogExportRequest,
    AuditLogExportResponse,
)


class TestAuditLogCreationJourney:
    """Tests for Audit Log Creation."""

    def test_audit_log_base(self):
        """Test base audit log schema."""
        log = AuditLogBase(
            action="create",
            entity_type="transaction",
            entity_id="txn-12345",
        )
        
        assert log.action == "create"
        assert log.entity_type == "transaction"
        assert log.entity_id == "txn-12345"

    def test_audit_log_create_complete(self):
        """Test creating complete audit log entry."""
        log = AuditLogCreate(
            action="update",
            entity_type="transaction",
            entity_id="txn-67890",
            vve_id=uuid.uuid4(),
            user_id=uuid.uuid4(),
            old_values='{"amount": "100.00"}',
            new_values='{"amount": "150.00"}',
            ip_address="192.168.1.100",
            user_agent="Mozilla/5.0",
            is_financial=True,
        )
        
        assert log.action == "update"
        assert log.is_financial is True
        assert log.ip_address == "192.168.1.100"

    def test_audit_log_create_minimal(self):
        """Test creating minimal audit log entry."""
        log = AuditLogCreate(
            action="login",
            entity_type="user",
        )
        
        assert log.action == "login"
        assert log.vve_id is None
        assert log.is_financial is False

    def test_audit_log_financial_flag(self):
        """Test financial transaction flagging."""
        log = AuditLogCreate(
            action="create",
            entity_type="transaction",
            entity_id="txn-001",
            is_financial=True,
        )
        
        assert log.is_financial is True


class TestAuditLogResponseJourney:
    """Tests for Audit Log Response (STORY-010).
    
    Shows: gebruiker, rol, actie, timestamp, resultaat
    """

    def test_audit_log_response_complete(self):
        """Test complete audit log response."""
        now = datetime.now(timezone.utc)
        
        response = AuditLogResponse(
            id=uuid.uuid4(),
            vve_id=uuid.uuid4(),
            user_id=uuid.uuid4(),
            user_name="Jan Penningmeester",
            action="create",
            entity_type="transaction",
            entity_id="txn-12345",
            old_values=None,
            new_values='{"amount": "250.00", "category": "contribution"}',
            ip_address="192.168.1.100",
            is_financial=True,
            created_at=now,
            result="success",
        )
        
        assert response.user_name == "Jan Penningmeester"
        assert response.action == "create"
        assert response.result == "success"
        assert response.is_financial is True

    def test_audit_log_response_system_action(self):
        """Test system action without user."""
        now = datetime.now(timezone.utc)
        
        response = AuditLogResponse(
            id=uuid.uuid4(),
            vve_id=None,
            user_id=None,
            user_name=None,
            action="scheduled_backup",
            entity_type="system",
            entity_id=None,
            is_financial=False,
            created_at=now,
        )
        
        assert response.user_name is None
        assert response.entity_type == "system"


class TestAuditLogListResponseJourney:
    """Tests for Audit Log List Response with pagination."""

    def test_audit_log_list_response(self):
        """Test paginated audit log list."""
        now = datetime.now(timezone.utc)
        
        items = [
            AuditLogResponse(
                id=uuid.uuid4(),
                vve_id=uuid.uuid4(),
                user_id=uuid.uuid4(),
                user_name=f"User {i}",
                action="view",
                entity_type="document",
                entity_id=f"doc-{i}",
                is_financial=False,
                created_at=now,
            )
            for i in range(5)
        ]
        
        response = AuditLogListResponse(
            items=items,
            total=150,
            page=1,
            size=5,
        )
        
        assert len(response.items) == 5
        assert response.total == 150
        assert response.page == 1
        assert response.size == 5


class TestAuditLogFiltersJourney:
    """Tests for Audit Log Filters (STORY-010 & STORY-023).
    
    Filters: periode, rol, actie
    """

    def test_audit_log_filters_action(self):
        """Test filtering by action type."""
        filters = AuditLogFilters(
            action="create",
        )
        
        assert filters.action == "create"
        assert filters.entity_type is None

    def test_audit_log_filters_entity_type(self):
        """Test filtering by entity type."""
        filters = AuditLogFilters(
            entity_type="transaction",
        )
        
        assert filters.entity_type == "transaction"

    def test_audit_log_filters_date_range(self):
        """Test filtering by date range."""
        start = datetime(2026, 1, 1, tzinfo=timezone.utc)
        end = datetime(2026, 1, 31, tzinfo=timezone.utc)
        
        filters = AuditLogFilters(
            start_date=start,
            end_date=end,
        )
        
        assert filters.start_date == start
        assert filters.end_date == end

    def test_audit_log_filters_financial(self):
        """Test filtering by financial flag."""
        filters = AuditLogFilters(
            is_financial=True,
        )
        
        assert filters.is_financial is True

    def test_audit_log_filters_user(self):
        """Test filtering by specific user."""
        user_id = uuid.uuid4()
        
        filters = AuditLogFilters(
            user_id=user_id,
        )
        
        assert filters.user_id == user_id

    def test_audit_log_filters_combined(self):
        """Test combining multiple filters."""
        filters = AuditLogFilters(
            action="update",
            entity_type="transaction",
            is_financial=True,
            start_date=datetime(2026, 1, 1, tzinfo=timezone.utc),
        )
        
        assert filters.action == "update"
        assert filters.entity_type == "transaction"
        assert filters.is_financial is True


class TestAuditLogExportJourney:
    """Tests for Audit Log Export (STORY-023)."""

    def test_export_request_csv(self):
        """Test CSV export request."""
        request = AuditLogExportRequest(
            format="csv",
            action="create",
        )
        
        assert request.format == "csv"
        assert request.action == "create"

    def test_export_request_with_filters(self):
        """Test export request with multiple filters."""
        request = AuditLogExportRequest(
            format="csv",
            entity_type="transaction",
            is_financial=True,
            start_date=datetime(2026, 1, 1, tzinfo=timezone.utc),
            end_date=datetime(2026, 1, 31, tzinfo=timezone.utc),
        )
        
        assert request.is_financial is True
        assert request.start_date is not None
        assert request.end_date is not None

    def test_export_response(self):
        """Test export preparation response."""
        response = AuditLogExportResponse(
            export_id=uuid.uuid4(),
            format="csv",
            record_count=1500,
            file_size_estimate="225.0 KB",
            download_url="/api/v1/vves/abc/audit-logs/export/csv?action=create",
            expires_at=datetime.now(timezone.utc) + timedelta(hours=1),
        )
        
        assert response.record_count == 1500
        assert response.format == "csv"
        assert "225.0 KB" in response.file_size_estimate


class TestAuditLogActionTypes:
    """Test all supported audit action types."""

    def test_create_action(self):
        """Test create action type."""
        log = AuditLogCreate(
            action="create",
            entity_type="transaction",
        )
        assert log.action == "create"

    def test_update_action(self):
        """Test update action type."""
        log = AuditLogCreate(
            action="update",
            entity_type="transaction",
        )
        assert log.action == "update"

    def test_delete_action(self):
        """Test delete action type."""
        log = AuditLogCreate(
            action="delete",
            entity_type="document",
        )
        assert log.action == "delete"

    def test_upload_action(self):
        """Test upload action type."""
        log = AuditLogCreate(
            action="upload",
            entity_type="document",
        )
        assert log.action == "upload"

    def test_download_action(self):
        """Test download action type."""
        log = AuditLogCreate(
            action="download",
            entity_type="document",
        )
        assert log.action == "download"

    def test_login_action(self):
        """Test login action type."""
        log = AuditLogCreate(
            action="login",
            entity_type="user",
        )
        assert log.action == "login"

    def test_approve_action(self):
        """Test approve action type."""
        log = AuditLogCreate(
            action="approve",
            entity_type="budget",
        )
        assert log.action == "approve"

    def test_share_action(self):
        """Test share action type."""
        log = AuditLogCreate(
            action="share",
            entity_type="document",
        )
        assert log.action == "share"


class TestAuditLogEntityTypes:
    """Test all supported entity types."""

    def test_transaction_entity(self):
        """Test transaction entity type."""
        log = AuditLogCreate(
            action="create",
            entity_type="transaction",
        )
        assert log.entity_type == "transaction"

    def test_document_entity(self):
        """Test document entity type."""
        log = AuditLogCreate(
            action="upload",
            entity_type="document",
        )
        assert log.entity_type == "document"

    def test_budget_entity(self):
        """Test budget entity type."""
        log = AuditLogCreate(
            action="approve",
            entity_type="budget",
        )
        assert log.entity_type == "budget"

    def test_user_entity(self):
        """Test user entity type."""
        log = AuditLogCreate(
            action="login",
            entity_type="user",
        )
        assert log.entity_type == "user"

    def test_unit_entity(self):
        """Test unit entity type."""
        log = AuditLogCreate(
            action="update",
            entity_type="unit",
        )
        assert log.entity_type == "unit"
