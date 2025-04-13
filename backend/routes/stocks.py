from fastapi import APIRouter, HTTPException, Depends
from dependencies import get_db
from models import FullStockPriceInput
from fastapi import APIRouter, HTTPException, Depends
from dependencies import get_db
import pandas as pd
from statsmodels.tsa.holtwinters import ExponentialSmoothing
from datetime import datetime

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

@router.post("/stock/add-price")
async def add_full_stock_price(data: FullStockPriceInput, db=Depends(get_db)):
    query = """
        INSERT INTO stockpricehistory (symbol, open, high, low, close, volume)
        VALUES ($1, $2, $3, $4, $5, $6)
    """
    await db.execute(query,
        data.stock_symbol.upper(),
        data.open,
        data.high,
        data.low,
        data.close,
        data.volume
    )
    return {"message": "Full stock price data added successfully"}

@router.get("/stock/{symbol}/history")
async def get_monthly_history(symbol: str, db=Depends(get_db)):
    import pandas as pd

    query = """
        SELECT timestamp, close
        FROM stockpricehistory
        WHERE symbol = $1
        ORDER BY timestamp ASC
    """
    rows = await db.fetch(query, symbol.upper())
    
    if not rows:
        raise HTTPException(status_code=404, detail="No historical data found")

    df = pd.DataFrame(rows, columns=["timestamp", "close"])
    df["timestamp"] = pd.to_datetime(df["timestamp"])
    df.set_index("timestamp", inplace=True)

    monthly = df["close"].resample("M").mean().dropna()

    return [
        {"month": date.strftime("%b %Y"), "avg_close": round(close, 2)}
        for date, close in monthly.items()
    ]

@router.get("/stock/{symbol}/predict")
async def predict_stock(symbol: str, db=Depends(get_db)):
    query = """
        SELECT timestamptimestamp, close
        FROM stockpricehistory
        WHERE symbol = $1
        ORDER BY timestamptimestamp ASC
    """
    rows = await db.fetch(query, symbol.upper())

    if not rows or len(rows) < 12:
        raise HTTPException(status_code=400, detail="Not enough data to make predictions")

    df = pd.DataFrame(rows, columns=["timestamptimestamp", "close"])
    df["timestamptimestamp"] = pd.to_datetime(df["timestamptimestamp"])
    df.set_index("timestamptimestamp", inplace=True)

    monthly = df["close"].resample("M").mean().dropna().astype(float)

    model = ExponentialSmoothing(monthly, trend="add")
    fit = model.fit()

    forecast = fit.forecast(12)
    future_months = pd.date_range(start=monthly.index[-1] + pd.offsets.MonthEnd(1), periods=12, freq='M')

    return [
        {"month": date.strftime("%b %Y"), "predicted_close": round(pred, 2)}
        for date, pred in zip(future_months, forecast)
    ]
