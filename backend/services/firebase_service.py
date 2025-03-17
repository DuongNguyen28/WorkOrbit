import os
import firebase_admin
from firebase_admin import credentials, firestore


service_account_path = os.path.join(os.path.dirname(__file__), "serviceAccountKey.json")

cred = credentials.Certificate(service_account_path)

firebase_admin.initialize_app(cred)

db = firestore.client()

def get_db():
    return db