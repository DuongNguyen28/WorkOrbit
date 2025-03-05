from google.cloud import storage
import os

class GCSFileUploadService:
    """
    A service class dedicated to uploading files to Google Cloud Storage.
    """
    def __init__(self, bucket_name: str):
        self.bucket_name = "workorbit"
        self.storage_client = storage.Client()

    def upload_file(self, local_file_path: str, destination_blob_name: str) -> str:
        """
        Upload a local file to the specified GCS bucket and make it public.
        
        :param local_file_path: Path to the file on the local filesystem.
        :param destination_blob_name: Desired path/name in the GCS bucket.
        :return: A publicly accessible URL to the uploaded file.
        """
        bucket = self.storage_client.bucket(self.bucket_name)
        blob = bucket.blob(destination_blob_name)

        blob.upload_from_filename(local_file_path)
        
        return blob.public_url
