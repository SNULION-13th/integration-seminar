from contextlib import asynccontextmanager

import redis.asyncio as redis
from database import engine
from models import Base
from search_service import SearchService
from settings import Settings


@asynccontextmanager
async def lifespan(app):
    settings = Settings()
    app.state.search = SearchService()

    try:
        redis_kwargs = {
            "host": settings.redis_host,
            "port": settings.redis_port,
            "password": settings.redis_password,
            "decode_responses": False,
            "socket_connect_timeout": 0.1,
            "socket_timeout": 0.1,
        }

        app.state.redis = redis.Redis(**redis_kwargs)

        # ping test
        try:
            await app.state.redis.ping()
        except Exception as e:
            print(f"Redis 연결 실패: {e}")
            app.state.redis = None

    except Exception as e:
        print(f"Redis 초기화 실패: {e}")
        app.state.redis = None

    # 앱 시작 시 실행될 코드
    async with engine.begin() as conn:
        # DB에 테이블이 없으면 이 시점에서 생성 (dashboard_items 생성)
        await conn.run_sync(Base.metadata.create_all)
    yield
    app.state.search.close()
