from fastapi import APIRouter, UploadFile, File
from fastapi.responses import FileResponse
import tempfile
import os
from ..services.video_translation_service import VideoTranslatorService

router = APIRouter()
video_translator_service = VideoTranslatorService()

@router.post("/translate-video")
async def translate_video(file: UploadFile = File(...)):
    """Accepts a video file, extracts audio, transcribes it, translates it, and generates a .docx document."""
    
    # Create temporary files
    with tempfile.NamedTemporaryFile(delete=False, suffix=".mp4") as temp_video:
        video_path = temp_video.name
        temp_video.write(await file.read())

    audio_path = video_path.replace(".mp4", ".wav")
    doc_path = video_path.replace(".mp4", ".docx")
    
    # Process video
    video_translator_service.extract_audio_from_video(video_path, audio_path)
    text = video_translator_service.transcribe_audio_to_text(audio_path)
    translated_text = await video_translator_service.translate_to_vietnamese(text)
    video_translator_service.write_translation_to_doc(text, translated_text, doc_path)
    
    # Cleanup temporary files
    os.unlink(video_path)
    os.unlink(audio_path)
    
    return FileResponse(
        doc_path,
        media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        filename="translated_document.docx"
    )
