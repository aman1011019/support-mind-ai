from sqlalchemy import create_engine, event
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from ..config import settings

db_url = settings.DATABASE_URL
if db_url.startswith("postgres://"):
    db_url = db_url.replace("postgres://", "postgresql://", 1)

# SQLAlchemy engine — SQLite for dev, PostgreSQL with pooling for production
if "sqlite" in db_url:
    sqlite_kwargs = {
        "connect_args": {"check_same_thread": False},
        "pool_pre_ping": True,
    }
    if ":memory:" in db_url:
        sqlite_kwargs["poolclass"] = StaticPool
    engine = create_engine(
        db_url,
        **sqlite_kwargs,
    )
else:
    engine = create_engine(
        db_url,
        pool_size=10,
        max_overflow=20,
        pool_recycle=3600,
        pool_pre_ping=True,
    )


# Enable WAL mode for SQLite (better concurrent read performance)
if "sqlite" in settings.DATABASE_URL:
    @event.listens_for(engine, "connect")
    def set_sqlite_pragma(dbapi_connection, connection_record):
        cursor = dbapi_connection.cursor()
        if ":memory:" not in settings.DATABASE_URL:
            cursor.execute("PRAGMA journal_mode=WAL")
        cursor.execute("PRAGMA foreign_keys=ON")
        cursor.close()

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    """FastAPI dependency: yields a DB session per request."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
