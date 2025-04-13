from fastapi import APIRouter, HTTPException, Depends
from fastapi import Request
from dependencies import get_db
from models import StocklistCreate, StocklistItem, ShareRequest, DeleteStocklistRequest, ReviewCreate

router = APIRouter()

@router.get("/get-stocklists")
async def get_stocklists(user_id: int, db = Depends(get_db)):
    query = """
        SELECT stocklist_id, name, is_public FROM stocklists
        WHERE creator_id = $1
    """
    rows = await db.fetch(query, user_id)
    return [dict(row) for row in rows]

@router.post("/create-stocklist")
async def create_stocklist(request: StocklistCreate, db = Depends(get_db)):
    query = """
        INSERT INTO stocklists (name, is_public, creator_id)
        VALUES ($1, $2, $3)
        RETURNING stocklist_id
    """
    row = await db.fetchrow(query, request.name, request.is_public, request.creator_id)
    return {"stocklist_id": row["stocklist_id"]}

@router.delete("/delete-stocklist")
async def delete_stocklist(request: DeleteStocklistRequest, db = Depends(get_db)):
    check = await db.fetchrow("SELECT * FROM stocklists WHERE stocklist_id = $1 AND creator_id = $2", request.stocklist_id, request.user_id)
    if not check:
        raise HTTPException(status_code=403, detail="You do not own this stocklist")

    await db.execute("DELETE FROM stocklistitems WHERE stocklist_id = $1", request.stocklist_id)
    await db.execute("DELETE FROM sharedstocklists WHERE stocklist_id = $1", request.stocklist_id)
    await db.execute("DELETE FROM stocklists WHERE stocklist_id = $1", request.stocklist_id)
    return {"message": "Stocklist deleted"}

@router.post("/stocklists/{stocklist_id}/add-stock")
async def add_stocklist_item(stocklist_id: int, item: StocklistItem, db = Depends(get_db)):
    await db.execute("""
        INSERT INTO stocklistitems (stocklist_id, stock_symbol, shares)
        VALUES ($1, $2, $3)
        ON CONFLICT (stocklist_id, stock_symbol) DO UPDATE
        SET shares = stocklistitems.shares + EXCLUDED.shares
    """, stocklist_id, item.stock_symbol, item.shares)
    return {"message": "Stock added to list"}

@router.delete("/stocklists/{stocklist_id}/remove-stock/{stock_symbol}")
async def remove_stocklist_item(stocklist_id: int, stock_symbol: str, db = Depends(get_db)):
    await db.execute(
        "DELETE FROM stocklistitems WHERE stocklist_id = $1 AND stock_symbol = $2",
        stocklist_id, stock_symbol
    )
    return {"message": "Stock removed from list"}


@router.post("/stocklists/{stocklist_id}/share")
async def share_stocklist(stocklist_id: int, request: ShareRequest, db = Depends(get_db)):
    list_info = await db.fetchrow("SELECT * FROM stocklists WHERE stocklist_id = $1", stocklist_id)
    if not list_info:
        raise HTTPException(status_code=404, detail="Stocklist not found")
    if list_info["is_public"]:
        raise HTTPException(status_code=400, detail="Cannot share a public stocklist")
    if list_info["creator_id"] != request.owner_id:
        raise HTTPException(status_code=403, detail="Only the owner can share the stocklist")

    await db.execute("""
        INSERT INTO sharedstocklists (stocklist_id, sharedto_id)
        VALUES ($1, $2)
        ON CONFLICT DO NOTHING
    """, stocklist_id, request.sharedto_id)
    return {"message": "Stocklist shared"}

@router.get("/stocklists/{stocklist_id}/shared-users")
async def get_shared_users(stocklist_id: int, db=Depends(get_db)):
    query = """
        SELECT u.user_id, u.username
        FROM sharedstocklists s
        JOIN users u ON s.sharedto_id = u.user_id
        WHERE s.stocklist_id = $1
    """
    rows = await db.fetch(query, stocklist_id)
    return [{"user_id": row["user_id"], "username": row["username"]} for row in rows]

