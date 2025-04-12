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

class StocklistCreate(BaseModel):
    name: str
    is_public: bool
    creator_id: int

class DeleteStocklistRequest(BaseModel):
    stocklist_id: int
    user_id: int

class StocklistItem(BaseModel):
    stock_symbol: str
    shares: int

class ShareRequest(BaseModel):
    owner_id: int
    sharedto_id: int

class ReviewCreate(BaseModel):
    reviewer_id: int
    stocklist_id: int
    content: str
