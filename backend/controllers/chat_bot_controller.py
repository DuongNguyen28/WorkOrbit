from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from backend.services.rag_information_service import RAGInformationService
from langchain_openai import ChatOpenAI  
from ..config.config import OPENAI_API_KEY


# Initialize router
router = APIRouter()

# Initialize RAG service
rag_service = RAGInformationService()
rag_service.ingest_markdowns()

# Request model for user queries
class QueryRequest(BaseModel):
    query: str

@router.post("/api/chat")
def chat(request: QueryRequest):
    try:
        
        chat_model = ChatOpenAI(model_name="gpt-4o-2024-08-06", openai_api_key = OPENAI_API_KEY)
        context = rag_service.retrieve_context(request.query)
        context = request.query if context == "No relevant information found." else f"Based on the following context, answer the query: {request.query}\n\nContext:\n{context}"
        
        response = chat_model.invoke(context)  # Using invoke instead of predict
        
        return {"response": response.content}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))