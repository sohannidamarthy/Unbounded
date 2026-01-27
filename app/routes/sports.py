from typing import List

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.auth import get_current_user
from app.db.models.sports import Sport
from app.db.session import get_db

router = APIRouter(prefix="/v1", tags=["sports"])


@router.get("/sports")
def list_sports(
    db: Session = Depends(get_db),
    _user=Depends(get_current_user),
) -> List[dict]:
    stmt = select(Sport).order_by(Sport.name)
    sports = db.scalars(stmt).all()
    return [
        {"id": str(sport.id), "key": sport.key, "name": sport.name}
        for sport in sports
    ]
