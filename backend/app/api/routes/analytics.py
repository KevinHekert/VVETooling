"""Analytics and Benchmark API routes.

Implements EPIC-020 (Benchmark & Analytics):
- FEAT-047: Benchmark Dashboard (STORY-093)
- FEAT-048: VVE Analytics & Trends (STORY-094)
"""

import uuid
from datetime import datetime
from decimal import Decimal
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies.auth import (
    CurrentUser,
    require_bestuurslid,
    require_member,
)
from app.db.models.models import (
    Unit,
    VVE,
)
from app.db.session import get_db
from app.schemas.analytics import (
    AnalyticsDashboardResponse,
    BenchmarkCategory,
    BenchmarkFilter,
    BenchmarkMetric,
    BenchmarkResponse,
    PercentileRank,
    TrendAnalysis,
    TrendDataPoint,
)

router = APIRouter(prefix="/vves/{vve_id}/analytics", tags=["analytics"])


def calculate_percentile_rank(percentile: int) -> PercentileRank:
    """Determine rank category from percentile."""
    if percentile >= 90:
        return PercentileRank.TOP_10
    elif percentile >= 75:
        return PercentileRank.TOP_25
    elif percentile >= 40:
        return PercentileRank.MEDIAAN
    elif percentile >= 25:
        return PercentileRank.ONDER_MEDIAAN
    else:
        return PercentileRank.LAAGSTE_25


def get_recommendation(category: BenchmarkCategory, rank: PercentileRank) -> str | None:
    """Generate recommendation based on benchmark performance."""
    if rank in (PercentileRank.TOP_10, PercentileRank.TOP_25):
        return None
    
    recommendations = {
        BenchmarkCategory.KOSTEN_PER_M2: {
            PercentileRank.MEDIAAN: "Overweeg energie-efficiëntie maatregelen om kosten te verlagen.",
            PercentileRank.ONDER_MEDIAAN: "Analyse kosten per categorie. Mogelijk zijn er besparingen in onderhoud of energie.",
            PercentileRank.LAAGSTE_25: "Urgente review van kosten aanbevolen. Onderzoek uitbesteding vs. eigen beheer.",
        },
        BenchmarkCategory.RESERVESTAND: {
            PercentileRank.MEDIAAN: "Reserve is voldoende maar kan hoger. Check MJOP voor toekomstige behoeften.",
            PercentileRank.ONDER_MEDIAAN: "Reservestand is lager dan gemiddeld. Overweeg contributieverhoging.",
            PercentileRank.LAAGSTE_25: "Kritisch lage reserve. Plan urgente ALV voor bijstelling reserveplan.",
        },
        BenchmarkCategory.ONDERHOUDSKOSTEN: {
            PercentileRank.MEDIAAN: "Onderhoudskosten zijn gemiddeld. Preventief onderhoud kan kosten verlagen.",
            PercentileRank.ONDER_MEDIAAN: "Hoge onderhoudskosten. Evalueer leverancierscontracten.",
            PercentileRank.LAAGSTE_25: "Zeer hoge onderhoudskosten. Overweeg structurele renovatie.",
        },
        BenchmarkCategory.CONTRIBUTIE: {
            PercentileRank.MEDIAAN: "Contributie is marktconform.",
            PercentileRank.ONDER_MEDIAAN: "Contributie is relatief hoog. Communiceer waarde naar eigenaren.",
            PercentileRank.LAAGSTE_25: "Zeer hoge contributie. Benchmark met vergelijkbare VVE's.",
        },
    }
    
    return recommendations.get(category, {}).get(rank)


