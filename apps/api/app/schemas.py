from datetime import datetime

from pydantic import BaseModel, EmailStr, Field


class LoginIn(BaseModel):
    email: EmailStr
    password: str


class LoginOut(BaseModel):
    access_token: str
    token_type: str = "bearer"
    must_change_password: bool
    email: EmailStr
    full_name: str


class ChangeCredentialsIn(BaseModel):
    current_password: str = Field(min_length=6)
    new_email: EmailStr | None = None
    new_password: str = Field(min_length=6)
    full_name: str | None = None


class MeOut(BaseModel):
    email: EmailStr
    full_name: str
    must_change_password: bool


class VerificationSettingsOut(BaseModel):
    step_count: int
    step1_seconds: int
    step2_seconds: int
    step3_seconds: int


class VerificationSettingsIn(VerificationSettingsOut):
    pass


class ShortLinkIn(BaseModel):
    original_url: str
    category: str = "Other"
    title: str = ""


class ShortLinkOut(BaseModel):
    code: str
    short_url: str
    category: str
    title: str


class ShortLinkListItem(BaseModel):
    code: str
    short_url: str
    original_url: str
    category: str
    title: str
    active: bool
    click_count: int
    created_at: datetime


class ResolveOut(BaseModel):
    code: str
    targetUrl: str
    requiresVerification: bool
    stepCount: int
    stepSeconds: list[int]


class ContentIn(BaseModel):
    slug: str
    title: str
    category: str = "Other"
    markdown: str
    published: bool = True


class ContentOut(BaseModel):
    slug: str
    title: str
    category: str
    markdown: str


class ContentListItem(BaseModel):
    slug: str
    title: str
    category: str
    published: bool
    created_at: datetime


class DayPoint(BaseModel):
    day: str
    value: int


class CategoryPoint(BaseModel):
    category: str
    value: int


class AnalyticsOverviewOut(BaseModel):
    total_links: int
    total_clicks: int
    total_content_posts: int
    links_last_7_days: list[DayPoint]
    links_by_category: list[CategoryPoint]
