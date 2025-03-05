from .translate_client import TranslateClient
from fastapi import HTTPException
from typing import List
from ..services.language_detection_service import LanguageDetectionService
from googletrans import Translator, LANGUAGES

class TranslationService:
    def __init__(self):
        self.translate_client = TranslateClient()
        self.language_service = LanguageDetectionService()
        self.MAX_CHARS_PER_REQUEST = 5000

    def validate_language_code(self, lang_code: str) -> str:
        """Validate and normalize language code."""
        lang_code = lang_code.lower()
        
        if lang_code not in LANGUAGES:
            matching_codes = [
                code for code, name in LANGUAGES.items() 
                if name.lower() == lang_code.lower()
            ]
            
            if matching_codes:
                return matching_codes[0]
            
            raise HTTPException(
                status_code=400, 
                detail=f"Invalid language code. Available languages: {list(LANGUAGES.keys())}"
            )
        
        return lang_code

    async def translate(self, src_text: str, source_lang: str, dest_lang: str) -> str:
        warnings = []

        detected_language = await self.language_service.detect_language(src_text)
        # Compare detected language with the user's selected source language
        if detected_language != source_lang:
            warnings.append(f"Warning: Detected language is {detected_language}, but the selected language is {source_lang}.")
            return warnings  # Return the warning and stop further processing

        translation = await self.translate_client.translate_text(src_text, dest_lang)
        dest_text = translation if translation else "Translation Error"
        print(dest_text)

        return dest_text
        
        # except Exception as e:
        #     raise HTTPException(status_code=500, detail=f"Translation error: {str(e)}")