@router.get(
    "/benchmark",
    response_model=BenchmarkResponse,
    summary="Benchmark positie bekijken",
    description="""
    STORY-093: Als bestuurslid wil ik kunnen zien hoe onze VVE presteert 
    vergeleken met soortgelijke VVE's.
    
    Features:
    - Vergelijking op: kosten per m², reservestand, onderhoudskosten
    - Positie in percentiel (top 25%, mediaan, etc.)
    - Filter op vergelijkbare VVE's (grootte, bouwjaar)
    - Aanbevelingen op basis van afwijkingen
    """,
)
async def get_benchmark(
    vve_id: uuid.UUID,
    current_user: Annotated[CurrentUser, Depends(require_bestuurslid)],
    db: AsyncSession = Depends(get_db),
    size_min: int | None = Query(None, ge=1),
    size_max: int | None = Query(None, ge=1),
    building_year_from: int | None = Query(None, ge=1900, le=2100),
    building_year_to: int | None = Query(None, ge=1900, le=2100),
) -> BenchmarkResponse:
    """Get benchmark comparison for the VVE (STORY-093)."""
    # Verify VVE exists
    vve_result = await db.execute(select(VVE).where(VVE.id == vve_id))
    vve = vve_result.scalar_one_or_none()
    
    if not vve:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="VVE niet gevonden",
        )
    
    # Build filter object
    filters = BenchmarkFilter(
        size_min=size_min,
        size_max=size_max,
        building_year_from=building_year_from,
        building_year_to=building_year_to,
    )
    
    # Count units for this VVE
    unit_count_result = await db.execute(
        select(func.count()).select_from(Unit).where(Unit.vve_id == vve_id)
    )
    unit_count = unit_count_result.scalar() or 0
    
    # For demo/MVP, we generate mock benchmark data
    # In production, this would query aggregated data from all VVEs
    comparison_count = 247  # Mock: Number of comparable VVEs
    
    # Generate benchmark metrics
    metrics: list[BenchmarkMetric] = []
    
    # Metric 1: Kosten per m²
    kosten_percentile = 68
    kosten_rank = calculate_percentile_rank(kosten_percentile)
    metrics.append(
        BenchmarkMetric(
            category=BenchmarkCategory.KOSTEN_PER_M2,
            label="Kosten per m²",
            vve_value=Decimal("45.50"),
            average_value=Decimal("52.30"),
            median_value=Decimal("48.00"),
            min_value=Decimal("25.00"),
            max_value=Decimal("120.00"),
            percentile=kosten_percentile,
            rank=kosten_rank,
            unit="€/m²/jaar",
            comparison_count=comparison_count,
            recommendation=get_recommendation(BenchmarkCategory.KOSTEN_PER_M2, kosten_rank),
        )
    )
    
    # Metric 2: Reservestand
    reserve_percentile = 45
    reserve_rank = calculate_percentile_rank(reserve_percentile)
    metrics.append(
        BenchmarkMetric(
            category=BenchmarkCategory.RESERVESTAND,
            label="Reservestand",
            vve_value=Decimal("72500.00"),
            average_value=Decimal("95000.00"),
            median_value=Decimal("85000.00"),
            min_value=Decimal("10000.00"),
            max_value=Decimal("500000.00"),
            percentile=reserve_percentile,
            rank=reserve_rank,
            unit="€",
            comparison_count=comparison_count,
            recommendation=get_recommendation(BenchmarkCategory.RESERVESTAND, reserve_rank),
        )
    )
    
    # Metric 3: Onderhoudskosten
    onderhoud_percentile = 72
    onderhoud_rank = calculate_percentile_rank(onderhoud_percentile)
    metrics.append(
        BenchmarkMetric(
            category=BenchmarkCategory.ONDERHOUDSKOSTEN,
            label="Onderhoudskosten per unit",
            vve_value=Decimal("1250.00"),
            average_value=Decimal("1480.00"),
            median_value=Decimal("1350.00"),
            min_value=Decimal("500.00"),
            max_value=Decimal("4500.00"),
            percentile=onderhoud_percentile,
            rank=onderhoud_rank,
            unit="€/unit/jaar",
            comparison_count=comparison_count,
            recommendation=get_recommendation(BenchmarkCategory.ONDERHOUDSKOSTEN, onderhoud_rank),
        )
    )
    
    # Metric 4: Contributie
    contributie_percentile = 58
    contributie_rank = calculate_percentile_rank(contributie_percentile)
    metrics.append(
        BenchmarkMetric(
            category=BenchmarkCategory.CONTRIBUTIE,
            label="Gemiddelde contributie",
            vve_value=Decimal("185.00"),
            average_value=Decimal("195.00"),
            median_value=Decimal("175.00"),
            min_value=Decimal("75.00"),
            max_value=Decimal("450.00"),
            percentile=contributie_percentile,
            rank=contributie_rank,
            unit="€/maand",
            comparison_count=comparison_count,
            recommendation=get_recommendation(BenchmarkCategory.CONTRIBUTIE, contributie_rank),
        )
    )
    
    # Calculate overall score (weighted average of percentiles)
    overall_score = Decimal(
        (kosten_percentile * 0.3 + reserve_percentile * 0.25 + 
         onderhoud_percentile * 0.25 + contributie_percentile * 0.2)
    )
    
    # Generate summary
    top_metrics = [m for m in metrics if m.rank in (PercentileRank.TOP_10, PercentileRank.TOP_25)]
    improvement_metrics = [m for m in metrics if m.rank in (PercentileRank.ONDER_MEDIAAN, PercentileRank.LAAGSTE_25)]
    
    if overall_score >= 70:
        summary = f"Uw VVE presteert bovengemiddeld (score: {overall_score:.0f}/100). "
    elif overall_score >= 50:
        summary = f"Uw VVE presteert gemiddeld (score: {overall_score:.0f}/100). "
    else:
        summary = f"Uw VVE heeft verbeterpotentieel (score: {overall_score:.0f}/100). "
    
    if top_metrics:
        summary += f"Sterk op: {', '.join(m.label for m in top_metrics)}. "
    if improvement_metrics:
        summary += f"Aandachtspunten: {', '.join(m.label for m in improvement_metrics)}."
    
    return BenchmarkResponse(
        vve_id=vve_id,
        vve_name=vve.name,
        generated_at=datetime.now(),
        filters_applied=filters,
        comparison_count=comparison_count,
        metrics=metrics,
        overall_score=overall_score,
        summary=summary,
    )


