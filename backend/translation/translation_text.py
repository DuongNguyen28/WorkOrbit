from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from googletrans import Translator, LANGUAGES
from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, Form, Request
from fastapi.responses import FileResponse
from docx import Document
import uuid
import os



# Async function to translate text
from typing import List

app = FastAPI()

# Directory to store documents
OUTPUT_DIR = "docs"
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

translator = Translator()
MAX_CHARS_PER_REQUEST = 5000  # Google Translate's limit

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
MAX_CHARS_PER_REQUEST = 5000  # Google Translate's limit

async def translate_text(text: str, source_lang: str = 'en', dest_lang: str = 'vi') -> str:
    """
    Translate text by splitting it into chunks of maximum size while preserving word boundaries.
    
    Args:
        text (str): The text to translate
        source_lang (str): Source language code
        dest_lang (str): Destination language code
        
    Returns:
        str: Complete translated text
    """
    def split_into_chunks(text: str, max_chars: int = MAX_CHARS_PER_REQUEST) -> List[str]:
        """Split text into chunks of maximum size while preserving word boundaries."""
        chunks = []
        current_chunk = []
        current_length = 0
        
        # Split text into words
        words = text.split()
        
        for word in words:
            # Account for space between words
            word_length = len(word) + (1 if current_length > 0 else 0)
            
            if current_length + word_length > max_chars:
                # Current chunk is full, start a new one
                chunks.append(' '.join(current_chunk))
                current_chunk = [word]
                current_length = len(word)
            else:
                # Add word to current chunk
                current_chunk.append(word)
                current_length += word_length
        
        # Add the last chunk if it exists
        if current_chunk:
            chunks.append(' '.join(current_chunk))
            
        return chunks

    try:
        # Validate language codes
        source_lang = validate_language_code(source_lang)
        dest_lang = validate_language_code(dest_lang)
        
        if not text.strip():
            raise HTTPException(status_code=400, detail="Text cannot be empty")
        
        # Split text into chunks
        chunks = split_into_chunks(text)
        
        # Translate each chunk
        translated_chunks = []
        for chunk in chunks:
            translation = await translator.translate(
                chunk,
                src=source_lang,
                dest=dest_lang
            )
            translated_chunks.append(translation.text)
        
        # Join translated chunks with appropriate spacing
        return ' '.join(translated_chunks)
    
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

@app.post("/save-text/", summary="Convert text to .docx and return the file directly")
async def save_text_to_doc(text: str = None):
    """
    Accepts an optional string in the request body, generates a unique .docx file,
    and returns it as a downloadable response.
    """
    if not text:
        return {"error": "No text provided"}

    unique_id = str(uuid.uuid4())  # Generate a unique identifier
    file_name = f"{unique_id}.docx"  # Unique filename
    file_path = os.path.join(OUTPUT_DIR, file_name)

    # Create a Word document and save the text
    doc = Document()
    doc.add_paragraph(text)
    doc.save(file_path)

    # Return the file as a direct download (renamed to "translated_document.docx")
    return FileResponse(
        file_path,
        media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        filename="translated_document.docx"
    )


# Run the FastAPI app
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)