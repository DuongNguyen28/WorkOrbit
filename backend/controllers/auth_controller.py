from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from services.firebase_service import get_db
import bcrypt
import uuid

auth_router = APIRouter()

class UserRegister(BaseModel):
    email: str
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

@auth_router.post("/register", response_model=UserRegister)
async def register(user: UserRegister):
    """
    Create a new user in Firebase with a hashed password
    """
    db = get_db()
    users_ref = db.collection("users")

    # Check if the user already exists
    existing = users_ref.where("email", "=", user.email).limit(1).get()
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="User already exists.")
    
    # Hash the password
    hashed_pw = bcrypt.hashpw(user.password.encode("utf-8"), bcrypt.gensalt())
    hashed_str = hashed_pw.decode("utf-8")

    # Create a new user document with generated ID
    user_id = str(uuid.uuid4())
    user_doc = {"id": user_id, "email": user.email, "password": hashed_str}
    users_ref.document(user_id).set(user_doc)

    return {"message": "User registered successfully"}

@auth_router.post("/login", response_model=UserLogin)
async def login(user: UserLogin):
    """
    Validate user credential. Return a placeholder success message if valid.
    In production, you might generate a JWT here.
    """
    db = get_db()
    users_ref = db.collection("users")
    query = users_ref.where("email", "=", user.email).limit(1).get()

    if not query:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    
    user_doc = query[0]
    user_data = user_doc.to_dict()

    # Verify password
    stored_hash = user_data["password"].encode("utf-8")
    if not bcrypt.checkpw(user.password.encode("utf-8"), stored_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    
    # If valid, return token or session info
    return {"message": "Logged in successfully", "user_id": user_doc.id}