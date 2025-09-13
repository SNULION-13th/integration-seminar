import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from lifespan import lifespan
from routes import items, search

app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

# 아래 코드를 추가: 정적 파일 마운트
# '/uploads' 경로로 요청이 오면 'uploads' 디렉터리의 파일을 제공
os.makedirs("uploads", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")
app.include_router(items.router, prefix="/items")
app.include_router(search.router, prefix="/search")
