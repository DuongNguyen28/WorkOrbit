import json
from pprint import pprint
import os
import time

from dotenv import load_dotenv
from elasticsearch import Elasticsearch
from sentence_transformers import SentenceTransformer

load_dotenv()

class ElasticSearchService:
    def __init__(self):
        self.model = SentenceTransformer('all-MiniLM-L6-v2') #light-weight embedded model, k can gpu
        self.es = Elasticsearch('http://localhost:9200') # thay vao env
        client_info = self.es.info()
        print("Connected to Elastic search")
        pprint(client_info.body)

    def create_index(self):
        self.es.indices.delete(index="idx", ignore_unavailable=True)
        self.es.indices.create(index="idx", mappings={
            'properties': {
                'embedding': {
                    'type': 'dense_vector'
                }
            }
        })
    
    def get_embedding(self,text):
        return self.model.encode(text)

    def insert_document(self, document):
        return self.es.index(index='idx', document={
            **document,
            'embedding': self.get_embedding(document['summary'])
        })
    
    def insert_documents(self, documents):
        operations = []
        for document in documents:
            operations.append({'index': {'_index': 'idx'}})
            operations.append({
                **document,
                'embedding': self.get_embedding(document['summary'])
            })
        return self.es.bulk(operations=operations)

    def reindex(self):
        self.create_index()
        with open('../misc/testdata.json', 'rt') as f:
            documents = json.loads(f.read())
        return self.insert_documents(documents=documents)
    
    def search(self, **query_args):
        return self.es.search(index='idx', **query_args)

    def retrieve_document(self,id):
        return self.es.get(index='idx', id=id)