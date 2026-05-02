"""Initial schema

Revision ID: 0001_initial
Revises: 
Create Date: 2026-05-02 00:00:00.000000
"""

from alembic import op
import sqlalchemy as sa

revision = "0001_initial"
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        "users",
        sa.Column("id", sa.String(), primary_key=True),
        sa.Column("email", sa.String(), nullable=False, unique=True),
        sa.Column("hashed_password", sa.String(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("NOW()")),
    )
    op.create_table(
        "logbook",
        sa.Column("id", sa.String(), primary_key=True),
        sa.Column("user_id", sa.String(), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("title", sa.String(), nullable=False),
        sa.Column("description", sa.Text()),
        sa.Column("mood", sa.String()),
        sa.Column("image", sa.Text()),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("NOW()")),
    )
    op.create_table(
        "documents",
        sa.Column("id", sa.String(), primary_key=True),
        sa.Column("user_id", sa.String(), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("name", sa.String(), nullable=False),
        sa.Column("type", sa.String()),
        sa.Column("link", sa.String()),
        sa.Column("notes", sa.Text()),
        sa.Column("added_at", sa.DateTime(timezone=True), server_default=sa.text("NOW()")),
    )
    op.create_table(
        "attendance",
        sa.Column("id", sa.String(), primary_key=True),
        sa.Column("user_id", sa.String(), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("date", sa.String(), nullable=False),
        sa.Column("check_in_time", sa.String()),
        sa.Column("check_out_time", sa.String()),
        sa.Column("total_hours", sa.Float(), server_default=sa.text("0")),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("NOW()")),
    )
    op.create_table(
        "settings",
        sa.Column("id", sa.String(), primary_key=True),
        sa.Column("user_id", sa.String(), sa.ForeignKey("users.id"), unique=True, nullable=False),
        sa.Column("start_date", sa.String()),
        sa.Column("end_date", sa.String()),
        sa.Column("company_name", sa.String()),
        sa.Column("supervisor_name", sa.String()),
    )


def downgrade():
    op.drop_table("settings")
    op.drop_table("attendance")
    op.drop_table("documents")
    op.drop_table("logbook")
    op.drop_table("users")
