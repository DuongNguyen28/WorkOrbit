from fastapi import APIRouter
from pydantic import BaseModel
from ..services.text_translation_services import TranslationService

router = APIRouter()
translation_service = TranslationService()

class TranslationRequest(BaseModel):
    text: str
    source_lang: str = 'en'  # Default to English
    dest_lang: str = 'vi'    # Default to Vietnamese

@router.post("/translate/text")
async def translate_text_api(request: TranslationRequest):
    """API endpoint to translate text with language selection."""
    translated_text = await translation_service.translate(
        text=request.text, 
        source_lang=request.source_lang, 
        dest_lang=request.dest_lang
    )
    
    return {
        "original_text": request.text,
        "source_language": request.source_lang,
        "destination_language": request.dest_lang,
        "translated_text": translated_text
    }
