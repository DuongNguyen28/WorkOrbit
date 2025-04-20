from fastapi import APIRouter, Depends, UploadFile, File
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
    file: UploadFile = File(...),
    src_language: str = "en",
    dest_language: str = "vi",
    dest_file: str = "docx",
    db: Session = Depends(get_db),
):
    # Create temporary file
    with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as temp_file:
        pdf_path = temp_file.name
        temp_file.write(await file.read())
    
    if dest_file == "docx":
        output_filename = "translated_document.docx"
        output_path = pdf_path.replace(".pdf", "_translated.docx")
        result = await pdf_to_docx_translator_service.process_file(pdf_path, output_path, src_language, dest_language)
        media_type = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        out_type = "docx"
    else:
        output_filename = "translated_document.pdf"
        output_path = pdf_path.replace(".pdf", "_translated.pdf")
        result = await pdf_to_pdf_translator_service.process_file(pdf_path, output_path, src_language, dest_language)
        media_type = "application/pdf"
        out_type = "pdf"

    # Cleanup temporary file
    os.unlink(pdf_path)

    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])

    # Persist the original PDF (source="upload")
    save_file_record(db, FileCreate(
        user_id   = 1,                           # replace with real user later
        filename  = os.path.basename(pdf_path),
        file_type = "pdf",
        file_path = result["orig_url"],
        source    = "upload",
    ))

    # Persist the translated file (source="translated")
    local_out = result["local_path"]
    save_file_record(db, FileCreate(
        user_id   = 1,
        filename  = os.path.basename(local_out),
        file_type = out_type,
        file_path = result["trans_url"],
        source    = "translated",
    ))

    # Stream the translated file back to the client
    return FileResponse(
        path        = local_out,
        media_type  = media_type,
        filename    = os.path.basename(local_out),
    )