from googletrans import Translator

class LanguageDetectionService:
    def __init__(self):
        self.translator = Translator()

    async def detect_language(self, text: str) -> str:
        """Detect the language of the provided text."""
        detection = await self.translator.detect(text)
        return detection.lang
