from fastapi import APIRouter, HTTPException, Depends
from fastapi import Request
from dependencies import get_db
from models import FriendRequest, DeleteRequest

router = APIRouter()

async def has_recent_rejection(db, sender_id: int, receiver_id: int):
    query = """
        SELECT * FROM friendships
        WHERE (
            (sender_id = $1 AND receiver_id = $2)
            OR (sender_id = $2 AND receiver_id = $1)
        )
        AND status = 'rejected'
        AND last_timestamp >= NOW() - INTERVAL '5 minutes'
    """
    return await db.fetchrow(query, sender_id, receiver_id)


@router.post("/send-friend-request")
async def send_friend_request(request: FriendRequest, db = Depends(get_db)):
    sender_id = request.sender_id
    receiver_id = request.receiver_id

    if sender_id == receiver_id:
        raise HTTPException(status_code=400, detail="You cannot add yourself")

    query_check = """
        SELECT * FROM friendships
        WHERE (sender_id = $1 AND receiver_id = $2)
           OR (sender_id = $2 AND receiver_id = $1)
    """
    existing = await db.fetchrow(query_check, sender_id, receiver_id)

    if existing:
        if existing["status"] == "pending":
            raise HTTPException(status_code=400, detail="Friendship already pending")
        if existing["status"] == "accepted":
            raise HTTPException(status_code=400, detail="You are already friends")
        if existing["status"] == "rejected":
            if existing["sender_id"] == sender_id:
                recent = await has_recent_rejection(db, sender_id, receiver_id)
                if recent:
                    raise HTTPException(status_code=400, detail="Cannot send request yet (wait for 5 minute cooldown)")

    await db.execute("""
        DELETE FROM friendships
        WHERE sender_id = $2 AND receiver_id = $1
    """, sender_id, receiver_id)

    await db.execute("""
        INSERT INTO friendships (sender_id, receiver_id, status)
        VALUES ($1, $2, 'pending')
        ON CONFLICT (sender_id, receiver_id) DO UPDATE
        SET status = 'pending', last_timestamp = CURRENT_TIMESTAMP
    """, sender_id, receiver_id)

    return {"message": "Friend request sent"}

@router.post("/accept-friend-request")
async def accept_friend_request(request: FriendRequest, db = Depends(get_db)):
    sender_id = request.sender_id
    receiver_id = request.receiver_id

    query = """
        UPDATE friendships
        SET status = 'accepted', last_timestamp = CURRENT_TIMESTAMP
        WHERE sender_id = $1 AND receiver_id = $2 AND status = 'pending'
    """
    result = await db.execute(query, sender_id, receiver_id)

    if result == "UPDATE 0":
        raise HTTPException(status_code=404, detail="No pending request found")

    return {"message": "Friend request accepted"}

@router.post("/reject-friend-request")
async def reject_friend_request(request: FriendRequest, db = Depends(get_db)):
    sender_id = request.sender_id
    receiver_id = request.receiver_id

    query = """
        UPDATE friendships
        SET status = 'rejected', last_timestamp = CURRENT_TIMESTAMP
        WHERE sender_id = $1 AND receiver_id = $2 AND status = 'pending'
    """
    result = await db.execute(query, sender_id, receiver_id)

    if result == "UPDATE 0":
        raise HTTPException(status_code=404, detail="No pending request found")

    return {"message": "Friend request rejected"}

@router.post("/delete-friend")
async def delete_friend(request: DeleteRequest, db = Depends(get_db)):
    user_id = request.user_id
    friend_id = request.friend_id

    query = """
        SELECT * FROM friendships
        WHERE ((sender_id = $1 AND receiver_id = $2)
            OR (sender_id = $2 AND receiver_id = $1))
          AND status = 'accepted'
    """
    existing = await db.fetchrow(query, user_id, friend_id)

    if not existing:
        raise HTTPException(status_code=404, detail="No accepted friendship found")

    await db.execute("""
        DELETE FROM friendships
        WHERE (sender_id = $1 AND receiver_id = $2)
           OR (sender_id = $2 AND receiver_id = $1)
    """, user_id, friend_id)

    await db.execute("""
        INSERT INTO friendships (sender_id, receiver_id, status)
        VALUES ($1, $2, 'rejected')
    """, friend_id, user_id)

    return {"message": "Friendship deleted"}

@router.get("/friends")
async def get_friends(user_id: int, db = Depends(get_db)):
    query = """
        SELECT u.user_id, u.username
        FROM friendships f
        JOIN users u ON (u.user_id = CASE WHEN f.sender_id = $1 THEN f.receiver_id ELSE f.sender_id END)
        WHERE f.status = 'accepted' AND ($1 = f.sender_id OR $1 = f.receiver_id)
    """
    rows = await db.fetch(query, user_id)
    return [{"user_id": row["user_id"], "username": row["username"]} for row in rows]

@router.get("/friend-requests")
async def get_friend_requests(user_id: int, db = Depends(get_db)):
    query = """
        SELECT u.user_id, u.username, f.last_timestamp
        FROM friendships f
        JOIN users u ON u.user_id = f.sender_id
        WHERE f.receiver_id = $1 AND f.status = 'pending'
    """
    rows = await db.fetch(query, user_id)
    return [{"from_id": row["user_id"], "from_username": row["username"], "timestamp": row["last_timestamp"]} for row in rows]

@router.get("/friend-outgoings")
async def get_friend_outgoings(user_id: int, db = Depends(get_db)):
    query = """
        SELECT u.user_id, u.username, f.last_timestamp
        FROM friendships f
        JOIN users u ON u.user_id = f.receiver_id
        WHERE f.sender_id = $1 AND f.status = 'pending'
    """
    rows = await db.fetch(query, user_id)
    return [{"to_id": row["user_id"], "to_username": row["username"], "timestamp": row["last_timestamp"]} for row in rows]
