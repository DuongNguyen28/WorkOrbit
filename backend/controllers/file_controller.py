from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List, Optional
from fastapi import HTTPException
from ..services.gcs_upload_service import GCSFileUploadService
from ..controllers.auth_controller import get_db
from ..schemas.file import FileOut
from ..models.file import File
from ..services.file_service import get_summary

router = APIRouter()
GCS = GCSFileUploadService()

@router.get("/recent_files", response_model=List[FileOut])
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
    q = q.order_by(desc(File.uploaded_at)).limit(5)
    return q.all()

# Get number of files
# image will contains .jpg, .jpeg, .png
@router.get("/summary")
def get_files_summary(db: Session = Depends(get_db)):
    summary = get_summary(db)
    if summary:
        return summary
    return {
        "pdf": 0,
        "docx": 0,
        "xlsx": 0,
        "image": 0
    }

# Get all documents
@router.get("/")
def get_all_documents(db: Session = Depends(get_db)):
    documents = db.query(File).order_by(desc(File.uploaded_at))
    return documents.all()

@router.delete("/files/{file_id}")
def delete_file(file_id: int, db: Session = Depends(get_db)):
    file = db.query(File).filter(File.id == file_id).first()
    
    if not file:
        raise HTTPException(status_code=404, detail="File not found")

    deleted_from_gcs = GCS.delete_gcs_file(file.file_path)
    if not deleted_from_gcs:
        raise HTTPException(status_code=500, detail="File not found in GCS or failed to delete")

    db.delete(file)
    db.commit()
    return {"message": f"File {file.filename} deleted from database and GCS"}