from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
from ..services.document_service import DocumentService

router = APIRouter()
document_service = DocumentService()

@router.post("/save/text/", summary="Convert text to .docx and return the file directly")
async def save_text_to_doc(text: str = None):
    """Accepts an optional string in the request body, generates a unique .docx file,
    and returns it as a downloadable response."""
    if not text:
        return {"error": "No text provided"}

    file_path = document_service.save_text_as_doc(text)

    return FileResponse(
        file_path,
        media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        filename="translated_document.docx"
    )
