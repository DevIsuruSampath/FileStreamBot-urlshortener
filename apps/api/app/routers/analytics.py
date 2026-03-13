from collections import defaultdict
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from ..db import get_db
from ..deps import get_current_admin
from ..models import ShortLink, ContentPost, AdminUser, CATEGORY_VALUES
from ..schemas import AnalyticsOverviewOut, DayPoint, CategoryPoint

router = APIRouter(prefix="/v1/analytics", tags=["analytics"])


@router.get("/overview", response_model=AnalyticsOverviewOut)
async def analytics_overview(
    db: AsyncSession = Depends(get_db),
    _: AdminUser = Depends(get_current_admin),
):
    total_links = int((await db.scalar(select(func.count(ShortLink.id)))) or 0)
    total_clicks = int((await db.scalar(select(func.coalesce(func.sum(ShortLink.click_count), 0)))) or 0)
    total_content_posts = int((await db.scalar(select(func.count(ContentPost.id)))) or 0)

    now = datetime.now(tz=timezone.utc)
    start_day = (now - timedelta(days=6)).date()

    day_map: dict[str, int] = {}
    for i in range(7):
        d = (start_day + timedelta(days=i)).isoformat()
        day_map[d] = 0

    result = await db.execute(select(ShortLink.created_at))
    for (created_at,) in result.all():
        if not created_at:
            continue
        day = created_at.date().isoformat()
        if day in day_map:
            day_map[day] += 1

    links_last_7_days = [DayPoint(day=day, value=value) for day, value in day_map.items()]

    cat_count = defaultdict(int)
    result = await db.execute(select(ShortLink.category, func.count(ShortLink.id)).group_by(ShortLink.category))
    for cat, count in result.all():
        cat_count[str(cat)] = int(count)

    links_by_category = [
        CategoryPoint(category=cat, value=int(cat_count.get(cat, 0)))
        for cat in CATEGORY_VALUES
        if int(cat_count.get(cat, 0)) > 0
    ]

    return AnalyticsOverviewOut(
        total_links=total_links,
        total_clicks=total_clicks,
        total_content_posts=total_content_posts,
        links_last_7_days=links_last_7_days,
        links_by_category=links_by_category,
    )