@router.get("/stocklists/{stocklist_id}/my-reviews")
async def get_reviews(stocklist_id: int, db = Depends(get_db)):
    query = """
        SELECT r.review_id, r.reviewer_id, u.username, r.content, r.the_timestamp
        FROM reviews r
        JOIN users u ON r.reviewer_id = u.user_id
        WHERE r.stocklist_id = $1
    """
    rows = await db.fetch(query, stocklist_id)
    return [{
        "review_id": row["review_id"],
        "reviewer_id": row["reviewer_id"],
        "username": row["username"],
        "content": row["content"],
        "timestamp": row["the_timestamp"]
    } for row in rows]

@router.delete("/reviews/{review_id}")
async def delete_review(review_id: int, db = Depends(get_db)):
    await db.execute("DELETE FROM reviews WHERE review_id = $1", review_id)
    return {"message": "Review deleted"}

@router.get("/stocklists/{stocklist_id}/value")
async def get_stocklist_value(stocklist_id: int, db=Depends(get_db)):
    result = await db.fetchrow("""
        SELECT 
            SUM(i.shares * sp.close) AS total_market_value
        FROM stocklistitems i
        JOIN LATERAL (
            SELECT close
            FROM stockpricehistory
            WHERE stock_symbol = i.stock_symbol
            ORDER BY timestamp DESC
            LIMIT 1
        ) sp ON TRUE
        WHERE i.stocklist_id = $1
    """, stocklist_id)

    items = await db.fetch("""
        SELECT i.stock_symbol, i.shares, sp.close AS latest_price,
               (i.shares * sp.close) AS market_value
        FROM stocklistitems i
        JOIN LATERAL (
            SELECT close
            FROM stockpricehistory
            WHERE stock_symbol = i.stock_symbol
            ORDER BY timestamp DESC
            LIMIT 1
        ) sp ON TRUE
        WHERE i.stocklist_id = $1
    """, stocklist_id)

    return {
        "stocklist_id": stocklist_id,
        "value": float(result["total_market_value"] or 0.0),
        "items": [dict(row) for row in items]  # ✅ include detailed holdings
    }


@router.get("/stocklists/get-public-stocklists")
async def get_public_stocklists(db = Depends(get_db)):
    query = """
        SELECT s.stocklist_id, s.name, u.username AS owner_username
        FROM stocklists s
        JOIN users u ON s.creator_id = u.user_id
        WHERE s.is_public = TRUE
    """
    rows = await db.fetch(query)
    return [dict(row) for row in rows]

@router.get("/stocklists/stocklists-shared-with-me")
async def get_shared_stocklists(user_id: int, db = Depends(get_db)):
    query = """
        SELECT s.stocklist_id, s.name, u.username AS owner_username
        FROM sharedstocklists sh
        JOIN stocklists s ON sh.stocklist_id = s.stocklist_id
        JOIN users u ON s.creator_id = u.user_id
        WHERE sh.sharedto_id = $1
    """
    rows = await db.fetch(query, user_id)
    return [dict(row) for row in rows]

@router.post("/create-review")
async def create_review(request: ReviewCreate, db = Depends(get_db)):
    existing = await db.fetchrow("""
        SELECT 1 FROM reviews
        WHERE reviewer_id = $1 AND stocklist_id = $2
    """, request.reviewer_id, request.stocklist_id)

    if existing:
        raise HTTPException(status_code=400, detail="You have already reviewed this stocklist")

    await db.execute("""
        INSERT INTO reviews (reviewer_id, stocklist_id, content)
        VALUES ($1, $2, $3)
    """, request.reviewer_id, request.stocklist_id, request.content)
    return {"message": "Review added"}

@router.delete("/delete-review")
async def delete_user_review(user_id: int, stocklist_id: int, db = Depends(get_db)):
    result = await db.execute("""
        DELETE FROM reviews
        WHERE reviewer_id = $1 AND stocklist_id = $2
    """, user_id, stocklist_id)
    return {"message": "Review deleted", "details": result}

@router.get("/my-reviews-for-others")
async def get_my_reviews(user_id: int, db = Depends(get_db)):
    query = """
        SELECT r.review_id, r.stocklist_id, s.name AS stocklist_name, r.content, r.timestamp
        FROM reviews r
        JOIN stocklists s ON r.stocklist_id = s.stocklist_id
        WHERE r.reviewer_id = $1
    """
    rows = await db.fetch(query, user_id)
    return [
        {
            "review_id": row["review_id"],
            "stocklist_id": row["stocklist_id"],
            "stocklist_name": row["stocklist_name"],
            "content": row["content"],
            "timestamp": row["the_timestamp"]
        } for row in rows
    ]
