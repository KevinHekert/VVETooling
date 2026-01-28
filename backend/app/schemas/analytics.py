"""Analytics and Benchmark schemas.

Implements EPIC-020 (Benchmark & Analytics):
- FEAT-047: Benchmark Dashboard (STORY-093)
- FEAT-048: VVE Analytics & Trends (STORY-094)
"""

import uuid
from datetime import datetime
from decimal import Decimal
from enum import Enum

from pydantic import BaseModel, ConfigDict, Field


class BenchmarkCategory(str, Enum):
    """Categories for benchmark comparison."""

    KOSTEN_PER_M2 = "kosten_per_m2"  # Costs per square meter
    RESERVESTAND = "reservestand"  # Reserve fund level
    ONDERHOUDSKOSTEN = "onderhoudskosten"  # Maintenance costs
    CONTRIBUTIE = "contributie"  # Contribution level
    ENERGIE = "energie"  # Energy costs


class PercentileRank(str, Enum):
    """Percentile rank categorization."""

    TOP_10 = "top_10"  # Excellent
    TOP_25 = "top_25"  # Good
    MEDIAAN = "mediaan"  # Average (40-60%)
    ONDER_MEDIAAN = "onder_mediaan"  # Below average (25-40%)
    LAAGSTE_25 = "laagste_25"  # Needs improvement


class BenchmarkFilter(BaseModel):
    """Filters for selecting comparable VVEs (STORY-093)."""

    size_min: int | None = Field(None, ge=1, description="Minimum number of units")
    size_max: int | None = Field(None, ge=1, description="Maximum number of units")
    building_year_from: int | None = Field(None, ge=1900, le=2100)
    building_year_to: int | None = Field(None, ge=1900, le=2100)
    region: str | None = Field(None, max_length=50)
    vve_type: str | None = Field(None, max_length=50)


class BenchmarkMetric(BaseModel):
    """Single metric in the benchmark comparison (STORY-093)."""

    category: BenchmarkCategory
    label: str
    vve_value: Decimal
    average_value: Decimal
    median_value: Decimal
    min_value: Decimal
    max_value: Decimal
    percentile: int = Field(..., ge=0, le=100)
    rank: PercentileRank
    unit: str = ""
    comparison_count: int = Field(..., ge=0, description="Number of VVEs in comparison")
    recommendation: str | None = None


class BenchmarkResponse(BaseModel):
    """Response with benchmark comparison data (STORY-093)."""

    vve_id: uuid.UUID
    vve_name: str
    generated_at: datetime
    filters_applied: BenchmarkFilter
    comparison_count: int
    metrics: list[BenchmarkMetric]
    overall_score: Decimal = Field(..., ge=0, le=100, description="Overall performance score")
    summary: str


class TrendDataPoint(BaseModel):
    """Single data point in a trend analysis (STORY-094)."""

    date: datetime
    value: Decimal
    label: str | None = None


class TrendAnalysis(BaseModel):
    """Trend analysis for a metric over time (STORY-094)."""

    category: BenchmarkCategory
    label: str
    current_value: Decimal
    change_percentage: Decimal
    trend_direction: str = Field(..., description="up, down, or stable")
    data_points: list[TrendDataPoint]
    forecast_next_year: Decimal | None = None


class AnalyticsDashboardResponse(BaseModel):
    """Dashboard analytics summary (STORY-094)."""

    vve_id: uuid.UUID
    period_start: datetime
    period_end: datetime
    trends: list[TrendAnalysis]
    key_insights: list[str]
    alerts: list[str]
