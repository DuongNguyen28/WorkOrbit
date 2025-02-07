from googletrans import Translator, LANGUAGES
from fastapi import HTTPException
from typing import List

class TranslationService:
    def __init__(self):
        self.translator = Translator()
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

    def split_into_chunks(self, text: str, max_chars: int = 5000) -> List[str]:
        """Split text into chunks of maximum size while preserving word boundaries."""
        chunks = []
        current_chunk = []
        current_length = 0
        words = text.split()
        
        for word in words:
            word_length = len(word) + (1 if current_length > 0 else 0)
            if current_length + word_length > max_chars:
                chunks.append(' '.join(current_chunk))
                current_chunk = [word]
                current_length = len(word)
            else:
                current_chunk.append(word)
                current_length += word_length
        
        if current_chunk:
            chunks.append(' '.join(current_chunk))
            
        return chunks

    async def translate(self, text: str, source_lang: str, dest_lang: str) -> str:
        """Translate text by splitting it into chunks and translating each chunk."""
        try:
            source_lang = self.validate_language_code(source_lang)
            dest_lang = self.validate_language_code(dest_lang)
            
            if not text.strip():
                raise HTTPException(status_code=400, detail="Text cannot be empty")
            
            chunks = self.split_into_chunks(text)
            
            translated_chunks = []
            for chunk in chunks:
                translation = await self.translator.translate(chunk, src=source_lang, dest=dest_lang)
                translated_chunks.append(translation.text)
            
            return ' '.join(translated_chunks)
        
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Translation error: {str(e)}")
