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

class CreatePortfolioRequest(BaseModel):
    name: str
    user_id: int
    cash_balance: float

class StockTransactionRequest(BaseModel):
    portfolio_id: int
    stock_symbol: str
    shares: int
    price_per_share: float   # <-- this is required
