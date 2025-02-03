from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from googletrans import Translator, LANGUAGES

app = FastAPI()
translator = Translator()

# Define a request model for translation with language options
class TranslationRequest(BaseModel):
    text: str
    source_lang: str = 'en'  # Default to English
    dest_lang: str = 'vi'    # Default to Vietnamese

# Function to validate language codes
def validate_language_code(lang_code: str) -> str:
    """Validate and normalize language code."""
    lang_code = lang_code.lower()
    
    # Check if it's a valid language code
    if lang_code not in LANGUAGES:
        # Try to find a match if a full language name is provided
        matching_codes = [
            code for code, name in LANGUAGES.items() 
            if name.lower() == lang_code.lower()
        ]
        
        if matching_codes:
            return matching_codes[0]
        
        # If no match found, raise an error
        raise HTTPException(
            status_code=400, 
            detail=f"Invalid language code. Available languages: {list(LANGUAGES.keys())}"
        )
    
    return lang_code

# Async function to translate text
async def translate_text(text: str, source_lang: str = 'en', dest_lang: str = 'vi') -> str:
    """Translate text between specified languages."""
    try:
        # Validate language codes
        source_lang = validate_language_code(source_lang)
        dest_lang = validate_language_code(dest_lang)
        
        if not text.strip():
            raise HTTPException(status_code=400, detail="Text cannot be empty")
        
        # Perform translation
        translation = await translator.translate(
            text, 
            src=source_lang, 
            dest=dest_lang
        )
        
        return translation.text
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Translation error: {str(e)}")

# API Endpoint to translate text
@app.post("/translate/text")
async def translate_text_api(request: TranslationRequest):
    """API endpoint to translate text with language selection."""
    translated_text = await translate_text(
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

# Endpoint to get available languages
@app.get("/languages")
async def get_available_languages():
    """Return a list of available language codes and their names."""
    return {
        "languages": [
            {"code": code, "name": name.capitalize()} 
            for code, name in LANGUAGES.items()
        ]
    }

# Run the FastAPI app
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)