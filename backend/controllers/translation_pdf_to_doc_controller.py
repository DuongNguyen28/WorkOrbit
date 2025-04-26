from fastapi import APIRouter, Depends, Form, HTTPException, UploadFile, File
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
import tempfile
import os
from ..services.pdf_to_docx_service import PdfToDocxTranslatorService
from ..services.pdf_to_pdf_service import PdfToPdfTranslationService
from ..controllers.auth_controller import get_db
from ..schemas.file import FileCreate
from ..services.file_service import save_file_record


router = APIRouter()
pdf_to_docx_translator_service = PdfToDocxTranslatorService()
pdf_to_pdf_translator_service = PdfToPdfTranslationService()

@router.post("/translate/document")
async def translate_pdf(
    file: UploadFile,
    src_language: str = Form(...),
    dest_language: str = Form(...),
    dest_file: str = Form(...),
    db: Session = Depends(get_db),
):
    # Create temporary file
    with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as temp_file:
        pdf_path = temp_file.name
        temp_file.write(await file.read())
    
    if dest_file == "docx":
        result = await pdf_to_docx_translator_service.process_file(pdf_path, src_language, dest_language)
        media_type = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    else:
        result = await pdf_to_pdf_translator_service.process_file(pdf_path, src_language, dest_language)
        media_type = "application/pdf"

    if "error" in result:
        return {"error": result["error"]}

    save_file_record(db, FileCreate(
        user_id   = 1,                           # replace with real user later
        filename  = os.path.basename(pdf_path),
        file_type = "pdf",
        file_path = result["orig_url"],
        source    = "upload",
    ))

    local_out = result["local_path"]
    save_file_record(db, FileCreate(
        user_id   = 1,
        filename  = os.path.basename(local_out),
        file_type = "pdf" if dest_file == "pdf" else "docx",
        file_path = result["trans_url"],
        source    = "translated",
    ))

    os.unlink(pdf_path)

    return FileResponse(
        path        = local_out,
        media_type  = media_type,
        filename    = os.path.basename(local_out),
    )