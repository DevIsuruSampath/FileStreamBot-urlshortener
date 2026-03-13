from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import declarative_base
from redis.asyncio import Redis

from .config import settings

engine = create_async_engine(settings.DATABASE_URL, echo=False, future=True)
SessionLocal = async_sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)
Base = declarative_base()

redis_client = Redis.from_url(settings.REDIS_URL, decode_responses=True)


async def get_db():
    async with SessionLocal() as session:
        yield session
