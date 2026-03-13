from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ..db import get_db
from ..models import AdminUser
from ..schemas import LoginIn, LoginOut, ChangePasswordIn
from ..security import verify_password, create_token, hash_password

router = APIRouter(prefix='/v1/auth', tags=['auth'])


@router.post('/login', response_model=LoginOut)
async def login(data: LoginIn, db: AsyncSession = Depends(get_db)):
    user = await db.scalar(select(AdminUser).where(AdminUser.email == data.email.lower()))
    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(status_code=401, detail='Invalid credentials')

    token = create_token(user.email)
    return LoginOut(access_token=token, must_change_password=bool(user.must_change_password))


@router.post('/change-password')
async def change_password(data: ChangePasswordIn, db: AsyncSession = Depends(get_db)):
    # Minimal bootstrap endpoint for first-login flows.
    user = await db.scalar(select(AdminUser).limit(1))
    if not user:
        raise HTTPException(status_code=404, detail='Admin not found')

    if data.new_email:
        user.email = data.new_email.lower()
    user.password_hash = hash_password(data.new_password)
    user.must_change_password = False
    await db.commit()
    return {'ok': True}
