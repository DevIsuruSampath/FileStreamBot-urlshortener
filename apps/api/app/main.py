from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select

from .db import engine, Base, SessionLocal, ensure_database_exists
from .models import AdminUser, VerificationSettings, CATEGORY_VALUES
from .security import hash_password
from .config import settings
from .routers.auth import router as auth_router
from .routers.settings import router as settings_router
from .routers.shortlinks import router as short_router
from .routers.content import router as content_router
from .routers.resolve import router as resolve_router
from .routers.analytics import router as analytics_router

app = FastAPI(title="FileStreamBot URL Shortener API", version="0.2.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(settings_router)
app.include_router(short_router)
app.include_router(content_router)
app.include_router(resolve_router)
app.include_router(analytics_router)


@app.get("/health")
async def health():
    return {"ok": True}


@app.get("/v1/categories")
async def categories():
    return {"categories": CATEGORY_VALUES}


@app.on_event("startup")
async def startup_event():
    await ensure_database_exists()

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with SessionLocal() as db:
        admin = await db.scalar(select(AdminUser).where(AdminUser.email == settings.DEFAULT_ADMIN_EMAIL.lower()))
        if not admin:
            db.add(
                AdminUser(
                    email=settings.DEFAULT_ADMIN_EMAIL.lower(),
                    password_hash=hash_password(settings.DEFAULT_ADMIN_PASSWORD),
                    must_change_password=True,
                    full_name="Admin",
                )
            )

        v = await db.scalar(select(VerificationSettings).limit(1))
        if not v:
            db.add(VerificationSettings(step_count=3, step1_seconds=10, step2_seconds=10, step3_seconds=10))

        await db.commit()
