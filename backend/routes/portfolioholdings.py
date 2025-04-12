from fastapi import APIRouter, Depends, HTTPException
from dependencies import get_db
from pydantic import BaseModel

router = APIRouter()

class StockTransactionRequest(BaseModel):
    portfolio_id: int
    stock_symbol: str
    shares: int  # positive = buy, negative = sell
    price_per_share: float

@router.post("/portfolio/transaction")
async def handle_stock_transaction(req: StockTransactionRequest, db=Depends(get_db)):
    if req.shares == 0:
        raise HTTPException(status_code=400, detail="Transaction must involve at least 1 share")

    # Fetch latest price (used to calculate total transaction value)
    price_row = await db.fetchrow("""
        SELECT close FROM stockpricehistory
        WHERE symbol = $1
        ORDER BY timestamp DESC
        LIMIT 1
    """, req.stock_symbol)
    if not price_row:
        raise HTTPException(status_code=404, detail="Stock price not found")

    price_per_share = price_row["close"]
    total_price = abs(req.shares) * price_per_share  # always positive

    # Check if portfolio exists
    portfolio = await db.fetchrow(
        "SELECT cash_balance FROM portfolios WHERE portfolio_id = $1",
        req.portfolio_id
    )
    if not portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found")

    current_cash = portfolio["cash_balance"]
    is_buy = req.shares > 0
    trans_type = "buy" if is_buy else "sell"

    # Sell: check if user owns enough shares
    if not is_buy:
        holding = await db.fetchrow(
            "SELECT shares FROM portfolioholdings WHERE portfolio_id = $1 AND stock_symbol = $2",
            req.portfolio_id, req.stock_symbol
        )
        if not holding or holding["shares"] < abs(req.shares):
            raise HTTPException(status_code=400, detail="Insufficient shares to sell")

    # Buy: check if user has enough cash
    if is_buy and current_cash < total_price:
        raise HTTPException(status_code=400, detail="Insufficient cash")

    async with db.transaction():
        # Update portfolio cash
        new_cash = current_cash - total_price if is_buy else current_cash + total_price
        await db.execute(
            "UPDATE portfolios SET cash_balance = $1 WHERE portfolio_id = $2",
            new_cash, req.portfolio_id
        )

        # Update holdings
        holding = await db.fetchrow(
            "SELECT shares FROM portfolioholdings WHERE portfolio_id = $1 AND stock_symbol = $2",
            req.portfolio_id, req.stock_symbol
        )
        if holding:
            new_shares = holding["shares"] + req.shares  # handles both buy and sell
            if new_shares < 0:
                raise HTTPException(status_code=400, detail="Negative share count not allowed")
            elif new_shares == 0:
                await db.execute(
                    "DELETE FROM portfolioholdings WHERE portfolio_id = $1 AND stock_symbol = $2",
                    req.portfolio_id, req.stock_symbol
                )
            else:
                await db.execute(
                    "UPDATE portfolioholdings SET shares = $1 WHERE portfolio_id = $2 AND stock_symbol = $3",
                    new_shares, req.portfolio_id, req.stock_symbol
                )
        else:
            await db.execute(
                "INSERT INTO portfolioholdings (portfolio_id, stock_symbol, shares) VALUES ($1, $2, $3)",
                req.portfolio_id, req.stock_symbol, req.shares
            )

        # Insert into transactions table
        await db.execute(
            """
            INSERT INTO transactions (portfolio_id, stock_symbol, shares, total_price, the_timestamp, trans_type)
            VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, $5)
            """,
            req.portfolio_id,
            req.stock_symbol,
            abs(req.shares),  # store shares as positive
            total_price,
            trans_type
        )

    return {"status": "success", "new_cash_balance": new_cash}

@router.get("/portfolio/{portfolio_id}/holdings")
async def get_portfolio_holdings(portfolio_id: int, db=Depends(get_db)):
    query = """
        SELECT 
            ph.stock_symbol,
            s.company_name,
            ph.shares,
            sph.close AS latest_price,
            (ph.shares * sph.close) AS market_value,
            p.name AS portfolio_name
        FROM portfolioholdings ph
        JOIN portfolios p ON p.portfolio_id = ph.portfolio_id
        JOIN stocks s ON s.stock_symbol = ph.stock_symbol
        JOIN LATERAL (
            SELECT close
            FROM stockpricehistory
            WHERE symbol = ph.stock_symbol
            ORDER BY timestamp DESC
            LIMIT 1
        ) sph ON TRUE
        WHERE ph.portfolio_id = $1
    """
    rows = await db.fetch(query, portfolio_id)
    return [dict(row) for row in rows]
