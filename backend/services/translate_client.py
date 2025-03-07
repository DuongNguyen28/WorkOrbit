# from google.cloud import translate_v2 as translate
import requests
import os
import html
from ..config.config import GCP_API_KEY

class TranslateClient:
    def __init__(self):
        self.endpoint = "https://translation.googleapis.com/language/translate/v2"
        self.api_key = GCP_API_KEY

    async def translate_text(self, text: str, target: str):
        if isinstance(text, bytes):
            text = text.decode("utf-8")

        # result = self.translate_client.translate(text, target_language=target)

        # return html.unescape(result["translatedText"])

        headers = {
            "Content-Type": "application/json"
        }
        
        data = {
            "q": text,
            "target": target,
            "format": "text",
        }
        
        response = requests.post(f"{self.endpoint}?key={self.api_key}", json=data, headers=headers)
        response_data = response.json()
        
        if response.status_code == 200 and "data" in response_data and "translations" in response_data["data"]:
            return html.unescape(response_data["data"]["translations"][0]["translatedText"])
        else:
            raise Exception(f"Translation API error: {response_data}")