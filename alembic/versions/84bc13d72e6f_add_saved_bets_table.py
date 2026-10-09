"""add account saved bets

Revision ID: 84bc13d72e6f
Revises: c7d2e9a4f1b3
Create Date: 2026-10-08 00:00:00.000000
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision: str = "84bc13d72e6f"
down_revision: Union[str, Sequence[str], None] = "c7d2e9a4f1b3"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "saved_bets",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            primary_key=True,
            nullable=False,
        ),
        sa.Column(
            "user_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("users.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("payload", postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
    )
    op.create_index(
        "ix_saved_bets_user_created", "saved_bets", ["user_id", "created_at"]
    )


def downgrade() -> None:
    op.drop_index("ix_saved_bets_user_created", table_name="saved_bets")
    op.drop_table("saved_bets")
