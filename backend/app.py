from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .controllers.translation_text_controller import router as translation_router
from .controllers.translation_text_to_docs_controller import router as document_router
from .controllers.translation_video_controller import router as video_translator_router


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


# If you want to run the app with `uvicorn` or similar tools, use:
# uvicorn app:app --reload
