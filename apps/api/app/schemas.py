from pydantic import BaseModel, EmailStr, Field


class LoginIn(BaseModel):
    email: EmailStr
    password: str


class LoginOut(BaseModel):
    access_token: str
    token_type: str = 'bearer'
    must_change_password: bool


class ChangePasswordIn(BaseModel):
    new_email: EmailStr | None = None
    new_password: str = Field(min_length=6)


class VerificationSettingsOut(BaseModel):
    step_count: int
    step1_seconds: int
    step2_seconds: int
    step3_seconds: int


class VerificationSettingsIn(VerificationSettingsOut):
    pass


class ShortLinkIn(BaseModel):
    original_url: str
    category: str = 'Other'
    title: str = ''


class ShortLinkOut(BaseModel):
    code: str
    short_url: str
    category: str
    title: str


class ResolveOut(BaseModel):
    code: str
    targetUrl: str
    requiresVerification: bool
    stepCount: int
    stepSeconds: list[int]


class ContentIn(BaseModel):
    slug: str
    title: str
    category: str = 'Other'
    markdown: str


class ContentOut(BaseModel):
    slug: str
    title: str
    category: str
    markdown: str
