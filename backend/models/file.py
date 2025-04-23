from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime, timezone, timedelta
from ..controllers.database import Base

EST = timezone(timedelta(hours=-5), name="EST")

class File(Base):
    __tablename__ = "files"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    filename = Column(String, nullable=False)
    file_type = Column(String, nullable=False)
    file_path = Column(String, nullable=False)
    source = Column(String, nullable=False)  # 'upload', 'generated', or 'translated'
    uploaded_at = Column(DateTime, default=lambda: datetime.now(EST))

    user = relationship("User", back_populates="files")
