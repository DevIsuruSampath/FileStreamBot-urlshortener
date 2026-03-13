from fastapi import APIRouter, Depends, Request, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ..db import get_db
from ..models import ShortLink, VerificationSettings
from ..schemas import ResolveOut
from ..config import settings

router = APIRouter(prefix="/v1/resolve", tags=["resolve"])


def _normalize_host(host: str) -> str:
    return (host or "").split(":")[0].strip().lower()


@router.get("/{code}", response_model=ResolveOut)
async def resolve(code: str, request: Request, db: AsyncSession = Depends(get_db)):
    row = await db.scalar(select(ShortLink).where(ShortLink.code == code, ShortLink.active.is_(True)))
    if not row:
        raise HTTPException(status_code=404, detail="code not found")

    v = await db.scalar(select(VerificationSettings).limit(1))
    if not v:
        v = VerificationSettings(step_count=3, step1_seconds=10, step2_seconds=10, step3_seconds=10)
        db.add(v)
        await db.commit()
        await db.refresh(v)

    host = _normalize_host(request.headers.get("host") or "")

    # User type rule:
    # 1) Short-link visitors on exa.com => verify flow ON
    # 2) Direct content visitors on adsexample.com => verify flow OFF
    requires = host != _normalize_host(settings.PUBLIC_CONTENT_HOST)

    row.click_count = int(row.click_count or 0) + 1
    await db.commit()

    return ResolveOut(
        code=row.code,
        targetUrl=row.original_url,
        requiresVerification=requires,
        stepCount=max(1, min(3, int(v.step_count))),
        stepSeconds=[int(v.step1_seconds), int(v.step2_seconds), int(v.step3_seconds)],
    )
