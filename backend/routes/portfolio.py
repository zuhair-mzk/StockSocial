from fastapi import APIRouter, HTTPException, Depends
from dependencies import get_db
from models import CreatePortfolioRequest

router = APIRouter()

@router.post("/create-portfolio")
async def create_portfolio(request: CreatePortfolioRequest, db=Depends(get_db)):
    query = """
        INSERT INTO portfolios (name, user_id, cash_balance)
        VALUES ($1, $2, $3)
        RETURNING portfolio_id, name, cash_balance
    """
    result = await db.fetchrow(query, request.name, request.user_id, request.cash_balance)
    return dict(result)

@router.get("/portfolios")
async def get_user_portfolios(user_id: int, db=Depends(get_db)):
    query = "SELECT portfolio_id, name, cash_balance FROM portfolios WHERE user_id = $1"
    rows = await db.fetch(query, user_id)
    return [dict(row) for row in rows]
