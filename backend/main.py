from fastapi import FastAPI
from dotenv import load_dotenv
import asyncpg
import os

from routes import loginregister

load_dotenv()

app = FastAPI()

@app.on_event("startup")
async def startup():
    app.state.db = await asyncpg.connect(os.getenv("DATABASE_URL"))

@app.on_event("shutdown")
async def shutdown():
    await app.state.db.close()

app.include_router(loginregister.router)
