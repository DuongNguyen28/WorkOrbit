from pydantic import BaseModel, Field
from datetime import datetime

class FileBase(BaseModel):
    filename: str
    file_type: str
    file_path: str
    source: str = Field(..., pattern="^(upload|generated|translated)$")

class FileCreate(FileBase):
    user_id: int

class FileOut(FileBase):
    id: int
    user_id: int
    uploaded_at: datetime

    class Config:
        orm_mode = True
