"""Tests for STORY-081: Besluit doorzoeken in register.

Tests for decision search functionality.
"""

import uuid
from datetime import datetime, timezone

import pytest
from pydantic import ValidationError

from app.schemas.meeting import (
    DecisionSearchRequest,
    DecisionSearchResponse,
    DecisionSearchResult,
    DecisionType,
    DecisionVoteResult,
)


class TestDecisionSearchSchemas:
    """Tests for STORY-081: Besluit doorzoeken in register."""

    def test_decision_vote_result_values(self):
        """Test all vote result values."""
        assert DecisionVoteResult.AANGENOMEN == "aangenomen"
        assert DecisionVoteResult.VERWORPEN == "verworpen"
        assert DecisionVoteResult.AANGEHOUDEN == "aangehouden"
        assert DecisionVoteResult.ONBEKEND == "onbekend"

    def test_search_request_query_only(self):
        """Test search request with query only."""
        request = DecisionSearchRequest(
            query="reservefonds"
        )
        
        assert request.query == "reservefonds"
        assert request.date_from is None
        assert request.date_to is None
        assert request.vote_result is None

    def test_search_request_with_date_range(self):
        """Test search request with date range filter."""
        request = DecisionSearchRequest(
            date_from=datetime(2025, 1, 1, tzinfo=timezone.utc),
            date_to=datetime(2026, 12, 31, tzinfo=timezone.utc),
        )
        
        assert request.date_from is not None
        assert request.date_to is not None
        assert request.query is None

    def test_search_request_with_vote_result_filter(self):
        """Test search request with vote result filter."""
        request = DecisionSearchRequest(
            vote_result=DecisionVoteResult.AANGENOMEN
        )
        
        assert request.vote_result == DecisionVoteResult.AANGENOMEN

    def test_search_request_with_all_filters(self):
        """Test search request with all filters."""
        request = DecisionSearchRequest(
            query="onderhoud",
            date_from=datetime(2026, 1, 1, tzinfo=timezone.utc),
            date_to=datetime(2026, 12, 31, tzinfo=timezone.utc),
            vote_result=DecisionVoteResult.AANGENOMEN,
            decision_type=DecisionType.BESLUIT,
            meeting_id=uuid.uuid4(),
            skip=0,
            limit=20,
        )
        
        assert request.query == "onderhoud"
        assert request.vote_result == DecisionVoteResult.AANGENOMEN
        assert request.decision_type == DecisionType.BESLUIT
        assert request.skip == 0
        assert request.limit == 20

    def test_search_request_query_too_short(self):
        """Test that query under 2 characters is rejected."""
        with pytest.raises(ValidationError):
            DecisionSearchRequest(query="a")

    def test_search_request_query_too_long(self):
        """Test that query over 255 characters is rejected."""
        with pytest.raises(ValidationError):
            DecisionSearchRequest(query="A" * 256)

    def test_search_request_pagination(self):
        """Test pagination parameters."""
        request = DecisionSearchRequest(
            skip=10,
            limit=50,
        )
        
        assert request.skip == 10
        assert request.limit == 50

    def test_search_request_pagination_limits(self):
        """Test pagination limit constraints."""
        # Max limit is 100
        with pytest.raises(ValidationError):
            DecisionSearchRequest(limit=101)

        # Negative skip not allowed
        with pytest.raises(ValidationError):
            DecisionSearchRequest(skip=-1)

    def test_decision_search_result(self):
        """Test decision search result schema."""
        result = DecisionSearchResult(
            id=uuid.uuid4(),
            meeting_id=uuid.uuid4(),
            meeting_title="ALV 2026",
            meeting_date=datetime(2026, 3, 15, tzinfo=timezone.utc),
            decision_type=DecisionType.BESLUIT,
            title="Goedkeuring jaarrekening 2025",
            description="De jaarrekening 2025 is unaniem goedgekeurd",
            vote_result=DecisionVoteResult.AANGENOMEN,
            is_completed=True,
            created_at=datetime.now(timezone.utc),
            relevance_snippet="...jaarrekening 2025 is unaniem **goedgekeurd**...",
            match_score=0.95,
        )
        
        assert result.meeting_title == "ALV 2026"
        assert result.decision_type == DecisionType.BESLUIT
        assert result.vote_result == DecisionVoteResult.AANGENOMEN
        assert result.relevance_snippet is not None
        assert result.match_score == 0.95

    def test_decision_search_result_minimal(self):
        """Test decision search result with minimal fields."""
        result = DecisionSearchResult(
            id=uuid.uuid4(),
            meeting_id=uuid.uuid4(),
            meeting_title="BALV",
            meeting_date=datetime(2026, 6, 1, tzinfo=timezone.utc),
            decision_type=DecisionType.ACTIEPUNT,
            title="Offertes opvragen",
            is_completed=False,
            created_at=datetime.now(timezone.utc),
        )
        
        assert result.description is None
        assert result.vote_result is None
        assert result.relevance_snippet is None
        assert result.match_score == 1.0  # Default value

    def test_decision_search_response(self):
        """Test decision search response schema."""
        results = [
            DecisionSearchResult(
                id=uuid.uuid4(),
                meeting_id=uuid.uuid4(),
                meeting_title="ALV 2026",
                meeting_date=datetime(2026, 3, 15, tzinfo=timezone.utc),
                decision_type=DecisionType.BESLUIT,
                title="Besluit 1",
                is_completed=True,
                created_at=datetime.now(timezone.utc),
                match_score=0.9,
            ),
            DecisionSearchResult(
                id=uuid.uuid4(),
                meeting_id=uuid.uuid4(),
                meeting_title="ALV 2025",
                meeting_date=datetime(2025, 3, 10, tzinfo=timezone.utc),
                decision_type=DecisionType.BESLUIT,
                title="Besluit 2",
                is_completed=True,
                created_at=datetime.now(timezone.utc),
                match_score=0.85,
            ),
        ]

        response = DecisionSearchResponse(
            query="reservefonds",
            total_count=5,
            results=results,
            has_more=True,
            filters_applied={"query": "reservefonds", "date_from": "2026-01-01"},
        )
        
        assert response.query == "reservefonds"
        assert response.total_count == 5
        assert len(response.results) == 2
        assert response.has_more is True
        assert "query" in response.filters_applied

    def test_decision_search_response_no_results(self):
        """Test decision search response with no results."""
        response = DecisionSearchResponse(
            query="nonexistent",
            total_count=0,
            results=[],
            has_more=False,
            filters_applied={"query": "nonexistent"},
        )
        
        assert response.total_count == 0
        assert len(response.results) == 0
        assert response.has_more is False

    def test_decision_search_response_no_query(self):
        """Test decision search response for register listing."""
        response = DecisionSearchResponse(
            query=None,
            total_count=25,
            results=[],  # Truncated for test
            has_more=True,
            filters_applied={"decision_type": "besluit"},
        )
        
        assert response.query is None
        assert response.total_count == 25

    def test_decision_types(self):
        """Test all decision types are valid."""
        assert DecisionType.BESLUIT == "besluit"
        assert DecisionType.ACTIEPUNT == "actiepunt"
        assert DecisionType.AANDACHTSPUNT == "aandachtspunt"

    def test_search_request_empty(self):
        """Test empty search request is valid."""
        request = DecisionSearchRequest()
        
        assert request.query is None
        assert request.skip == 0  # Default value
        assert request.limit == 20  # Default value
