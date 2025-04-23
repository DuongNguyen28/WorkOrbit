from sqlalchemy import Column, Integer, String, DateTime
from datetime import datetime, timezone, timedelta
from ..controllers.database import Base
from sqlalchemy.orm import relationship

EST = timezone(timedelta(hours=-5), name="EST")  # Assuming EST is UTC-5, adjust as needed

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    role = Column(String, default="user")
    created_at = Column(DateTime, default=lambda: datetime.now(EST))
    files = relationship("File", back_populates="user")
