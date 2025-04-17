# controllers/file_controller.py

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from ..controllers.database import get_db
from ..schemas.file import FileOut
from ..models.file import File

router = APIRouter()

@router.get("/files", response_model=List[FileOut])
def list_user_files(
    user_id: int = Query(..., description="User ID"),
    source: Optional[str] = Query(None, description="File source: upload, generated, translated"),
    db: Session = Depends(get_db)
):
    query = db.query(File).filter(File.user_id == user_id)
    if source:
        query = query.filter(File.source == source)
    return query.all()
