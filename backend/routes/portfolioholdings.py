from fastapi import APIRouter, Depends, HTTPException
from dependencies import get_db
from pydantic import BaseModel

router = APIRouter()

class StockTransactionRequest(BaseModel):
    portfolio_id: int
    stock_symbol: str
    shares: int  # positive = buy, negative = sell
    price_per_share: float

class CashOperationRequest(BaseModel):
    amount: float

class CashTransferByNameRequest(BaseModel):
    amount: float
    target_portfolio_name: str

@router.post("/portfolio/transaction")
async def handle_stock_transaction(req: StockTransactionRequest, db=Depends(get_db)):
    if req.shares == 0:
        raise HTTPException(status_code=400, detail="Transaction must involve at least 1 share")

    price_row = await db.fetchrow("""
        SELECT close FROM stockpricehistory
        WHERE symbol = $1
        ORDER BY timestamp DESC
        LIMIT 1
    """, req.stock_symbol)
    if not price_row:
        raise HTTPException(status_code=404, detail="Stock price not found")

    price_per_share = price_row["close"]
    total_price = abs(req.shares) * price_per_share

    portfolio = await db.fetchrow(
        "SELECT cash_balance FROM portfolios WHERE portfolio_id = $1",
        req.portfolio_id
    )
    if not portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found")

    current_cash = portfolio["cash_balance"]
    is_buy = req.shares > 0
    trans_type = "buy" if is_buy else "sell"

    if not is_buy:
        holding = await db.fetchrow(
            "SELECT shares FROM portfolioholdings WHERE portfolio_id = $1 AND stock_symbol = $2",
            req.portfolio_id, req.stock_symbol
        )
        if not holding or holding["shares"] < abs(req.shares):
            raise HTTPException(status_code=400, detail="Insufficient shares to sell")

    if is_buy and current_cash < total_price:
        raise HTTPException(status_code=400, detail="Insufficient cash")

    async with db.transaction():
        new_cash = current_cash - total_price if is_buy else current_cash + total_price
        await db.execute(
            "UPDATE portfolios SET cash_balance = $1 WHERE portfolio_id = $2",
            new_cash, req.portfolio_id
        )

        holding = await db.fetchrow(
            "SELECT shares FROM portfolioholdings WHERE portfolio_id = $1 AND stock_symbol = $2",
            req.portfolio_id, req.stock_symbol
        )
        if holding:
            new_shares = holding["shares"] + req.shares
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

        await db.execute(
            """
            INSERT INTO transactions (portfolio_id, stock_symbol, shares, total_price, the_timestamp, trans_type)
            VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, $5)
            """,
            req.portfolio_id,
            req.stock_symbol,
            abs(req.shares),
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

@router.get("/portfolio/{portfolio_id}/value")
async def get_portfolio_value(portfolio_id: int, db=Depends(get_db)):
    result = await db.fetchrow("""
        SELECT 
            SUM(ph.shares * sph.close) AS total_market_value
        FROM portfolioholdings ph
        JOIN LATERAL (
            SELECT close
            FROM stockpricehistory
            WHERE symbol = ph.stock_symbol
            ORDER BY timestamp DESC
            LIMIT 1
        ) sph ON TRUE
        WHERE ph.portfolio_id = $1
    """, portfolio_id)
    return {"portfolio_id": portfolio_id, "market_value": float(result["total_market_value"] or 0.0)}

@router.post("/portfolio/{portfolio_id}/deposit")
async def deposit_cash(portfolio_id: int, req: CashOperationRequest, db=Depends(get_db)):
    if req.amount <= 0:
        raise HTTPException(status_code=400, detail="Amount must be positive")

    await db.execute(
        """
        UPDATE portfolios SET cash_balance = cash_balance + $1
        WHERE portfolio_id = $2
        """, req.amount, portfolio_id
    )

    return {"status": "success", "message": f"${req.amount} deposited"}

@router.post("/portfolio/{portfolio_id}/withdraw")
async def withdraw_cash(portfolio_id: int, req: CashOperationRequest, db=Depends(get_db)):
    if req.amount <= 0:
        raise HTTPException(status_code=400, detail="Amount must be positive")

    row = await db.fetchrow("SELECT cash_balance FROM portfolios WHERE portfolio_id = $1", portfolio_id)
    if not row:
        raise HTTPException(status_code=404, detail="Portfolio not found")

    if row["cash_balance"] < req.amount:
        raise HTTPException(status_code=400, detail="Insufficient funds")

    await db.execute(
        """
        UPDATE portfolios SET cash_balance = cash_balance - $1
        WHERE portfolio_id = $2
        """, req.amount, portfolio_id
    )

    return {"status": "success", "message": f"${req.amount} withdrawn"}

@router.post("/portfolio/{portfolio_id}/transfer")
async def transfer_cash(portfolio_id: int, req: CashTransferByNameRequest, db=Depends(get_db)):
    if req.amount <= 0:
        raise HTTPException(status_code=400, detail="Amount must be positive")

    # Find the target portfolio ID based on name
    target = await db.fetchrow(
        "SELECT portfolio_id FROM portfolios WHERE name = $1",
        req.target_portfolio_name
    )
    if not target:
        raise HTTPException(status_code=404, detail="Target portfolio not found")

    target_id = target["portfolio_id"]

    # Check source cash
    sender_cash = await db.fetchval(
        "SELECT cash_balance FROM portfolios WHERE portfolio_id = $1", portfolio_id
    )
    if sender_cash is None or sender_cash < req.amount:
        raise HTTPException(status_code=400, detail="Insufficient funds")

    async with db.transaction():
        await db.execute(
            "UPDATE portfolios SET cash_balance = cash_balance - $1 WHERE portfolio_id = $2",
            req.amount, portfolio_id
        )
        await db.execute(
            "UPDATE portfolios SET cash_balance = cash_balance + $1 WHERE portfolio_id = $2",
            req.amount, target_id
        )

    return {"status": "success", "message": f"Transferred ${req.amount} to {req.target_portfolio_name}"}

@router.get("/portfolio/{portfolio_id}/cash")
async def get_cash_balance(portfolio_id: int, db=Depends(get_db)):
    result = await db.fetchrow("SELECT cash_balance FROM portfolios WHERE portfolio_id = $1", portfolio_id)
    if not result:
        raise HTTPException(status_code=404, detail="Portfolio not found")
    return {"cash_balance": float(result["cash_balance"])}

@router.get("/portfolio/id-by-name")
async def get_portfolio_id_by_name(name: str, user_id: int, db=Depends(get_db)):
    result = await db.fetchrow(
        "SELECT portfolio_id FROM portfolios WHERE name = $1 AND user_id = $2",
        name, user_id
    )
    if not result:
        raise HTTPException(status_code=404, detail="Portfolio not found")
    return {"portfolio_id": result["portfolio_id"]}

@router.get("/portfolio/user-transactions")
async def get_user_transactions(user_id: int, db=Depends(get_db)):
    query = """
        SELECT 
            t.transaction_id,
            t.portfolio_id,
            p.name AS portfolio_name,
            t.stock_symbol,
            t.shares,
            t.total_price,
            t.the_timestamp,
            t.trans_type
        FROM transactions t
        JOIN portfolios p ON p.portfolio_id = t.portfolio_id
        WHERE p.user_id = $1
        ORDER BY t.the_timestamp DESC
    """
    rows = await db.fetch(query, user_id)
    return [dict(row) for row in rows]