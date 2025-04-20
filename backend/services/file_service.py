from sqlalchemy.orm import Session
from ..models.file import File
from ..schemas.file import FileCreate

def save_file_record(db: Session, file_data: FileCreate) -> File:
    """
    Persist a File row in the database.
    `file_data` is a FileCreate pydantic schema.
    Returns the saved SQLAlchemy File model.
    """
    db_file = File(**file_data.dict())
    db.add(db_file)
    db.commit()
    db.refresh(db_file)
    return db_file
