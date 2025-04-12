from fastapi import APIRouter, HTTPException, Depends
from dependencies import get_db

router = APIRouter()

@router.get("/stock/{symbol}/latest-price")
async def get_latest_price(symbol: str, db=Depends(get_db)):
    row = await db.fetchrow(
        "SELECT close FROM stockpricehistory WHERE symbol = $1 ORDER BY timestamp DESC LIMIT 1",
        symbol.upper()
    )
    if not row:
        raise HTTPException(status_code=404, detail="Stock not found or invalid")
    return {"symbol": symbol.upper(), "latest_price": row["close"]}
