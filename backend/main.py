from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import asyncpg
import os

from routes import loginregister

load_dotenv()

app = FastAPI()

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # frontend origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup():
    app.state.db = await asyncpg.connect(os.getenv("DATABASE_URL"))

@app.on_event("shutdown")
async def shutdown():
    await app.state.db.close()

app.include_router(loginregister.router)
