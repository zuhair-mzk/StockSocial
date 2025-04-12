from pydantic import BaseModel

class LoginRequest(BaseModel):
    username: str
    password: str

class RegisterRequest(BaseModel):
    username: str
    password: str

class FriendRequest(BaseModel):
    sender_id: int
    receiver_id: int

class DeleteRequest(BaseModel):
    user_id: int
    friend_id: int