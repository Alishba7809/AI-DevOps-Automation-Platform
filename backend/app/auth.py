"""JWT authentication utilities, role checks, and FastAPI dependencies."""

from __future__ import annotations

from datetime import datetime, timedelta, timezone
from typing import Optional

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_db
from app.models import User, UserRole

# ---------------------------------------------------------------------
# Password hashing
# ---------------------------------------------------------------------
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(plain: str) -> str:
    return pwd_context.hash(plain)


def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)


# ---------------------------------------------------------------------
# JWT helpers
# ---------------------------------------------------------------------
def create_access_token(
    subject: str,
    role: str,
    expires_delta: Optional[timedelta] = None,
) -> str:
    """Create a signed JWT access token."""
    now = datetime.now(timezone.utc)
    expire = now + (
        expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    payload = {
        "sub": subject,
        "role": role,
        "exp": expire,
        "iat": now,
    }
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def decode_token(token: str) -> dict:
    """Decode and validate a JWT or raise a standard 401 response."""
    try:
        return jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
    except JWTError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired authentication token",
            headers={"WWW-Authenticate": "Bearer"},
        ) from exc


# ---------------------------------------------------------------------
# FastAPI dependencies
# ---------------------------------------------------------------------
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login", auto_error=False)


def _lookup_token_user(token: str, db: Session) -> User:
    """Resolve a valid token to an active database user.

    The role embedded in the JWT is informational only. Authorization always
    uses the current role stored in the database, so role changes take effect
    without waiting for old tokens to expire.
    """
    payload = decode_token(token)
    username = payload.get("sub")
    if not username or not isinstance(username, str):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication token is missing a subject",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User no longer exists",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="User is disabled")
    return user


def _get_or_create_system_user(db: Session) -> User:
    """Return the implicit admin used only when authentication is disabled."""
    user = db.query(User).filter(User.username == "system").first()
    if user:
        return user

    user = User(
        username="system",
        email="system@local",
        hashed_password=hash_password("system"),
        role=UserRole.ADMIN,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def get_current_user_optional(
    token: str | None = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> User | None:
    """Return the authenticated user when a Bearer token is supplied.

    Missing credentials are allowed, which is useful for the registration
    bootstrap flow. A supplied but invalid token is *not* silently treated as
    anonymous; it returns 401 to prevent authentication downgrade bugs.
    """
    if not token:
        return None
    return _lookup_token_user(token, db)


def get_current_user(
    token: str | None = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> User:
    """Return the current user, enforcing JWT when authentication is enabled.

    With ``ENABLE_AUTH=false`` the application behaves as a single-user demo
    and transparently uses an implicit ``system`` administrator. If a token is
    explicitly supplied even in demo mode, it is still validated normally.
    """
    if token:
        return _lookup_token_user(token, db)

    if not settings.ENABLE_AUTH:
        return _get_or_create_system_user(db)

    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Not authenticated",
        headers={"WWW-Authenticate": "Bearer"},
    )


def require_role(*allowed_roles: UserRole):
    """Dependency factory enforcing role-based access.

    ADMIN is always permitted. Pass the minimum non-admin roles that should
    also be allowed, for example ``require_role(UserRole.DEVELOPER)``.
    """

    allowed = set(allowed_roles)

    def _checker(user: User = Depends(get_current_user)) -> User:
        if user.role != UserRole.ADMIN and user.role not in allowed:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=(
                    "Insufficient permissions. Requires one of: "
                    + ", ".join(sorted(role.value for role in allowed | {UserRole.ADMIN}))
                ),
            )
        return user

    return _checker
