import moviepy as mp
import speech_recognition as sr
from googletrans import Translator
from docx import Document

class VideoTranslatorService:
    def __init__(self):
        self.translator = Translator()
        self.recognizer = sr.Recognizer()

    async def translate_to_vietnamese(self, text: str) -> str:
        """Translate the given text to Vietnamese."""
        translation = await self.translator.translate(text, src='en', dest='vi')
        return translation.text

    def extract_audio_from_video(self, video_path: str, audio_path: str):
        """Extract audio from the video file."""
        video = mp.VideoFileClip(video_path)
        audio = video.audio
        audio.write_audiofile(audio_path)

    def transcribe_audio_to_text(self, audio_path: str):
        """Transcribe audio to text."""
        with sr.AudioFile(audio_path) as source:
            print("Listening for speech...")
            audio = self.recognizer.record(source)
            try:
                print("Recognizing speech...")
                text = self.recognizer.recognize_google(audio)
                return text
            except sr.UnknownValueError:
                return "Could not understand the audio."
            except sr.RequestError:
                return "Error with the speech recognition service."

    def write_translation_to_doc(self, original_text: str, translated_text: str, doc_path: str):
        """Write the original and translated text into a Word document."""
        doc = Document()
        
        doc.add_heading("Original Text (English)", level=1)
        doc.add_paragraph(original_text)
        
        doc.add_paragraph("\n" + "-" * 50 + "\n")
        
        doc.add_heading("Translated Text (Vietnamese)", level=1)
        doc.add_paragraph(translated_text)
        
        doc.save(doc_path)
