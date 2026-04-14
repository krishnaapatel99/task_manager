from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    """Base class for all SQLAlchemy models."""
    pass


# Ensure models are imported so metadata includes all tables.
from app.models import task, user  # noqa: E402,F401
