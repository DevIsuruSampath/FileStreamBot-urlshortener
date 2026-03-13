import re

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ..db import get_db
from ..deps import get_current_admin
from ..models import ContentPost, CATEGORY_VALUES, AdminUser
from ..schemas import ContentIn, ContentOut, ContentListItem

router = APIRouter(prefix="/v1/content", tags=["content"])

SLUG_RE = re.compile(r"^[a-z0-9]+(?:-[a-z0-9]+)*$")


@router.post("", response_model=ContentOut)
async def create_content(
    payload: ContentIn,
    db: AsyncSession = Depends(get_db),
    _: AdminUser = Depends(get_current_admin),
):
    category = payload.category if payload.category in CATEGORY_VALUES else "Other"

    slug = payload.slug.strip().lower()
    if not slug:
        raise HTTPException(status_code=400, detail="slug is required")
    if not SLUG_RE.match(slug):
        raise HTTPException(status_code=400, detail="slug must use lowercase letters, numbers, and hyphen")

    exists = await db.scalar(select(ContentPost).where(ContentPost.slug == slug))
    if exists:
        raise HTTPException(status_code=400, detail="slug already exists")

    title = payload.title.strip()
    if not title:
        raise HTTPException(status_code=400, detail="title is required")
    markdown = payload.markdown.strip()
    if not markdown:
        raise HTTPException(status_code=400, detail="markdown is required")

    row = ContentPost(
        slug=slug,
        title=title[:255],
        category=category,
        markdown=markdown,
        published=bool(payload.published),
    )
    db.add(row)
    await db.commit()
    await db.refresh(row)

    return ContentOut(slug=row.slug, title=row.title, category=row.category, markdown=row.markdown)


@router.get("", response_model=list[ContentListItem])
async def list_published_content(
    db: AsyncSession = Depends(get_db),
    category: str | None = Query(default=None),
    limit: int = Query(default=50, ge=1, le=200),
):
    stmt = select(ContentPost).where(ContentPost.published.is_(True))
    if category and category in CATEGORY_VALUES:
        stmt = stmt.where(ContentPost.category == category)

    result = await db.execute(stmt.order_by(ContentPost.created_at.desc()).limit(limit))
    rows = result.scalars().all()

    return [
        ContentListItem(
            slug=r.slug,
            title=r.title,
            category=r.category,
            published=bool(r.published),
            created_at=r.created_at,
        )
        for r in rows
    ]


@router.get("/admin/list", response_model=list[ContentListItem])
async def admin_list_content(
    db: AsyncSession = Depends(get_db),
    _: AdminUser = Depends(get_current_admin),
    limit: int = Query(default=100, ge=1, le=500),
):
    result = await db.execute(select(ContentPost).order_by(ContentPost.created_at.desc()).limit(limit))
    rows = result.scalars().all()

    return [
        ContentListItem(
            slug=r.slug,
            title=r.title,
            category=r.category,
            published=bool(r.published),
            created_at=r.created_at,
        )
        for r in rows
    ]


@router.get("/{slug}", response_model=ContentOut)
async def get_content(slug: str, db: AsyncSession = Depends(get_db)):
    row = await db.scalar(select(ContentPost).where(ContentPost.slug == slug.lower(), ContentPost.published.is_(True)))
    if not row:
        raise HTTPException(status_code=404, detail="not found")
    return ContentOut(slug=row.slug, title=row.title, category=row.category, markdown=row.markdown)
