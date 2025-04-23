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

def get_summary(db: Session):
    summary = {
        "pdf": db.query(File).filter(File.file_type == "pdf").count(),
        "docx": db.query(File).filter(File.file_type == "docx").count(),
        "xlsx": db.query(File).filter(File.file_type == "xlsx").count(),
        "image": db.query(File).filter(File.file_type.in_(["jpg", "jpeg", "png"])).count()
    }
    return summary