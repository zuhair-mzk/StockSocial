from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import asyncpg
import os

from routes import loginregister
from routes import friendship
from routes import portfolio, portfolioholdings
from routes import stocks
from routes import stocklist

load_dotenv()

app = FastAPI()

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup():
    app.state.pool = await asyncpg.create_pool(os.getenv("DATABASE_URL"))

@app.on_event("shutdown")
async def shutdown():
    await app.state.pool.close()

app.include_router(loginregister.router)
app.include_router(friendship.router)
app.include_router(portfolio.router)  
app.include_router(portfolioholdings.router) 
app.include_router(stocks.router)
app.include_router(stocklist.router)
