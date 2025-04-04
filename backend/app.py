from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .controllers.translation_text_controller import router as translation_router
from .controllers.save_text_to_docs_controller import router as document_router
from .controllers.translation_video_controller import router as video_translator_router
from .controllers.translation_pdf_to_doc_controller import router as pdf_to_doc_router
from .controllers.detect_language_controller import router as language_detection_router
from .controllers.translation_evaluation_controller import (
    router as translation_evaluation_router,
)
from .controllers.chat_bot_controller import router as chat_bot_router
from .controllers.search_controller import search_router
from .controllers.auth_controller import auth_controller
from .controllers.database import Base, engine

Base.metadata.create_all(bind=engine)

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include the routers
app.include_router(translation_router)
app.include_router(document_router)
app.include_router(video_translator_router)
app.include_router(pdf_to_doc_router)
app.include_router(language_detection_router)
app.include_router(translation_evaluation_router)
app.include_router(search_router)
app.include_router(chat_bot_router)
app.include_router(auth_controller)

# If you want to run the app with `uvicorn` or similar tools, use:
# uvicorn app:app --reload
@app.get("/")
def read_root():
    return {"message": "Welcome to WorkOrbit!"} 