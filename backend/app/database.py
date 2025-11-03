"""
Database configuration and session management
Based on SQLAlchemy 2.0+ and technical specifications
"""
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from typing import Generator

from app.config import settings

# SQLAlchemy 2.0+ engine with async support ready
engine = create_engine(
    settings.database_url,
    echo=settings.database_echo,
    pool_pre_ping=True,
    pool_recycle=3600,
)

# Session factory
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

# Base class for all models
Base = declarative_base()


def get_db() -> Generator[Session, None, None]:
    """
    Dependency to get database session
    Used in FastAPI endpoints via Depends(get_db)
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()