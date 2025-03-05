import os
import shutil
from langchain_community.document_loaders import DirectoryLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.schema import Document
from langchain_openai import OpenAIEmbeddings
from langchain_chroma import Chroma 
from langchain_openai import ChatOpenAI  
import logging
from ..config.config import OPENAI_API_KEY 


# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("RAGInformationService")

CHROMA_PATH = "./chroma_db"
data_folder = "backend/data"

class RAGInformationService:
    def ingest_markdowns(self):
        # Clear existing ChromaDB
        if os.path.exists(CHROMA_PATH):
            shutil.rmtree(CHROMA_PATH)
        
        # Load Markdown documents
        loader = DirectoryLoader(data_folder, glob="*.md")
        documents = loader.load()
        
        # Split text into chunks
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=500,
            chunk_overlap=100,
            length_function=len,
            add_start_index=True,
        )
        chunks = text_splitter.split_documents(documents)
        
        # Create new ChromaDB and persist data
        db = Chroma.from_documents(
            chunks, OpenAIEmbeddings(), persist_directory=CHROMA_PATH
        )
        print("Markdown documents ingested successfully")

        return {"message": "Markdown documents ingested successfully"}

    def retrieve_context(self, query: str):
        try:
            db = Chroma(persist_directory=CHROMA_PATH, embedding_function=OpenAIEmbeddings())
            docs = db.similarity_search(query, k=3)
            context = "\n".join([doc.page_content for doc in docs])
            logger.info(f"Retrieved context for query '{query}': {context[:100]}...")
            return context if context else "No relevant information found."
        except Exception as e:
            logger.error(f"Failed to retrieve context for query '{query}': {str(e)}")
            return "Error retrieving context."