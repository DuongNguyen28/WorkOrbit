from googletrans import Translator
import pymupdf

class PdfToPdfTranslationService:
    def __init__(self):
        self.translator = Translator()
        self.languages = {
            "ko":"Korean",
            "vi":"Vietnamese",
            "en":"English"
        }
    
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

    async def translate_pdf(self, input_path: str, output_path: str, src_language: str, dest_language: str):
        doc = pymupdf.open(input_path)
        ocg_xref = doc.add_ocg(self.languages.get(dest_language), on=True)
        textflags = pymupdf.TEXT_DEHYPHENATE
        WHITE = pymupdf.pdfcolor["white"]

        for page in doc:
            blocks = page.get_text("blocks", flags=textflags)

            for block in blocks:
                bbox = block[:4]  # area containing the text
                src_text = block[4]  # the text of this block

                # Invoke the actual translation to deliver us a Korean string
                translation = await self.translator.translate(src_text, src=src_language, dest=dest_language)
                dest_text = translation.text if translation else "Translation Error"

                # Cover the English text with a white rectangle.
                if isinstance(dest_text, str) and dest_text.strip():
                    # Cover the original text with a white rectangle
                    page.draw_rect(bbox, color=None, fill=WHITE, oc=ocg_xref)
                    try:
                        page.insert_htmlbox(bbox, dest_text, oc=ocg_xref)
                    except ValueError:
                        print(f"Skipping invalid text block: {src_text}")

        doc.save(output_path)

        return None