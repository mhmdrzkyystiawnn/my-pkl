from sqlalchemy import Column, String, Float, DateTime, Text, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True)
    email = Column(String, unique=True, nullable=False, index=True)
    hashed_password = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Satu user punya banyak data
    logbook = relationship("LogbookEntry", back_populates="user")
    documents = relationship("Document", back_populates="user")
    attendance = relationship("AttendanceRecord", back_populates="user")
    settings = relationship("Settings", back_populates="user", uselist=False)


class LogbookEntry(Base):
    __tablename__ = "logbook"

    id = Column(String, primary_key=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text)
    mood = Column(String)
    image = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="logbook")


class Document(Base):
    __tablename__ = "documents"

    id = Column(String, primary_key=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    name = Column(String, nullable=False)
    type = Column(String)
    link = Column(String)
    notes = Column(Text)
    added_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="documents")


class AttendanceRecord(Base):
    __tablename__ = "attendance"

    id = Column(String, primary_key=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    date = Column(String, nullable=False)
    check_in_time = Column(String)
    check_out_time = Column(String)
    total_hours = Column(Float, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="attendance")


class Settings(Base):
    __tablename__ = "settings"

    id = Column(String, primary_key=True)
    user_id = Column(String, ForeignKey("users.id"), unique=True, nullable=False)
    start_date = Column(String)
    end_date = Column(String)
    company_name = Column(String)
    supervisor_name = Column(String)

    user = relationship("User", back_populates="settings")