from fastapi import FastAPI, UploadFile, File
from fastapi.responses import FileResponse, Response
from fastapi.middleware.cors import CORSMiddleware
import whisper
import tempfile
import os
from moviepy.editor import AudioFileClip
from googletrans import Translator

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load models
model = whisper.load_model("base")  
translator = Translator()

async def extract_audio_from_bytes(temp_mp4_path: str) -> str:
    with tempfile.NamedTemporaryFile(suffix='.wav', delete=False) as temp_wav:
        try:
            clip = AudioFileClip(temp_mp4_path)
            clip.write_audiofile(temp_wav.name, codec='pcm_s16le', verbose=False, logger=None)
            clip.close()
            return temp_wav.name
        except Exception as e:
            os.unlink(temp_mp4_path)
            os.unlink(temp_wav.name)
            raise RuntimeError(f"Audio extraction failed: {e}")

app.post("/translate-audio")
async def translate_audio(file: UploadFile = File(...)):
    # Read file bytes
    file_bytes = await file.read()
    
    # Extract audio as numpy array and get temp wav path
    audio, temp_wav_path = extract_audio_from_bytes(file_bytes)
    
    # Transcribe audio to text
    result = model.transcribe(audio)
    english_text = result["text"]
    
    # Translate text
    translated_text = translator.translate(english_text, src='en', dest='vi').text
    
    # Create a text file with transcription and translation
    output_txt_path = temp_wav_path.replace('.wav', '.txt')
    with open(output_txt_path, 'w') as f:
        f.write(f"Original Text (English): {english_text}\n\n")
        f.write(f"Translated Text (Vietnamese): {translated_text}")
    
    # Return the text file as a downloadable response
    return FileResponse(
        path=output_txt_path, 
        media_type='text/plain', 
        filename='translation_output.txt'
    )

