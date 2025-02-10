from fastapi import APIRouter, UploadFile, File
from fastapi.responses import FileResponse, JSONResponse
import tempfile
import os
from ..services.video_translation_service import VideoTranslatorService

router = APIRouter()
video_translator_service = VideoTranslatorService()

@router.post("/translate/video")
async def translate_video(file: UploadFile = File(...), src_language: str = "en", dest_language: str = "vi"):
    """Accepts a video file, extracts audio, transcribes it, translates it, and generates a .docx document."""
    warnings, doc_path = await video_translator_service.process_video_translation(file, src_language, dest_language)
    
    if warnings:
        return JSONResponse(content={"warnings": warnings}, status_code=400)
    
    return FileResponse(
        doc_path,
        media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        filename="translated_document.docx"
    )
