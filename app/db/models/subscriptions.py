import uuid
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID
from app.db.base import Base


class Subscription(Base):
    __tablename__ = "subscriptions"

    id = sa.Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )

    user_id = sa.Column(
        UUID(as_uuid=True),
        sa.ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    plan = sa.Column(
        sa.Enum("FREE", "PRO", "ELITE", name="plan_enum"),
        nullable=False,
        server_default="FREE",
    )

    status = sa.Column(
        sa.Enum("active", "past_due", "canceled", name="subscription_status_enum"),
        nullable=False,
        server_default="active",
    )

    current_period_end = sa.Column(sa.DateTime(timezone=True))

    created_at = sa.Column(
        sa.DateTime(timezone=True),
        server_default=sa.func.now(),
        nullable=False,
    )

    updated_at = sa.Column(
        sa.DateTime(timezone=True),
        server_default=sa.func.now(),
        onupdate=sa.func.now(),
        nullable=False,
    )
