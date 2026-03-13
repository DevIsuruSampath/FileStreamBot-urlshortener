import asyncpg
from sqlalchemy.engine import make_url
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import declarative_base
from redis.asyncio import Redis

from .config import settings

engine = create_async_engine(settings.DATABASE_URL, echo=False, future=True)
SessionLocal = async_sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)
Base = declarative_base()

redis_client = Redis.from_url(settings.REDIS_URL, decode_responses=True)


def _quote_ident(name: str) -> str:
    return '"' + str(name).replace('"', '""') + '"'


async def ensure_database_exists():
    """Best-effort auto-create target PostgreSQL database if missing."""
    try:
        url = make_url(settings.DATABASE_URL)
    except Exception:
        return

    if not str(url.drivername).startswith("postgresql"):
        return

    target_db = str(url.database or "").strip()
    if not target_db:
        return

    admin_db = "postgres" if target_db.lower() != "postgres" else "template1"

    connect_kwargs = {
        "user": url.username,
        "password": url.password,
        "host": url.host or "localhost",
        "port": int(url.port or 5432),
        "database": admin_db,
    }

    sslmode = (url.query or {}).get("sslmode")
    if sslmode and sslmode.lower() in {"require", "verify-ca", "verify-full"}:
        connect_kwargs["ssl"] = True

    conn = None
    try:
        conn = await asyncpg.connect(**connect_kwargs)
        exists = await conn.fetchval("SELECT 1 FROM pg_database WHERE datname = $1", target_db)
        if not exists:
            await conn.execute(f"CREATE DATABASE {_quote_ident(target_db)}")
    finally:
        if conn:
            await conn.close()


async def get_db():
    async with SessionLocal() as session:
        yield session
