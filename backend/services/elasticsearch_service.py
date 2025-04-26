import json
from pprint import pprint
import os
import time
import base64
from io import BytesIO
from dotenv import load_dotenv
from elasticsearch import Elasticsearch
from sentence_transformers import SentenceTransformer
from ..services.gcs_upload_service import GCSFileUploadService

load_dotenv()

class ElasticSearchService:
    def __init__(self):
        self.model = SentenceTransformer(
            "all-MiniLM-L6-v2"
        )  # light-weight embedded model, k can gpu
        es_url = os.getenv("ES_URL")
        self.es = Elasticsearch(es_url)  # thay vao env
        print("Connected to Elastic search")

    def create_index(self):
        self.es.indices.delete(index="idx", ignore_unavailable=True)
        self.es.indices.create(
            index="idx",
            mappings={"properties": {"embedding": {"type": "dense_vector"}}},
        )

    def get_embedding(self, text):
        return self.model.encode(text)

    def insert_document(self, document):
        return self.es.index(
            index="idx",
            document={**document, "embedding": self.get_embedding(document["summary"])},
        )

    def insert_documents(self, documents):
        operations = []
        for document in documents:
            operations.append({"index": {"_index": "idx"}})
            operations.append(
                {
                    **document, 
                    "embedding": self.get_embedding(document["content"]),
                    "sql_id": document["id"]
                }
            )
        return self.es.bulk(operations=operations)

    def reindex(self):
        self.create_index()
        with open(os.getcwd() + "/backend/misc/testdata.json", "rt") as f:
            documents = json.loads(f.read())
        return self.insert_documents(documents=documents)

    def search(self, **query_args):
        return self.es.search(index="idx", **query_args)

    def retrieve_document(self, id):
        return self.es.get(index="idx", id=id)

    def ingest_document(self, filename, file_type=None, sql_id=None):
        if file_type is None:
            _, ext = os.path.splitext(filename)
            ext = ext.lstrip('.').lower()

            if ext == "pdf":
                file_type = "pdf"
            elif ext == "docx":
                file_type = "docx"
            elif ext == "xlsx":
                file_type = "xlsx"
            elif ext in {"jpg", "jpeg", "png"}:
                file_type = "image"
            else:
                file_type = "uncategorized"
        else:
            file_type = file_type.lower()
            if file_type in {"jpg", "jpeg", "png"}:
                file_type = "image"

        if filename[0] != "/":
            file_path = os.path.join(os.getcwd(), "backend/misc", filename)
        else:
            file_path = filename

        with open(file_path, "rb") as pdf_file:
            enc_file = base64.b64encode(pdf_file.read()).decode("utf-8")
        
        url = self.upload_file(file_path, file_type)
        
        os.remove(file_path)

        resp = self.es.ingest.put_pipeline(
            id="attachment",
            description="Extract attachment information",
            processors=[{"attachment": {
                "field": "data", 
                "properties": ["content", "date", "title", "content_length"],
                "remove_binary": True
                }}],
        )
        print(resp)

        document = {
            "data": enc_file,
            "file_type": file_type,
            "file_name": os.path.basename(file_path),
            "file_path": url,
            "sql_id": sql_id,
        }

        resp1 = self.es.index(
            index="idx",
            pipeline="attachment",
            document=document,
        )
        print(resp1)

        return url
    
    def upload_file(self, file_path, file_type):
        gcs_path = f"{file_type}/{os.path.basename(file_path)}"
        uploader = GCSFileUploadService()
        gcs_url = uploader.upload_file(file_path, gcs_path)

        return gcs_url