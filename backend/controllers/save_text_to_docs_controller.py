from datetime import datetime, timedelta, timezone
import os

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from pydantic import BaseModel
from sqlalchemy.orm import Session

from ..controllers.auth_controller import get_db
from ..schemas.file import FileCreate
from ..services.text_to_docx_service import TextToDocService
from ..services.file_service import save_file_record

router = APIRouter()
text_to_doc_service = TextToDocService()
EST = timezone(timedelta(hours=-5), name="EST")

class TextRequest(BaseModel):
    text: str

@router.post("/save-text-to-doc")
async def save_text_to_doc(
    request: TextRequest,
    db: Session = Depends(get_db),   # ← inject the real DB session here
):
    if not request.text:
        raise HTTPException(status_code=400, detail="No text provided")

    local_path, gcs_url = text_to_doc_service.save_text_as_doc(request.text)

    save_file_record(db, FileCreate(
        user_id   = 1,  # replace with current_user.id once auth is wired
        filename  = os.path.basename(local_path),
        file_type = "docx",
        file_path = gcs_url,
        uploaded_at=datetime.now(EST),
        source    = "generated",
    ))

    return FileResponse(
        path        = local_path,
        media_type  = "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        filename    = os.path.basename(local_path),
    )
