from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from backend.services.rag_information_service import RAGInformationService

# Initialize router
router = APIRouter()

# Initialize RAG service
rag_service = RAGInformationService()

# Request model for user queries
class QueryRequest(BaseModel):
    query: str

@router.post("/api/chat")
def chat(request: QueryRequest):
    try:
        context = rag_service.retrieve_context(request.query)
        return {"response": context}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
