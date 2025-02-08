from fastapi import APIRouter, UploadFile, File
from fastapi.responses import FileResponse
import tempfile
import os
from ..services.pdf_to_docx_service import PdfTranslatorService
from ..services.pdf_to_pdf_service import PdfToPdfTranslationService

router = APIRouter()
pdf_translator_service = PdfTranslatorService()
pdf_to_pdf_translator_service = PdfToPdfTranslationService()

@router.post("/translate/pdf")
async def translate_pdf(file: UploadFile = File(...), src_language: str = "en", dest_language: str = "vi", dest_file: str = "docx"):
    # Create temporary files
    with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as temp_file:
        pdf_path = temp_file.name
        temp_file.write(await file.read())
    
    # Process the PDF and detect language
    if dest_file == "docx":
        output_filename="translated_document.docx"
        output_path = pdf_path.replace(".pdf", "_translated.docx")
        result = await pdf_translator_service.process_file(pdf_path, output_path, src_language, dest_language)

    else:
        output_filename="translated_document.pdf"
        output_path = pdf_path.replace(".pdf", "_translated.pdf")
        result = await pdf_to_pdf_translator_service.process_file(pdf_path, output_path, src_language, dest_language)

    # Cleanup temporary files
    os.unlink(pdf_path)

    # If there are no warnings and translation is successful, return FileResponse
    if "file_link" in result:
        return FileResponse(result["file_link"], media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document", filename=output_filename)
    
    # If warnings are found (language mismatch), return the error message
    else:
        return {"error": result["error"]}
