from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse
from pydantic import BaseModel
from ..services.text_to_docx_service import TextToDocService
from fastapi import APIRouter


router = APIRouter()

app = FastAPI()
textToDocService = TextToDocService()
class TextRequest(BaseModel):
    text: str

@router.post("/save-text-to-doc")
async def save_text_to_doc(request: TextRequest):
    """Accepts an optional string in the request body, generates a unique .docx file,
    and returns it as a downloadable response."""
    text = request.text
    if not text:
        raise HTTPException(status_code=400, detail="No text provided")

    file_path = textToDocService.save_text_as_doc(text)

    return FileResponse(
        file_path,
        media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        filename="translated_document.docx"
    )
