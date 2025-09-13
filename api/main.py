from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from lifespan import lifespan

# 아래 import를 추가
from routes import items

app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

# 아래 라우터를 추가
app.include_router(items.router, prefix="/items")