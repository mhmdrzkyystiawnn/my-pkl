from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Settings, User
from ..schemas import SettingsCreate, SettingsResponse
from ..auth import get_current_user
import uuid

router = APIRouter()

@router.get("/", response_model=SettingsResponse | None)
def get_settings(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(Settings).filter(Settings.user_id == current_user.id).first()

@router.post("/", response_model=SettingsResponse)
def save_settings(data: SettingsCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    settings = db.query(Settings).filter(Settings.user_id == current_user.id).first()
    if settings:
        for key, value in data.model_dump().items():
            setattr(settings, key, value)
    else:
        settings = Settings(id=str(uuid.uuid4()), user_id=current_user.id, **data.model_dump())
        db.add(settings)
    db.commit()
    db.refresh(settings)
    return settings