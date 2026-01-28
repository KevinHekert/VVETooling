"""Tests for Quorum Calculation schemas - STORY-074 validation logic."""

import uuid
from datetime import datetime, timezone

import pytest

from app.schemas.meeting import (
    QuorumCalculation,
    QuorumMemberDetail,
    QuorumStatus,
)


class TestQuorumMemberDetail:
    """Tests for QuorumMemberDetail schema (STORY-074)."""

    def test_present_member_detail(self):
        """Test creating a detail for a present member."""
        detail = QuorumMemberDetail(
            user_id=uuid.uuid4(),
            user_name="Jan Jansen",
            unit_id=uuid.uuid4(),
            unit_number="A1",
            share_percentage=25.5,
            attendance_type="present",
        )
        
        assert detail.user_name == "Jan Jansen"
        assert detail.share_percentage == 25.5
        assert detail.attendance_type == "present"
        assert detail.proxy_holder_name is None

    def test_proxy_member_detail(self):
        """Test creating a detail for a proxy-represented member."""
        detail = QuorumMemberDetail(
            user_id=uuid.uuid4(),
            user_name="Piet Pietersen",
            unit_id=uuid.uuid4(),
            unit_number="B2",
            share_percentage=15.0,
            attendance_type="proxy",
            proxy_holder_name="Kees de Groot",
        )
        
        assert detail.attendance_type == "proxy"
        assert detail.proxy_holder_name == "Kees de Groot"


class TestQuorumCalculation:
    """Tests for QuorumCalculation schema (STORY-074)."""

    def test_quorum_reached(self):
        """Test quorum calculation when quorum is reached."""
        now = datetime.now(timezone.utc)
        
        calculation = QuorumCalculation(
            meeting_id=uuid.uuid4(),
            total_shares=100.0,
            present_shares=40.0,
            proxy_shares=15.0,
            represented_shares=55.0,
            represented_percentage=55.0,
            required_percentage=50.0,
            quorum_status=QuorumStatus.REACHED,
            is_quorum_reached=True,
            total_owners=10,
            present_count=4,
            proxy_count=2,
            represented_count=6,
            calculated_at=now,
        )
        
        assert calculation.is_quorum_reached is True
        assert calculation.quorum_status == QuorumStatus.REACHED
        assert calculation.represented_percentage == 55.0
        assert calculation.represented_shares == 55.0

    def test_quorum_not_reached(self):
        """Test quorum calculation when quorum is not reached."""
        now = datetime.now(timezone.utc)
        
        calculation = QuorumCalculation(
            meeting_id=uuid.uuid4(),
            total_shares=100.0,
            present_shares=30.0,
            proxy_shares=10.0,
            represented_shares=40.0,
            represented_percentage=40.0,
            required_percentage=50.0,
            quorum_status=QuorumStatus.NOT_REACHED,
            is_quorum_reached=False,
            total_owners=10,
            present_count=3,
            proxy_count=1,
            represented_count=4,
            calculated_at=now,
        )
        
        assert calculation.is_quorum_reached is False
        assert calculation.quorum_status == QuorumStatus.NOT_REACHED
        assert calculation.represented_percentage == 40.0

    def test_quorum_with_member_details(self):
        """Test quorum calculation with member details."""
        now = datetime.now(timezone.utc)
        user1_id = uuid.uuid4()
        user2_id = uuid.uuid4()
        
        present_details = [
            QuorumMemberDetail(
                user_id=user1_id,
                user_name="Jan Jansen",
                unit_id=uuid.uuid4(),
                unit_number="A1",
                share_percentage=30.0,
                attendance_type="present",
            )
        ]
        
        proxy_details = [
            QuorumMemberDetail(
                user_id=user2_id,
                user_name="Piet Pietersen",
                unit_id=uuid.uuid4(),
                unit_number="B2",
                share_percentage=25.0,
                attendance_type="proxy",
                proxy_holder_name="Jan Jansen",
            )
        ]
        
        calculation = QuorumCalculation(
            meeting_id=uuid.uuid4(),
            total_shares=100.0,
            present_shares=30.0,
            proxy_shares=25.0,
            represented_shares=55.0,
            represented_percentage=55.0,
            required_percentage=50.0,
            quorum_status=QuorumStatus.REACHED,
            is_quorum_reached=True,
            total_owners=4,
            present_count=1,
            proxy_count=1,
            represented_count=2,
            present_details=present_details,
            proxy_details=proxy_details,
            calculated_at=now,
        )
        
        assert len(calculation.present_details) == 1
        assert len(calculation.proxy_details) == 1
        assert calculation.present_details[0].user_name == "Jan Jansen"
        assert calculation.proxy_details[0].proxy_holder_name == "Jan Jansen"

    def test_quorum_exactly_at_threshold(self):
        """Test quorum calculation when exactly at the threshold."""
        now = datetime.now(timezone.utc)
        
        calculation = QuorumCalculation(
            meeting_id=uuid.uuid4(),
            total_shares=100.0,
            present_shares=50.0,
            proxy_shares=0.0,
            represented_shares=50.0,
            represented_percentage=50.0,
            required_percentage=50.0,
            quorum_status=QuorumStatus.REACHED,
            is_quorum_reached=True,
            total_owners=10,
            present_count=5,
            proxy_count=0,
            represented_count=5,
            calculated_at=now,
        )
        
        # Exactly at 50% should be considered reached
        assert calculation.is_quorum_reached is True
        assert calculation.quorum_status == QuorumStatus.REACHED

    def test_quorum_custom_required_percentage(self):
        """Test quorum with custom required percentage (e.g., 2/3 majority)."""
        now = datetime.now(timezone.utc)
        
        # 66.67% required for 2/3 majority decisions
        calculation = QuorumCalculation(
            meeting_id=uuid.uuid4(),
            total_shares=100.0,
            present_shares=60.0,
            proxy_shares=5.0,
            represented_shares=65.0,
            represented_percentage=65.0,
            required_percentage=66.67,
            quorum_status=QuorumStatus.NOT_REACHED,
            is_quorum_reached=False,
            total_owners=10,
            present_count=6,
            proxy_count=1,
            represented_count=7,
            calculated_at=now,
        )
        
        assert calculation.is_quorum_reached is False
        assert calculation.required_percentage == 66.67


class TestQuorumStatus:
    """Tests for QuorumStatus enum."""

    def test_all_statuses_defined(self):
        """Test that all required statuses are defined."""
        assert QuorumStatus.REACHED == "reached"
        assert QuorumStatus.NOT_REACHED == "not_reached"
