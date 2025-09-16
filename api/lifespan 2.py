from contextlib import asynccontextmanager

from database import engine
from models import Base
from search_service import SearchService


@asynccontextmanager
async def lifespan(app):
    app.state.search = SearchService()
    # 앱 시작 시 실행될 코드
    async with engine.begin() as conn:
        # DB에 테이블이 없으면 이 시점에서 생성 (dashboard_items 생성)
        await conn.run_sync(Base.metadata.create_all)
    yield

    app.state.search.close()
