# from google.cloud import storage
# import os

# class GCSFileUploadService:
#     def __init__(self, bucket_name: str):
#         self.bucket_name = "workorbit"
#         self.storage_client = storage.Client()

#     def upload_file(self, local_file_path: str, destination_blob_name: str) -> str:

#         bucket = self.storage_client.bucket(self.bucket_name)
#         blob = bucket.blob(destination_blob_name)

#         blob.upload_from_filename(local_file_path)
        
#         return blob.public_url

from google.cloud import storage
import os
from datetime import timedelta
from dotenv import load_dotenv

class GCSFileUploadService:
    def __init__(self, bucket_name: str):
        load_dotenv()
        self.bucket_name = bucket_name
        service_account_key_path = os.getenv("SERVICE_ACCOUNT_KEY_PATH")
        if not service_account_key_path:
            raise ValueError("SERVICE_ACCOUNT_KEY_PATH is not set in .env file")
        self.storage_client = storage.Client.from_service_account_json(service_account_key_path)

    def upload_file(self, local_file_path: str, destination_blob_name: str) -> str:
        bucket = self.storage_client.bucket(self.bucket_name)
        blob = bucket.blob(destination_blob_name)

        blob.upload_from_filename(local_file_path)

        url = blob.generate_signed_url(expiration=timedelta(hours=1))

        return url
