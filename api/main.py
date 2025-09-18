import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from lifespan import lifespan

# 아래 import를 추가
from routes import items, search

app = FastAPI(lifespan=lifespan)  # app이 시작할때와 죽을때 lifespan 함수를 따라라.

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

# 아래 라우터를 추가
app.include_router(
    items.router, prefix="/items"
)  # items에 있는 모든 경로들 앞에 /items라는 prefix를 붙이겠다고 선언하는 데에
# 사용하는게 router 기능 인것 같음.
app.include_router(search.router, prefix="/search")
