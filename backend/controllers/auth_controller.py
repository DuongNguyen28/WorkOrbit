from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from .database import SessionLocal
from ..schemas.user import UserCreate, UserOut
from ..services.user_service import create_user, authenticate_user, create_access_token
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel

class LoginRequest(BaseModel):
    username: str
    password: str

auth_controller = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@auth_controller.post("/register", response_model=UserOut)
def register(user: UserCreate, db: Session = Depends(get_db)):
    return create_user(db, user)

@auth_controller.post("/login")
def login_json(data: LoginRequest, db: Session = Depends(get_db)):
    user = authenticate_user(db, data.username, data.password)
    if not user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid credentials")
    token = create_access_token({"sub": user.email})
    return {"access_token": token, "token_type": "bearer"}
