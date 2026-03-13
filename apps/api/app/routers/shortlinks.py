import secrets
from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ..db import get_db
from ..models import ShortLink, CATEGORY_VALUES
from ..schemas import ShortLinkIn, ShortLinkOut

router = APIRouter(prefix='/v1/short-links', tags=['short-links'])


def _gen_code() -> str:
    return secrets.token_urlsafe(4).replace('-', '').replace('_', '')[:7]


@router.post('', response_model=ShortLinkOut)
async def create_short_link(payload: ShortLinkIn, db: AsyncSession = Depends(get_db)):
    category = payload.category if payload.category in CATEGORY_VALUES else 'Other'

    code = _gen_code()
    while await db.scalar(select(ShortLink).where(ShortLink.code == code)):
        code = _gen_code()

    row = ShortLink(
        code=code,
        original_url=payload.original_url.strip(),
        category=category,
        title=payload.title.strip(),
    )
    db.add(row)
    await db.commit()

    return ShortLinkOut(
        code=code,
        short_url=f'https://exa.com/{code}',
        category=row.category,
        title=row.title,
    )
