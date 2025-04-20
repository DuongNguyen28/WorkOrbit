import uuid
import os
import time
from docx import Document
from ..services.elasticsearch_service import ElasticSearchService

class TextToDocService:
    def save_text_as_doc(self, text: str) -> str:
        """Generate a .docx file from text and return the file path."""
        file_name = f"Generated_Doc_{int(time.time())}.docx"
        file_path = os.path.join(os.getcwd(), "backend/misc", file_name)
        doc = Document()
        doc.add_paragraph(text)
        doc.save(file_path)
    
        es = ElasticSearchService()
        gcs_url = es.ingest_document(file_path, "docx")
        
        return file_path, gcs_url
