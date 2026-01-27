"""Tests for Customer Journey: Ticket Management (Bewoner Meldt Defect).

Based on customer journeys:
- 5.1 Bewoner Meldt Defect / Probleem

FEAT-016: Bewoner tickets & klachten
STORY-029: Bewoner ticket wizard en tijdlijn
"""

import uuid
from datetime import datetime, timezone

import pytest

from app.schemas.ticket import (
    TicketStatus,
    TicketCategory,
    TicketPriority,
    SupplierStatus,
    TicketAttachmentStatus,
    MAX_ATTACHMENT_SIZE_BYTES,
    ALLOWED_ATTACHMENT_TYPES,
    TicketAttachmentBase,
    TicketAttachmentCreate,
    TicketAttachmentUpdate,
)


class TestTicketStatusJourney:
    """Tests for Ticket Status flow.
    
    Customer journey 5.1:
    1. Melding maken (SUBMITTED)
    2. Bestuur ontvangt (IN_PROGRESS)
    3. Status update
    4. Afsluiting (RESOLVED/CLOSED)
    """

    def test_status_draft(self):
        """Test draft status for incomplete tickets."""
        assert TicketStatus.DRAFT.value == "draft"

    def test_status_submitted(self):
        """Test submitted status when ticket is created."""
        assert TicketStatus.SUBMITTED.value == "submitted"

    def test_status_in_progress(self):
        """Test in_progress status when bestuur is working on it."""
        assert TicketStatus.IN_PROGRESS.value == "in_progress"

    def test_status_awaiting_info(self):
        """Test awaiting_info status when more info needed."""
        assert TicketStatus.AWAITING_INFO.value == "awaiting_info"

    def test_status_resolved(self):
        """Test resolved status when issue is fixed."""
        assert TicketStatus.RESOLVED.value == "resolved"

    def test_status_closed(self):
        """Test closed status for finalized tickets."""
        assert TicketStatus.CLOSED.value == "closed"


class TestTicketCategoryJourney:
    """Tests for Ticket Categories.
    
    Customer journey 5.1: Different types of defects/problems
    """

    def test_category_maintenance(self):
        """Test maintenance category for repairs."""
        assert TicketCategory.MAINTENANCE.value == "maintenance"

    def test_category_noise(self):
        """Test noise category for noise complaints."""
        assert TicketCategory.NOISE.value == "noise"

    def test_category_safety(self):
        """Test safety category for safety issues."""
        assert TicketCategory.SAFETY.value == "safety"

    def test_category_cleaning(self):
        """Test cleaning category for cleaning issues."""
        assert TicketCategory.CLEANING.value == "cleaning"

    def test_category_facilities(self):
        """Test facilities category for shared facilities."""
        assert TicketCategory.FACILITIES.value == "facilities"

    def test_category_other(self):
        """Test other category for miscellaneous."""
        assert TicketCategory.OTHER.value == "other"


class TestTicketPriorityJourney:
    """Tests for Ticket Priority levels."""

    def test_priority_low(self):
        """Test low priority for non-urgent issues."""
        assert TicketPriority.LOW.value == "low"

    def test_priority_medium(self):
        """Test medium priority for normal issues."""
        assert TicketPriority.MEDIUM.value == "medium"

    def test_priority_high(self):
        """Test high priority for important issues."""
        assert TicketPriority.HIGH.value == "high"

    def test_priority_urgent(self):
        """Test urgent priority for critical issues."""
        assert TicketPriority.URGENT.value == "urgent"


class TestSupplierCollaborationJourney:
    """Tests for Supplier Collaboration Status (STORY-044)."""

    def test_supplier_status_scheduled(self):
        """Test scheduled status when work is planned."""
        assert SupplierStatus.SCHEDULED.value == "scheduled"

    def test_supplier_status_in_progress(self):
        """Test in_progress status when work is ongoing."""
        assert SupplierStatus.IN_PROGRESS.value == "in_progress"

    def test_supplier_status_completed(self):
        """Test completed status when work is done."""
        assert SupplierStatus.COMPLETED.value == "completed"


class TestTicketAttachmentJourney:
    """Tests for Ticket Attachments (photo + PDF).
    
    Customer journey 5.1: Bewoner maakt melding met foto
    """

    def test_max_attachment_size(self):
        """Test maximum attachment size is 10MB (D-004)."""
        assert MAX_ATTACHMENT_SIZE_BYTES == 10 * 1024 * 1024

    def test_allowed_attachment_types_pdf(self):
        """Test PDF is allowed for attachments."""
        assert "application/pdf" in ALLOWED_ATTACHMENT_TYPES

    def test_allowed_attachment_types_images(self):
        """Test images are allowed for attachments."""
        assert "image/jpeg" in ALLOWED_ATTACHMENT_TYPES
        assert "image/png" in ALLOWED_ATTACHMENT_TYPES
        assert "image/webp" in ALLOWED_ATTACHMENT_TYPES

    def test_attachment_base_with_description(self):
        """Test attachment with description."""
        attachment = TicketAttachmentBase(
            description="Foto van waterlekkage in de hal",
        )
        
        assert attachment.description == "Foto van waterlekkage in de hal"

    def test_attachment_base_without_description(self):
        """Test attachment without description."""
        attachment = TicketAttachmentBase()
        
        assert attachment.description is None

    def test_attachment_create(self):
        """Test creating attachment."""
        attachment = TicketAttachmentCreate(
            description="Schade aan de voordeur",
        )
        
        assert attachment.description == "Schade aan de voordeur"


class TestTicketAttachmentStatusJourney:
    """Tests for Ticket Attachment Status (STORY-030)."""

    def test_attachment_status_pending(self):
        """Test pending status for new attachments."""
        assert TicketAttachmentStatus.PENDING.value == "pending"

    def test_attachment_status_timely(self):
        """Test timely status (tijdig aangevraagd)."""
        assert TicketAttachmentStatus.TIMELY.value == "timely"

    def test_attachment_status_late(self):
        """Test late status (te laat)."""
        assert TicketAttachmentStatus.LATE.value == "late"

    def test_attachment_status_accepted(self):
        """Test accepted status for approved attachments."""
        assert TicketAttachmentStatus.ACCEPTED.value == "accepted"

    def test_attachment_status_rejected(self):
        """Test rejected status for declined attachments."""
        assert TicketAttachmentStatus.REJECTED.value == "rejected"


class TestTicketAttachmentUpdateJourney:
    """Tests for updating ticket attachments."""

    def test_attachment_update_status(self):
        """Test updating attachment status."""
        update = TicketAttachmentUpdate(
            status=TicketAttachmentStatus.ACCEPTED,
        )
        
        assert update.status == TicketAttachmentStatus.ACCEPTED

    def test_attachment_update_rejection(self):
        """Test rejecting attachment with reason."""
        update = TicketAttachmentUpdate(
            status=TicketAttachmentStatus.REJECTED,
            rejection_reason="Foto is onscherp, graag nieuwe foto aanleveren",
        )
        
        assert update.status == TicketAttachmentStatus.REJECTED
        assert "onscherp" in update.rejection_reason
