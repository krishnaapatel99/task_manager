from sqlalchemy.orm import Session

from app.core.logging import logger
from app.core.config import get_settings
from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_refresh_token,
    hash_password,
    verify_password,
)
from app.models.user import User, UserRole
from app.schemas.user import Token, UserCreate


class AuthService:
    def __init__(self, db: Session) -> None:
        self.db = db
        self.settings = get_settings()

    def get_user_by_email(self, email: str) -> User | None:
        return self.db.query(User).filter(User.email == email).first()

    def get_user_by_id(self, user_id: int) -> User | None:
        return self.db.query(User).filter(User.id == user_id).first()

    def register_user(self, user_data: UserCreate) -> User:
        existing = self.get_user_by_email(user_data.email)
        if existing:
            raise ValueError("Email already registered")

        if user_data.role == UserRole.ADMIN.value:
            configured_key = self.settings.ADMIN_REGISTRATION_KEY
            if not configured_key or user_data.admin_registration_key != configured_key:
                raise ValueError("Invalid admin registration key")

        role = UserRole.ADMIN if user_data.role == UserRole.ADMIN.value else UserRole.USER
        new_user = User(
            username=user_data.username,
            email=user_data.email,
            hashed_password=hash_password(user_data.password),
            role=role,
        )
        self.db.add(new_user)
        self.db.commit()
        self.db.refresh(new_user)
        return new_user

    def login(self, email: str, password: str) -> Token:
        logger.info(f"Login attempt for email={email}")
        user = self.get_user_by_email(email)
        if not user or not verify_password(password, user.hashed_password):
            logger.warning(f"Failed login attempt for email={email}")
            raise ValueError("Invalid credentials")

        token = create_access_token(
            {"sub": str(user.id), "email": user.email, "role": user.role.value}
        )
        refresh_token = create_refresh_token(
            {"sub": str(user.id), "email": user.email, "role": user.role.value}
        )
        return Token(access_token=token, refresh_token=refresh_token)

    def refresh_access_token(self, refresh_token: str) -> Token:
        payload = decode_refresh_token(refresh_token)
        if not payload:
            raise ValueError("Invalid refresh token")

        user_id = payload.get("sub")
        if not user_id:
            raise ValueError("Invalid refresh token payload")

        user = self.get_user_by_id(int(user_id))
        if not user:
            raise ValueError("User no longer exists")

        access_token = create_access_token(
            {"sub": str(user.id), "email": user.email, "role": user.role.value}
        )
        new_refresh_token = create_refresh_token(
            {"sub": str(user.id), "email": user.email, "role": user.role.value}
        )
        return Token(access_token=access_token, refresh_token=new_refresh_token)
