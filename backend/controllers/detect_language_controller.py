from fastapi import FastAPI, HTTPException
from ..services.language_detection_service import LanguageDetectionService
from fastapi import APIRouter
from fastapi import File, UploadFile
import io
import pymupdf
from docx import Document

app = FastAPI()
router = APIRouter()
language_service = LanguageDetectionService()

@router.post("/detect-language/text")
async def detect_language_text(text: str):
    if not text:
        raise HTTPException(status_code=400, detail="Text cannot be empty.")
    detected_language = await language_service.detect_language(text)
    return {"detected_language": detected_language}

@router.post("/detect-language/file")
async def detect_language_file(file: UploadFile = File(...)):
    content = await file.read()
    file_type = file.filename.split(".")[-1].lower()
    extracted_text = ""
    
    if file_type == "pdf":
        doc = pymupdf.open(stream=content, filetype="pdf")
        for page in doc:
            extracted_text += page.get_text("text")
    elif file_type == "docx":
        doc = Document(io.BytesIO(content))
        extracted_text = "\n".join([para.text for para in doc.paragraphs])
    else:
        raise HTTPException(status_code=400, detail="Unsupported file format. Only PDF and DOCX are allowed.")
    
    detected_language = await language_service.detect_language(extracted_text)
    return {"detected_language": detected_language}
