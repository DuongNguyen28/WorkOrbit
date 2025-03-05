from google.cloud import storage
import os

class GCSFileUploadService:
    def __init__(self, bucket_name: str):
        self.bucket_name = "workorbit"
        self.storage_client = storage.Client()

    def upload_file(self, local_file_path: str, destination_blob_name: str) -> str:

        bucket = self.storage_client.bucket(self.bucket_name)
        blob = bucket.blob(destination_blob_name)

        blob.upload_from_filename(local_file_path)
        
        return blob.public_url
