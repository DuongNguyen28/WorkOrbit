from google.cloud import translate_v2 as translate
import html

class TranslateClient:
    def __init__(self):
        # self.translator = Translator()
        self.translate_client = translate.Client()

    async def translate_text(self, text: str, target: str):
        if isinstance(text, bytes):
            text = text.decode("utf-8")

        result = self.translate_client.translate(text, target_language=target)

        return html.unescape(result["translatedText"])