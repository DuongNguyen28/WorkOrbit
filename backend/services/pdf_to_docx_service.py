# from googletrans import Translator
import pymupdf
from docx import Document
from docx.shared import Pt
from google.cloud import translate_v2 as translate
from ..services.language_detection_service import LanguageDetectionService

class PdfToDocxTranslatorService:
    def __init__(self):
        # self.translator = Translator()
        self.translate_client = translate.Client()
        self.language_detector = LanguageDetectionService()

    async def translate_text(self, target: str, text: str):
        if isinstance(text, bytes):
            text = text.decode("utf-8")

        result = self.translate_client.translate(text, target_language=target)

        return result["translatedText"]

    async def translate_pdf(self, input_path: str, output_path: str, src_language: str, dest_language: str):
        """Extract text from a PDF, detect its language, compare with the selected source language, and translate."""
        doc = pymupdf.open(input_path)
        document = Document()
        alltext = ""
        warnings = []

        for page_num in range(len(doc)):
            page = doc.load_page(page_num)
            blocks = page.get_text("dict")["blocks"]

            for block in blocks:
                if block['type'] == 0:  # Only process text blocks (not images)
                    for line in block["lines"]:
                        for span in line["spans"]:
                            alltext += span["text"]
                        alltext += "\n"

                    # Detect the language of the extracted text
                    detected_language = await self.language_detector.detect_language(alltext)

                    # Compare detected language with the user's selected source language
                    if detected_language != src_language:
                        warnings.append(f"Warning: Detected language is {detected_language}, but the selected language is {src_language}.")
                        return warnings  # Return the warning and stop further processing
                    
                    # Translate the text to the destination language
                    translation = await self.translate_text(dest_language, src_text)
                    alltext = ""

                    # Handle text formatting and add it to the Word document
                    font_name = span["font"]
                    font_size = span["size"]

                    p = document.add_paragraph()
                    run = p.add_run(translation)
                    run.font.name = font_name
                    run.font.size = Pt(font_size)

        document.save(output_path)
        
        # If no warnings, return an empty list (indicating no issues)
        return warnings

    async def process_file(self, input_path: str, output_path: str, src_language: str, dest_language: str):
        """Determine file type, detect language, and process accordingly."""
        if input_path.endswith('.pdf'):
            warnings = await self.translate_pdf(input_path, output_path, src_language, dest_language)
            
            # If there are any warnings, return only the warnings without the file
            if warnings:
                return {"error": warnings}
            
            # If no warnings, return the translated file link
            return {"message": "Translation successful", "file_link": output_path}
        else:
            raise ValueError("Unsupported file format.")
