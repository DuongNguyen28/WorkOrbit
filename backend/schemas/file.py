from pydantic import BaseModel, Field
from datetime import datetime

class FileBase(BaseModel):
    filename: str
    file_type: str
    file_path: str
    source: str = Field(..., pattern="^(upload|generated|translated)$")

class FileCreate(FileBase):
    user_id: int
    filename: str
    file_type: str
    source: str
    uploaded_at: datetime
    file_path: str

class FileOut(FileBase):
    id: int
    file_type: str
    source: str
    uploaded_at: datetime
    user_id: int
    filename: str
    file_path: str

    model_config = {
        "from_attributes": True
    }
