"""add founders circle signups table

Revision ID: d287d8375c5f
Revises: 5f0b1c2d3e4f
Create Date: 2026-09-01 09:27:09.138134

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "d287d8375c5f"
down_revision: Union[str, Sequence[str], None] = "5f0b1c2d3e4f"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute("CREATE EXTENSION IF NOT EXISTS pgcrypto")

    op.create_table(
        "founders_circle_signups",
        sa.Column(
            "id",
            sa.UUID(),
            server_default=sa.text("gen_random_uuid()"),
            primary_key=True,
        ),
        sa.Column("first_name", sa.Text(), nullable=False),
        sa.Column("last_name", sa.Text(), nullable=False),
        sa.Column("email", sa.Text(), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
    )

    op.create_index(
        "ix_founders_circle_signups_email",
        "founders_circle_signups",
        ["email"],
        unique=False,
    )


def downgrade() -> None:
    op.drop_index(
        "ix_founders_circle_signups_email",
        table_name="founders_circle_signups",
    )
    op.drop_table("founders_circle_signups")
