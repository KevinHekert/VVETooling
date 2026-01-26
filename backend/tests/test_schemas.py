"""Tests for Pydantic schemas - validation logic."""

from decimal import Decimal

import pytest

from app.schemas.unit import (
    SplitsingssleutelEntry,
    SplitsingssleutelValidation,
    SplitsingssleutelBulkUpdate,
)


class TestSplitsingssleutelValidation:
    """Tests for STORY-002: Splitsingssleutel validatie."""

    def test_valid_100_percent_total(self):
        """Test that 100% total is marked as valid."""
        entries = [
            SplitsingssleutelEntry(
                unit_id="11111111-1111-1111-1111-111111111111",
                unit_number="A1",
                share_percentage=Decimal("50.00000"),
            ),
            SplitsingssleutelEntry(
                unit_id="22222222-2222-2222-2222-222222222222",
                unit_number="A2",
                share_percentage=Decimal("50.00000"),
            ),
        ]
        
        validation = SplitsingssleutelValidation(units=entries)
        
        assert validation.is_valid is True
        assert validation.total_percentage == Decimal("100.00000")
        assert "geldig" in validation.validation_message.lower()

    def test_invalid_under_100_percent(self):
        """Test that under 100% total shows correct warning."""
        entries = [
            SplitsingssleutelEntry(
                unit_id="11111111-1111-1111-1111-111111111111",
                unit_number="A1",
                share_percentage=Decimal("40.00000"),
            ),
            SplitsingssleutelEntry(
                unit_id="22222222-2222-2222-2222-222222222222",
                unit_number="A2",
                share_percentage=Decimal("30.00000"),
            ),
        ]
        
        validation = SplitsingssleutelValidation(units=entries)
        
        assert validation.is_valid is False
        assert validation.total_percentage == Decimal("70.00000")
        # Should show how much to add
        assert "30" in validation.validation_message

    def test_invalid_over_100_percent(self):
        """Test that over 100% total shows correct warning."""
        entries = [
            SplitsingssleutelEntry(
                unit_id="11111111-1111-1111-1111-111111111111",
                unit_number="A1",
                share_percentage=Decimal("60.00000"),
            ),
            SplitsingssleutelEntry(
                unit_id="22222222-2222-2222-2222-222222222222",
                unit_number="A2",
                share_percentage=Decimal("50.00000"),
            ),
        ]
        
        validation = SplitsingssleutelValidation(units=entries)
        
        assert validation.is_valid is False
        assert validation.total_percentage == Decimal("110.00000")

    def test_bulk_update_rejects_non_100_percent(self):
        """Test that bulk update rejects totals not equal to 100%."""
        entries = [
            SplitsingssleutelEntry(
                unit_id="11111111-1111-1111-1111-111111111111",
                unit_number="A1",
                share_percentage=Decimal("40.00000"),
            ),
            SplitsingssleutelEntry(
                unit_id="22222222-2222-2222-2222-222222222222",
                unit_number="A2",
                share_percentage=Decimal("40.00000"),
            ),
        ]
        
        with pytest.raises(ValueError) as exc_info:
            SplitsingssleutelBulkUpdate(updates=entries)
        
        assert "100%" in str(exc_info.value)

    def test_bulk_update_accepts_100_percent(self):
        """Test that bulk update accepts exactly 100% total."""
        entries = [
            SplitsingssleutelEntry(
                unit_id="11111111-1111-1111-1111-111111111111",
                unit_number="A1",
                share_percentage=Decimal("33.33333"),
            ),
            SplitsingssleutelEntry(
                unit_id="22222222-2222-2222-2222-222222222222",
                unit_number="A2",
                share_percentage=Decimal("33.33334"),
            ),
            SplitsingssleutelEntry(
                unit_id="33333333-3333-3333-3333-333333333333",
                unit_number="A3",
                share_percentage=Decimal("33.33333"),
            ),
        ]
        
        update = SplitsingssleutelBulkUpdate(updates=entries)
        
        assert len(update.updates) == 3
