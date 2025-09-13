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

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield

    app.state.search.close()