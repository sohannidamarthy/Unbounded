from sqlalchemy import Column, Text, ForeignKey, Index
from sqlalchemy.dialects.postgresql import UUID
import sqlalchemy as sa

from app.db.base import Base


class Event(Base):
    __tablename__ = "events"

    id = Column(UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()"))

    sport_id = Column(UUID(as_uuid=True), ForeignKey("sports.id", ondelete="CASCADE"), nullable=False)

    start_time = Column(sa.DateTime(timezone=True), nullable=False)

    home_team = Column(Text, nullable=False)
    away_team = Column(Text, nullable=False)

    external_event_id = Column(Text, unique=True, nullable=True)

    __table_args__ = (
        Index("ix_events_sport_id_start_time", "sport_id", "start_time"),
    )
