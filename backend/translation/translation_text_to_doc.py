from fastapi import FastAPI, Form
from fastapi.responses import FileResponse
from docx import Document
from fastapi.middleware.cors import CORSMiddleware
import uuid
import os

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app = FastAPI()

# Directory to store documents
OUTPUT_DIR = "docs"
os.makedirs(OUTPUT_DIR, exist_ok=True)

@app.post("/save-text/", summary="Convert text to .docx and return the file directly")
async def save_text_to_doc(text: str = Form(...)):
    """
    Accepts a string of text, generates a unique .docx file,
    and returns it as a downloadable response.
    """
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

