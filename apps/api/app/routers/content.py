from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ..db import get_db
from ..models import ContentPost, CATEGORY_VALUES
from ..schemas import ContentIn, ContentOut

router = APIRouter(prefix='/v1/content', tags=['content'])


@router.post('', response_model=ContentOut)
async def create_content(payload: ContentIn, db: AsyncSession = Depends(get_db)):
    category = payload.category if payload.category in CATEGORY_VALUES else 'Other'

    exists = await db.scalar(select(ContentPost).where(ContentPost.slug == payload.slug))
    if exists:
        raise HTTPException(status_code=400, detail='slug already exists')

    row = ContentPost(
        slug=payload.slug,
        title=payload.title,
        category=category,
        markdown=payload.markdown,
        published=True,
    )
    db.add(row)
    await db.commit()

    return ContentOut(slug=row.slug, title=row.title, category=row.category, markdown=row.markdown)


@router.get('/{slug}', response_model=ContentOut)
async def get_content(slug: str, db: AsyncSession = Depends(get_db)):
    row = await db.scalar(select(ContentPost).where(ContentPost.slug == slug, ContentPost.published.is_(True)))
    if not row:
        raise HTTPException(status_code=404, detail='not found')
    return ContentOut(slug=row.slug, title=row.title, category=row.category, markdown=row.markdown)
