from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ..db import get_db
from ..deps import get_current_admin
from ..models import AdminUser
from ..schemas import LoginIn, LoginOut, ChangeCredentialsIn, MeOut
from ..security import verify_password, create_token, hash_password

router = APIRouter(prefix="/v1/auth", tags=["auth"])


@router.post("/login", response_model=LoginOut)
async def login(data: LoginIn, db: AsyncSession = Depends(get_db)):
    user = await db.scalar(select(AdminUser).where(AdminUser.email == data.email.lower()))
    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_token(user.email)
    return LoginOut(
        access_token=token,
        must_change_password=bool(user.must_change_password),
        email=user.email,
        full_name=user.full_name,
    )


@router.get("/me", response_model=MeOut)
async def me(current_admin: AdminUser = Depends(get_current_admin)):
    return MeOut(
        email=current_admin.email,
        full_name=current_admin.full_name,
        must_change_password=bool(current_admin.must_change_password),
    )


@router.post("/change-credentials", response_model=LoginOut)
async def change_credentials(
    data: ChangeCredentialsIn,
    current_admin: AdminUser = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    if not verify_password(data.current_password, current_admin.password_hash):
        raise HTTPException(status_code=400, detail="Current password is incorrect")

    if data.new_email:
        new_email = data.new_email.lower().strip()
        if new_email != current_admin.email:
            existing = await db.scalar(select(AdminUser).where(AdminUser.email == new_email))
            if existing:
                raise HTTPException(status_code=400, detail="Email already in use")
            current_admin.email = new_email

    current_admin.password_hash = hash_password(data.new_password)
    current_admin.must_change_password = False

    if data.full_name is not None:
        name = data.full_name.strip()
        if name:
            current_admin.full_name = name[:255]

    await db.commit()
    await db.refresh(current_admin)

    token = create_token(current_admin.email)
    return LoginOut(
        access_token=token,
        must_change_password=bool(current_admin.must_change_password),
        email=current_admin.email,
        full_name=current_admin.full_name,
    )
