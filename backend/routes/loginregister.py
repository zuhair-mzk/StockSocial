from fastapi import APIRouter, HTTPException, Depends
from models import LoginRequest, RegisterRequest
from dependencies import get_db

router = APIRouter()

@router.post("/login")
async def login(request_data: LoginRequest, db = Depends(get_db)):
    query = """
        SELECT user_id, username FROM users
        WHERE username = $1 AND password = $2
    """
    result = await db.fetchrow(query, request_data.username, request_data.password)

    if not result:
        raise HTTPException(status_code=401, detail="Invalid username or password")

    return {"user_id": result["user_id"], "username": result["username"]}

@router.post("/register")
async def register(request_data: RegisterRequest, db = Depends(get_db)):
    query_check = "SELECT user_id FROM users WHERE username = $1"
    existing_user = await db.fetchrow(query_check, request_data.username)

    if existing_user:
        raise HTTPException(status_code=400, detail="Username already exists")

    query_insert = """
        INSERT INTO users (username, password)
        VALUES ($1, $2)
        RETURNING user_id, username
    """
    result = await db.fetchrow(query_insert, request_data.username, request_data.password)

<<<<<<< HEAD
    return {"user_id": result["user_id"], "username": result["username"]}
=======
    return {"user_id": result["user_id"], "username": result["username"]}
>>>>>>> origin/main
