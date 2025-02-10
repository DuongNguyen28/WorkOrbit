from googletrans import Translator
import pymupdf
from ..services.language_detection_service import LanguageDetectionService

class PdfToPdfTranslationService:
    def __init__(self):
        self.translator = Translator()
        self.language_service = LanguageDetectionService()
        self.languages = {
            "af": "Afrikaans",
            "sq": "Albanian",
            "am": "Amharic",
            "ar": "Arabic",
            "hy": "Armenian",
            "az": "Azerbaijani",
            "eu": "Basque",
            "be": "Belarusian",
            "bn": "Bengali",
            "bs": "Bosnian",
            "bg": "Bulgarian",
            "ca": "Catalan",
            "ceb": "Cebuano",
            "zh-cn": "Chinese (Simplified)",
            "zh-tw": "Chinese (Traditional)",
            "co": "Corsican",
            "hr": "Croatian",
            "cs": "Czech",
            "da": "Danish",
            "nl": "Dutch",
            "en": "English",
            "eo": "Esperanto",
            "et": "Estonian",
            "fi": "Finnish",
            "fr": "French",
            "fy": "Frisian",
            "gl": "Galician",
            "ka": "Georgian",
            "de": "German",
            "el": "Greek",
            "gu": "Gujarati",
            "ht": "Haitian Creole",
            "ha": "Hausa",
            "haw": "Hawaiian",
            "iw": "Hebrew",
            "hi": "Hindi",
            "hmn": "Hmong",
            "hu": "Hungarian",
            "is": "Icelandic",
            "ig": "Igbo",
            "id": "Indonesian",
            "ga": "Irish",
            "it": "Italian",
            "ja": "Japanese",
            "jv": "Javanese",
            "kn": "Kannada",
            "kk": "Kazakh",
            "km": "Khmer",
            "ko": "Korean",
            "ku": "Kurdish",
            "ky": "Kyrgyz",
            "lo": "Lao",
            "la": "Latin",
            "lv": "Latvian",
            "lt": "Lithuanian",
            "lb": "Luxembourgish",
            "mk": "Macedonian",
            "mg": "Malagasy",
            "ms": "Malay",
            "ml": "Malayalam",
            "mt": "Maltese",
            "mi": "Maori",
            "mr": "Marathi",
            "mn": "Mongolian",
            "my": "Myanmar (Burmese)",
            "ne": "Nepali",
            "no": "Norwegian",
            "ny": "Nyanja (Chichewa)",
            "or": "Odia (Oriya)",
            "ps": "Pashto",
            "fa": "Persian",
            "pl": "Polish",
            "pt": "Portuguese",
            "pa": "Punjabi",
            "ro": "Romanian",
            "ru": "Russian",
            "sm": "Samoan",
            "gd": "Scots Gaelic",
            "sr": "Serbian",
            "st": "Sesotho",
            "sn": "Shona",
            "sd": "Sindhi",
            "si": "Sinhala",
            "sk": "Slovak",
            "sl": "Slovenian",
            "so": "Somali",
            "es": "Spanish",
            "su": "Sundanese",
            "sw": "Swahili",
            "sv": "Swedish",
            "tl": "Tagalog (Filipino)",
            "tg": "Tajik",
            "ta": "Tamil",
            "tt": "Tatar",
            "te": "Telugu",
            "th": "Thai",
            "tr": "Turkish",
            "tk": "Turkmen",
            "uk": "Ukrainian",
            "ur": "Urdu",
            "ug": "Uyghur",
            "uz": "Uzbek",
            "vi": "Vietnamese",
            "cy": "Welsh",
            "xh": "Xhosa",
            "yi": "Yiddish",
            "yo": "Yoruba",
            "zu": "Zulu"
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
        warnings = []

        for page in doc:
            blocks = page.get_text("blocks", flags=textflags)

            for block in blocks:
                bbox = block[:4]  # area containing the text
                src_text = block[4]  # the text of this block

                # Detect the language of the extracted text
                detected_language = await self.language_service.detect_language(src_text)

                # Compare detected language with the user's selected source language
                if detected_language != src_language:
                    warnings.append(f"Warning: Detected language is {detected_language}, but the selected language is {src_language}.")
                    return warnings  # Return the warning and stop further processing
                
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
        return warnings