@router.get(
    "/trends",
    response_model=AnalyticsDashboardResponse,
    summary="VVE analytics en trends",
    description="""
    STORY-094: Kosten trend analyseren over tijd.
    """,
)
async def get_trends(
    vve_id: uuid.UUID,
    current_user: Annotated[CurrentUser, Depends(require_member)],
    db: AsyncSession = Depends(get_db),
    period_months: int = Query(12, ge=3, le=60),
) -> AnalyticsDashboardResponse:
    """Get trend analysis for the VVE (STORY-094)."""
    # Verify VVE exists
    vve_result = await db.execute(select(VVE).where(VVE.id == vve_id))
    if vve_result.scalar_one_or_none() is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="VVE niet gevonden",
        )
    
    # Generate mock trend data (in production, aggregate from transactions/expenses)
    now = datetime.now()
    
    # Kosten trend
    kosten_points = [
        TrendDataPoint(
            date=datetime(2024, 1, 1),
            value=Decimal("12500.00"),
            label="Q1 2024",
        ),
        TrendDataPoint(
            date=datetime(2024, 4, 1),
            value=Decimal("11800.00"),
            label="Q2 2024",
        ),
        TrendDataPoint(
            date=datetime(2024, 7, 1),
            value=Decimal("13200.00"),
            label="Q3 2024",
        ),
        TrendDataPoint(
            date=datetime(2024, 10, 1),
            value=Decimal("12100.00"),
            label="Q4 2024",
        ),
    ]
    
    trends = [
        TrendAnalysis(
            category=BenchmarkCategory.KOSTEN_PER_M2,
            label="Totale kosten per kwartaal",
            current_value=Decimal("12100.00"),
            change_percentage=Decimal("-3.2"),
            trend_direction="down",
            data_points=kosten_points,
            forecast_next_year=Decimal("11500.00"),
        ),
        TrendAnalysis(
            category=BenchmarkCategory.RESERVESTAND,
            label="Reservestand",
            current_value=Decimal("72500.00"),
            change_percentage=Decimal("8.5"),
            trend_direction="up",
            data_points=[
                TrendDataPoint(date=datetime(2024, 1, 1), value=Decimal("65000.00"), label="Jan"),
                TrendDataPoint(date=datetime(2024, 4, 1), value=Decimal("68000.00"), label="Apr"),
                TrendDataPoint(date=datetime(2024, 7, 1), value=Decimal("70500.00"), label="Jul"),
                TrendDataPoint(date=datetime(2024, 10, 1), value=Decimal("72500.00"), label="Okt"),
            ],
            forecast_next_year=Decimal("82000.00"),
        ),
    ]
    
    return AnalyticsDashboardResponse(
        vve_id=vve_id,
        period_start=datetime(2024, 1, 1),
        period_end=now,
        trends=trends,
        key_insights=[
            "Kosten zijn 3.2% lager dan vorig kwartaal",
            "Reservestand groeit gestaag (+8.5% YTD)",
            "Onderhoudskosten pieken in Q3 door seizoensgebonden werk",
        ],
        alerts=[
            "Lift onderhoudscontract verloopt in 45 dagen",
        ],
    )
