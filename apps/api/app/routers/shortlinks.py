import secrets
from urllib.parse import urlparse

from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ..config import settings
from ..db import get_db
from ..deps import get_current_admin
from ..models import ShortLink, CATEGORY_VALUES, AdminUser
from ..schemas import ShortLinkIn, ShortLinkOut, ShortLinkListItem

router = APIRouter(prefix="/v1/short-links", tags=["short-links"])


def _gen_code() -> str:
    return secrets.token_urlsafe(4).replace("-", "").replace("_", "")[:7]


def _short_url(code: str) -> str:
    return f"https://{settings.PUBLIC_WEB_HOST}/{code}"


def _is_valid_target_url(url: str) -> bool:
    try:
        p = urlparse(url)
        return p.scheme in {"http", "https"} and bool(p.netloc)
    except Exception:
        return False


@router.post("", response_model=ShortLinkOut)
async def create_short_link(
    payload: ShortLinkIn,
    db: AsyncSession = Depends(get_db),
    _: AdminUser = Depends(get_current_admin),
):
    target = payload.original_url.strip()
    if not _is_valid_target_url(target):
        raise HTTPException(status_code=400, detail="original_url must be a valid http/https URL")

    category = payload.category if payload.category in CATEGORY_VALUES else "Other"

    code = _gen_code()
    while await db.scalar(select(ShortLink).where(ShortLink.code == code)):
        code = _gen_code()

    row = ShortLink(
        code=code,
        original_url=target,
        category=category,
        title=payload.title.strip()[:255],
        active=True,
        click_count=0,
    )
    db.add(row)
    await db.commit()
    await db.refresh(row)

    return ShortLinkOut(
        code=code,
        short_url=_short_url(code),
        category=row.category,
        title=row.title,
    )


@router.get("", response_model=list[ShortLinkListItem])
async def list_short_links(
    db: AsyncSession = Depends(get_db),
    _: AdminUser = Depends(get_current_admin),
    limit: int = Query(default=30, ge=1, le=200),
):
    result = await db.execute(select(ShortLink).order_by(ShortLink.created_at.desc()).limit(limit))
    rows = result.scalars().all()

    return [
        ShortLinkListItem(
            code=r.code,
            short_url=_short_url(r.code),
            original_url=r.original_url,
            category=r.category,
            title=r.title,
            active=bool(r.active),
            click_count=int(r.click_count or 0),
            created_at=r.created_at,
        )
        for r in rows
    ]
