from sqlalchemy import Column, Text
from sqlalchemy.dialects.postgresql import UUID
import sqlalchemy as sa

from app.db.base import Base


class Sport(Base):
    __tablename__ = "sports"

    id = Column(UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()"))
    key = Column(Text, nullable=False, unique=True)
    name = Column(Text, nullable=False)
