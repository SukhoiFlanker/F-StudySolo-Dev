"""User usage analytics routes."""

from fastapi import APIRouter, Depends, Query
from supabase import AsyncClient

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.usage import UsageLiveResponse, UsageOverviewResponse, UsageTimeseriesResponse
from app.services.usage_analytics import get_usage_live, get_usage_overview, get_usage_timeseries

router = APIRouter(tags=["usage"])


@router.get("/overview", response_model=UsageOverviewResponse)
async def usage_overview(
    range_value: str = Query(default="24h", alias="range"),
    current_user: dict = Depends(get_current_user),
    db: AsyncClient = Depends(get_db),
) -> UsageOverviewResponse:
    return await get_usage_overview(db, range_value=range_value, user_id=current_user["id"])


@router.get("/live", response_model=UsageLiveResponse)
async def usage_live(
    window: str = Query(default="5m"),
    current_user: dict = Depends(get_current_user),
    db: AsyncClient = Depends(get_db),
) -> UsageLiveResponse:
    return await get_usage_live(db, window_value=window, user_id=current_user["id"])


@router.get("/timeseries", response_model=UsageTimeseriesResponse)
async def usage_timeseries(
    range_value: str = Query(default="24h", alias="range"),
    source: str = Query(default="all"),
    current_user: dict = Depends(get_current_user),
    db: AsyncClient = Depends(get_db),
) -> UsageTimeseriesResponse:
    return await get_usage_timeseries(
        db,
        range_value=range_value,
        user_id=current_user["id"],
        source_filter=source,
    )
