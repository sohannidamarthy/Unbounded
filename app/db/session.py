from sqlalchemy import create_engine
from sqlalchemy.engine import make_url
from sqlalchemy.orm import sessionmaker

from app.core.config import settings
from app.db.base import Base


def _database_engine_config(database_url: str) -> tuple[str, dict]:
    """Use pg8000 on serverless so Postgres does not need native libpq."""
    url = make_url(database_url)
    connect_args = {}

    if url.drivername in {"postgres", "postgresql", "postgresql+psycopg"}:
        query = dict(url.query)
        sslmode = query.pop("sslmode", None)
        query.pop("channel_binding", None)
        url = url.set(drivername="postgresql+pg8000", query=query)
        if sslmode and sslmode != "disable":
            connect_args["ssl_context"] = True

    return url.render_as_string(hide_password=False), connect_args


database_engine_url, database_connect_args = _database_engine_config(
    settings.database_url
)

engine = create_engine(
    database_engine_url,
    connect_args=database_connect_args,
    pool_pre_ping=True,
)

SessionLocal = sessionmaker(
    bind=engine,
    autoflush=False,
    autocommit=False,
    expire_on_commit=False,
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db() -> None:
    """Ensure core tables exist in the configured database."""
    from app.db import models  # noqa: F401

    Base.metadata.create_all(bind=engine)
