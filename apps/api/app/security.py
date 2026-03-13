from datetime import datetime, timedelta, timezone
from passlib.context import CryptContext
from jose import jwt

from .config import settings

pwd_context = CryptContext(schemes=['bcrypt'], deprecated='auto')


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(password: str, hashed: str) -> bool:
    return pwd_context.verify(password, hashed)


def create_token(subject: str) -> str:
    exp = datetime.now(tz=timezone.utc) + timedelta(minutes=settings.JWT_EXPIRE_MINUTES)
    return jwt.encode({'sub': subject, 'exp': exp}, settings.JWT_SECRET, algorithm='HS256')
