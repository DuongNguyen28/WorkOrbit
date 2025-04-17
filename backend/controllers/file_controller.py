from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List, Optional

from ..controllers.auth_controller import get_db
from ..schemas.file import FileOut
from ..models.file import File

router = APIRouter()

@router.get("/files", response_model=List[FileOut])
def list_files(
    user_id: Optional[int]   = Query(None, description="Filter by user ID"),
    source:  Optional[str]   = Query(None, description="Filter by source: upload, generated, translated"),
    file_type: Optional[str] = Query(None, description="Filter by file type, e.g. pdf, docx, image"),
    db: Session              = Depends(get_db)
):
    q = db.query(File)
    if user_id is not None:
        q = q.filter(File.user_id == user_id)
    if source:
        q = q.filter(File.source == source)
    if file_type:
        q = q.filter(File.file_type == file_type)
    q = q.order_by(desc(File.uploaded_at))
    return q.all()
