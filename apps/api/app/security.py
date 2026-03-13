from datetime import datetime, timedelta, timezone

from jose import jwt, JWTError
from passlib.context import CryptContext

from .config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


# bcrypt only supports up to 72 bytes. Dokploy secrets/admin defaults can exceed that.
def _bcrypt_safe_secret(secret: str) -> str:
    raw = (secret or "").encode("utf-8")[:72]
    return raw.decode("utf-8", errors="ignore")


def hash_password(password: str) -> str:
    return pwd_context.hash(_bcrypt_safe_secret(password))


def verify_password(password: str, hashed: str) -> bool:
    return pwd_context.verify(_bcrypt_safe_secret(password), hashed)


def create_token(subject: str) -> str:
    exp = datetime.now(tz=timezone.utc) + timedelta(minutes=settings.JWT_EXPIRE_MINUTES)
    return jwt.encode({"sub": subject, "exp": exp}, settings.JWT_SECRET, algorithm="HS256")


def decode_token(token: str) -> dict:
    return jwt.decode(token, settings.JWT_SECRET, algorithms=["HS256"])


def extract_subject(token: str) -> str | None:
    try:
        payload = decode_token(token)
        return payload.get("sub")
    except JWTError:
        return None
