# from googletrans import Translator
import pymupdf
from .translate_client import TranslateClient
from ..services.language_detection_service import LanguageDetectionService

class PdfToPdfTranslationService:
    def __init__(self):
        # self.translator = Translator()
        self.translate_client = TranslateClient()
        self.language_service = LanguageDetectionService()
    
    async def process_file(self, input_path: str, output_path: str, src_language: str, dest_language: str):
        """Determine file type, detect language, and process accordingly."""
        if input_path.endswith('.pdf'):
            warnings = await self.translate_pdf(input_path, output_path, src_language, dest_language)
            
            if warnings:
                return {"error": warnings}
            
            return {"message": "Translation successful", "file_link": output_path}
        else:
            raise ValueError("Unsupported file format.")

    async def translate_pdf(self, input_path: str, output_path: str, src_language: str, dest_language: str):
        doc = pymupdf.open(input_path)
        ocg_xref = doc.add_ocg(dest_language, on=True)
        textflags = pymupdf.TEXT_DEHYPHENATE
        WHITE = pymupdf.pdfcolor["white"]
        warnings = []

        for page in doc:
            blocks = page.get_text("blocks", flags=textflags)

            for block in blocks:
                bbox = block[:4]
                src_text = block[4]

                detected_language = await self.language_service.detect_language(src_text)

                if detected_language != src_language:
                    warnings.append(f"Warning: Detected language is {detected_language}, but the selected language is {src_language}.")
                    return warnings  # Return the warning and stop further processing
                
                translation = await self.translate_client.translate_text(src_text, dest_language)
                dest_text = translation if translation else "Translation Error"

                if isinstance(dest_text, str) and dest_text.strip():
                    page.draw_rect(bbox, color=None, fill=WHITE, oc=ocg_xref)
                    try:
                        page.insert_htmlbox(bbox, dest_text, oc=ocg_xref)
                    except ValueError:
                        print(f"Skipping invalid text block: {src_text}")

        doc.save(output_path)
        return warnings