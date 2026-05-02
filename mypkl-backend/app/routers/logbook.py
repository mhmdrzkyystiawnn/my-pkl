from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import LogbookEntry, User
from ..schemas import LogbookCreate, LogbookResponse
from ..auth import get_current_user
import uuid

router = APIRouter()

@router.get("/", response_model=list[LogbookResponse])
def get_all(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return (
        db.query(LogbookEntry)
        .filter(LogbookEntry.user_id == current_user.id)
        .order_by(LogbookEntry.created_at.desc())
        .all()
    )

@router.post("/", response_model=LogbookResponse)
def create(entry: LogbookCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    new_entry = LogbookEntry(id=str(uuid.uuid4()), user_id=current_user.id, **entry.model_dump())
    db.add(new_entry)
    db.commit()
    db.refresh(new_entry)
    return new_entry

@router.delete("/{entry_id}")
def delete(entry_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    entry = db.query(LogbookEntry).filter(
        LogbookEntry.id == entry_id,
        LogbookEntry.user_id == current_user.id
    ).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Entry tidak ditemukan")
    db.delete(entry)
    db.commit()
    return {"message": "Deleted"}