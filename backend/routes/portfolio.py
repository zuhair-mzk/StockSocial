from fastapi import APIRouter, HTTPException, Depends
from dependencies import get_db
from models import CreatePortfolioRequest
import pandas as pd

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


@router.get("/portfolio/{portfolio_id}/stats")
async def get_portfolio_stats(portfolio_id: int, db=Depends(get_db)):
    # Step 1: Fetch all historical price data for each stock in the portfolio
    query = """
        SELECT ph.stock_symbol, sph.timestamp, sph.close
        FROM portfolioholdings ph
        JOIN stockpricehistory sph ON sph.symbol = ph.stock_symbol
        WHERE ph.portfolio_id = $1
        ORDER BY sph.timestamp
    """
    rows = await db.fetch(query, portfolio_id)

    if not rows:
        raise HTTPException(status_code=404, detail="No data found for this portfolio")

    # Step 2: Convert to DataFrame
    df = pd.DataFrame(rows, columns=["stock_symbol", "timestamp", "close"])
    df["timestamp"] = pd.to_datetime(df["timestamp"])

    # Step 3: Pivot to time series matrix
    pivoted = df.pivot(index="timestamp", columns="stock_symbol", values="close")
    pivoted.dropna(inplace=True)
    pivoted = pivoted.astype(float)


    # Step 4: Compute stats
    cov_matrix = pivoted.cov().round(2)
    corr_matrix = pivoted.corr().round(2)
    covs = (pivoted.std() / pivoted.mean()).round(4)  # Coefficient of variation

    return {
        "coefficient_of_variation": covs.to_dict(),
        "covariance_matrix": cov_matrix.to_dict(),
        "correlation_matrix": corr_matrix.to_dict()
    }