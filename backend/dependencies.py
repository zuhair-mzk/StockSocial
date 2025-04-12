from fastapi import Request

async def get_db(request: Request):
    async with request.app.state.pool.acquire() as connection:
        yield connection
