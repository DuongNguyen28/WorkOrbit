from fastapi import APIRouter, UploadFile, File
from fastapi.responses import FileResponse
import tempfile
import os
from ..services.pdf_to_docx_service import PdfToDocxTranslatorService
from ..services.pdf_to_pdf_service import PdfToPdfTranslationService

router = APIRouter()
pdf_to_docx_translator_service = PdfToDocxTranslatorService()
pdf_to_pdf_translator_service = PdfToPdfTranslationService()

@router.post("/translate/document")
async def translate_pdf(
    file: UploadFile = File(...),
    src_language: str = "en",
    dest_language: str = "vi",
    dest_file: str = "docx"
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
    else:
        output_filename = "translated_document.pdf"
        output_path = pdf_path.replace(".pdf", "_translated.pdf")
        result = await pdf_to_pdf_translator_service.process_file(pdf_path, output_path, src_language, dest_language)
        media_type = "application/pdf"

    # Cleanup temporary file
    os.unlink(pdf_path)

    if "file_link" in result:
        return FileResponse(result["file_link"], media_type=media_type, filename=output_filename)
    else:
        return {"error": result["error"]}