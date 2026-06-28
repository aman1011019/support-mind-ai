from passlib.context import CryptContext
from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
import httpx
import hashlib
from ..config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify standard text password against saved bcrypt hash."""
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """Generate bcrypt hash for user password."""
    return pwd_context.hash(password)





def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(hours=settings.JWT_EXPIRE_HOURS))
    to_encode.update({"exp": expire, "iat": datetime.utcnow()})
    return jwt.encode(to_encode, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)


def decode_access_token(token: str) -> Optional[dict]:
    try:
        payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
        return payload
    except JWTError:
        return None


def hash_token(token: str) -> str:
    """Hash JWTs before saving session records."""
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


def verify_google_token(credential: str) -> Optional[dict]:
    """Verify Google ID token and return user info dict."""
    try:
        resp = httpx.get(
            "https://www.googleapis.com/oauth2/v3/tokeninfo",
            params={"id_token": credential},
            timeout=10.0
        )
        if resp.status_code != 200:
            return None
        data = resp.json()
        if "error" in data:
            return None
        # Validate audience
        if settings.GOOGLE_CLIENT_ID and data.get("aud") != settings.GOOGLE_CLIENT_ID:
            return None
        if data.get("email_verified") != "true":
            return None
        return {
            "google_id": data.get("sub"),
            "email": data.get("email"),
            "name": data.get("name"),
            "picture": data.get("picture"),
            "email_verified": data.get("email_verified") == "true",
        }
    except Exception:
        return None
