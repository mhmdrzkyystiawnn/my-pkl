from pydantic import BaseModel, ConfigDict, EmailStr, constr
from typing import Optional
from datetime import datetime

DATE_PATTERN = r"^\d{4}-\d{2}-\d{2}$"
TIME_PATTERN = r"^\d{2}:\d{2}$"

# ── AUTH ──────────────────────────────────────────
class UserRegister(BaseModel):
    email: EmailStr
    password: constr(min_length=8)

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"

class UserResponse(BaseModel):
    id: str
    email: str
    class Config:
        from_attributes = True

# ── LOGBOOK ───────────────────────────────────────
class LogbookCreate(BaseModel):
    title: str
    description: Optional[str] = None
    mood: Optional[str] = None
    image: Optional[str] = None

class LogbookResponse(LogbookCreate):
    model_config = ConfigDict(from_attributes=True)

    id: str
    created_at: datetime   # ← ganti dari str ke datetime

# ── DOCUMENTS ─────────────────────────────────────
class DocumentCreate(BaseModel):
    name: str
    type: Optional[str] = "lainnya"
    link: Optional[str] = None
    notes: Optional[str] = None

class DocumentResponse(DocumentCreate):
    id: str
    added_at: datetime     # ← ganti dari str ke datetime
    class Config:
        from_attributes = True

# ── ATTENDANCE ────────────────────────────────────
class AttendanceCreate(BaseModel):
    date: constr(pattern=DATE_PATTERN)
    check_in_time: constr(pattern=TIME_PATTERN)
    check_out_time: Optional[constr(pattern=TIME_PATTERN)] = None
    total_hours: float = 0

class AttendanceResponse(AttendanceCreate):
    model_config = ConfigDict(from_attributes=True)

    id: str
    created_at: datetime   # ← ganti dari str ke datetime

# ── SETTINGS ──────────────────────────────────────
class SettingsCreate(BaseModel):
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    company_name: Optional[str] = None
    supervisor_name: Optional[str] = None

class SettingsResponse(SettingsCreate):
    id: str
    class Config:
        from_attributes = True