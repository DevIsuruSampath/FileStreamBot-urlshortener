from datetime import datetime

from sqlalchemy import String, Integer, Boolean, DateTime, Text
from sqlalchemy.orm import Mapped, mapped_column

from .db import Base


CATEGORY_VALUES = [
    "Movies",
    "TV-Series",
    "Music",
    "Games",
    "Software",
    "Courses",
    "Books",
    "Anime",
    "Sports",
    "Other",
]


class AdminUser(Base):
    __tablename__ = "admin_users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(String(255))
    must_change_password: Mapped[bool] = mapped_column(Boolean, default=True)
    full_name: Mapped[str] = mapped_column(String(255), default="Admin")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class VerificationSettings(Base):
    __tablename__ = "verification_settings"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, default=1)
    step_count: Mapped[int] = mapped_column(Integer, default=3)
    step1_seconds: Mapped[int] = mapped_column(Integer, default=10)
    step2_seconds: Mapped[int] = mapped_column(Integer, default=10)
    step3_seconds: Mapped[int] = mapped_column(Integer, default=10)


class ShortLink(Base):
    __tablename__ = "short_links"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    code: Mapped[str] = mapped_column(String(32), unique=True, index=True)
    original_url: Mapped[str] = mapped_column(Text)
    category: Mapped[str] = mapped_column(String(64), default="Other")
    title: Mapped[str] = mapped_column(String(255), default="")
    active: Mapped[bool] = mapped_column(Boolean, default=True)
    click_count: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class ContentPost(Base):
    __tablename__ = "content_posts"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    slug: Mapped[str] = mapped_column(String(128), unique=True, index=True)
    title: Mapped[str] = mapped_column(String(255))
    category: Mapped[str] = mapped_column(String(64), default="Other")
    markdown: Mapped[str] = mapped_column(Text)
    published: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
