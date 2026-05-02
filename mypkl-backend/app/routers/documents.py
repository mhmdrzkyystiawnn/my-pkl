from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Document, User
from ..schemas import DocumentCreate, DocumentResponse
from ..auth import get_current_user
import uuid

router = APIRouter()

@router.get("/", response_model=list[DocumentResponse])
def get_all(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(Document).filter(Document.user_id == current_user.id).all()

@router.post("/", response_model=DocumentResponse)
def create(doc: DocumentCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    new_doc = Document(id=str(uuid.uuid4()), user_id=current_user.id, **doc.model_dump())
    db.add(new_doc)
    db.commit()
    db.refresh(new_doc)
    return new_doc

@router.delete("/{doc_id}")
def delete(doc_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    doc = db.query(Document).filter(
        Document.id == doc_id,
        Document.user_id == current_user.id
    ).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Dokumen tidak ditemukan")
    db.delete(doc)
    db.commit()
    return {"message": "Deleted"}