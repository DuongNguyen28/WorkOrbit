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
async def translate_pdf(file: UploadFile = File(...), src_language: str = "en", dest_language: str = "vi", dest_file: str = "docx"):
    # Create temporary files
    with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as temp_file:
        pdf_path = temp_file.name
        temp_file.write(await file.read())
    
    # Process the PDF and detect language
    if dest_file == "docx":
        output_path = pdf_path.replace(".pdf", "_translated.docx")
        result = await pdf_to_pdf_translator_service.process_file(pdf_path, output_path, src_language, dest_language)
        output_path=result["file_link"]
        output_filename=output_path

    else:
        output_path = pdf_path.replace(".pdf", "_translated.pdf")
        result = await pdf_to_pdf_translator_service.process_file(pdf_path, output_path, src_language, dest_language)
        output_path=result["file_link"]
        output_filename=output_path


    # Cleanup temporary files
    os.unlink(pdf_path)

    # If there are no warnings and translation is successful, return FileResponse
    if "file_link" in result and "cloud_link" in result:
        return {
            "file": FileResponse(result["file_link"], media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document", filename=output_filename),
            "cloud_link": result["cloud_link"]
        }
    
    # If warnings are found (language mismatch), return the error message
    else:
        return {"error": result["error"]}
