from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ..db import get_db
from ..models import VerificationSettings
from ..schemas import VerificationSettingsOut, VerificationSettingsIn

router = APIRouter(prefix='/v1/settings', tags=['settings'])


@router.get('/verification', response_model=VerificationSettingsOut)
async def get_verification(db: AsyncSession = Depends(get_db)):
    row = await db.scalar(select(VerificationSettings).limit(1))
    if not row:
        row = VerificationSettings(step_count=3, step1_seconds=10, step2_seconds=10, step3_seconds=10)
        db.add(row)
        await db.commit()
        await db.refresh(row)
    return VerificationSettingsOut(
        step_count=row.step_count,
        step1_seconds=row.step1_seconds,
        step2_seconds=row.step2_seconds,
        step3_seconds=row.step3_seconds,
    )


@router.put('/verification', response_model=VerificationSettingsOut)
async def update_verification(payload: VerificationSettingsIn, db: AsyncSession = Depends(get_db)):
    if payload.step_count < 1 or payload.step_count > 3:
        raise HTTPException(status_code=400, detail='step_count must be 1..3')

    row = await db.scalar(select(VerificationSettings).limit(1))
    if not row:
        row = VerificationSettings()
        db.add(row)

    row.step_count = payload.step_count
    row.step1_seconds = payload.step1_seconds
    row.step2_seconds = payload.step2_seconds
    row.step3_seconds = payload.step3_seconds

    await db.commit()
    await db.refresh(row)

    return VerificationSettingsOut(
        step_count=row.step_count,
        step1_seconds=row.step1_seconds,
        step2_seconds=row.step2_seconds,
        step3_seconds=row.step3_seconds,
    )
