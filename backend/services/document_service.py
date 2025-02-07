import uuid
import os
from docx import Document

class DocumentService:
    def __init__(self):
        self.OUTPUT_DIR = "docs"
        os.makedirs(self.OUTPUT_DIR, exist_ok=True)

    def save_text_as_doc(self, text: str) -> str:
        """Generate a .docx file from text and return the file path."""
        unique_id = str(uuid.uuid4())  # Generate a unique identifier
        file_name = f"{unique_id}.docx"
        file_path = os.path.join(self.OUTPUT_DIR, file_name)

        doc = Document()
        doc.add_paragraph(text)
        doc.save(file_path)
        
        return file_path
