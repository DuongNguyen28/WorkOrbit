from google.cloud import storage
import os
from datetime import timedelta
from dotenv import load_dotenv
from urllib.parse import urlparse, unquote

class GCSFileUploadService:
    def __init__(self):
        load_dotenv()
        self.bucket_name = os.getenv("GCS_BUCKET_NAME")
        service_account_key_path = os.getenv("SERVICE_ACCOUNT_KEY_PATH")
        if not service_account_key_path:
            raise ValueError("SERVICE_ACCOUNT_KEY_PATH is not set in .env file")
        self.storage_client = storage.Client.from_service_account_json(service_account_key_path)

    def upload_file(self, local_file_path: str, destination_blob_name: str) -> str:
        bucket = self.storage_client.bucket(self.bucket_name)
        blob = bucket.blob(destination_blob_name)

        blob.upload_from_filename(local_file_path)

        url = blob.generate_signed_url(expiration=timedelta(hours=720))

        return url
    
    def upload_bytes(self, file_bytes, destination_blob_name):
        bucket = self.storage_client.bucket(self.bucket_name)
        blob = bucket.blob(destination_blob_name)
        blob.upload_from_file(file_bytes, rewind=True)
        url = blob.generate_signed_url(expiration=timedelta(hours=720))
        return url
    
    def delete_gcs_file(self, file_url: str):
        parsed = urlparse(file_url)

        parts = parsed.path.lstrip('/').split('/', 1)
        if len(parts) != 2:
            print(f"Invalid GCS URL format: {file_url}")
            return False

        bucket_name = parts[0]
        blob_name = unquote(parts[1])

        bucket = self.storage_client.bucket(bucket_name)
        blob = bucket.blob(blob_name)

        if not blob.exists():
            print(f"File not found: {blob_name}")
            return False

        blob.delete()
        print(f"Deleted file: {blob_name}")
        return True

