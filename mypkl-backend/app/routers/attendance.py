from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import AttendanceRecord, User
from ..schemas import AttendanceCreate, AttendanceResponse
from ..auth import get_current_user
import uuid

router = APIRouter()

@router.get("/", response_model=list[AttendanceResponse])
def get_all(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(AttendanceRecord).filter(AttendanceRecord.user_id == current_user.id).all()

@router.get("/today", response_model=AttendanceResponse | None)
def get_today(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    from datetime import date
    today = str(date.today())
    return db.query(AttendanceRecord).filter(
        AttendanceRecord.user_id == current_user.id,
        AttendanceRecord.date == today
    ).first()

@router.post("/", response_model=AttendanceResponse)
def checkin(data: AttendanceCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    existing = db.query(AttendanceRecord).filter(
        AttendanceRecord.user_id == current_user.id,
        AttendanceRecord.date == data.date
    ).first()
    if existing:
        # Update checkout jika sudah ada record hari ini
        existing.check_out_time = data.check_out_time
        existing.total_hours = data.total_hours
        db.commit()
        db.refresh(existing)
        return existing
    new_record = AttendanceRecord(id=str(uuid.uuid4()), user_id=current_user.id, **data.model_dump())
    db.add(new_record)
    db.commit()
    db.refresh(new_record)
    return new_record