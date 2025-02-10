from fastapi import APIRouter
from ..services.translation_evaluation_service import TranslationEvaluationService

router = APIRouter()
evaluation_service = TranslationEvaluationService()

@router.post("/evaluate/translation")
async def evaluate_translation(src_lang: str, dest_lang: str, original_text: str, translated_text: str, ):
    """
    Accepts original text, translated text, source language, and destination language
    and returns a translation review score.
    """
    review_score = await evaluation_service.evaluate_translation(original_text, translated_text, src_lang, dest_lang)
    return {"review_score": review_score}
