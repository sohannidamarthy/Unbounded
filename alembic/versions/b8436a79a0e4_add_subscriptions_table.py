"""add subscriptions table

Revision ID: b8436a79a0e4
Revises: f869fbe66abc
Create Date: 2026-01-10 20:22:59.699578

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "b8436a79a0e4"
down_revision: Union[str, Sequence[str], None] = "f869fbe66abc"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute("CREATE EXTENSION IF NOT EXISTS pgcrypto")

    op.create_table(
        "subscriptions",
        sa.Column(
            "id",
            sa.UUID(),
            server_default=sa.text("gen_random_uuid()"),
            primary_key=True,
        ),
        # FIX: must match users.id type (UUID)
        sa.Column("user_id", sa.UUID(), nullable=False),
        sa.Column(
            "plan",
            sa.Enum("FREE", "PRO", "ELITE", name="plan_enum"),
            nullable=False,
            server_default=sa.text("'FREE'"),
        ),
        sa.Column(
            "status",
            sa.Enum("active", "past_due", "canceled", name="subscription_status_enum"),
            nullable=False,
            server_default=sa.text("'active'"),
        ),
        sa.Column("current_period_end", sa.DateTime(timezone=True)),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
    )

    op.create_index(
        "ix_subscriptions_user_id",
        "subscriptions",
        ["user_id"],
        unique=True,
    )


def downgrade() -> None:
    op.drop_index("ix_subscriptions_user_id", table_name="subscriptions")
    op.drop_table("subscriptions")
    op.execute("DROP TYPE IF EXISTS subscription_status_enum")
    op.execute("DROP TYPE IF EXISTS plan_enum")

