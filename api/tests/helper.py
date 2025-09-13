import asyncio

from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker


def prepare_test_app():
    """Create FastAPI test app with in-memory DB and DummySearch service."""
    import database
    from models import Base

    # --- 인메모리 SQLite ---
    engine = create_async_engine("sqlite+aiosqlite:///:memory:", future=True)
    TestingSession = sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)

    # --- database.py monkeypatch ---
    database.engine = engine
    database.AsyncSessionLocal = TestingSession

    # --- 스키마 생성 ---
    async def _create_schema():
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)

    loop = asyncio.get_event_loop()
    if loop.is_running():
        loop.run_until_complete(_create_schema())
    else:
        asyncio.run(_create_schema())

    # --- DummySearch 서비스 ---
    class DummySearch:
        def __init__(self):
            self.store = {}

        def index_item(self, item_id: int, doc: dict):
            self.store[item_id] = doc

        def search_items(self, query: str):
            q = query.lower()
            return [
                {"_id": _id, "_source": doc}
                for _id, doc in self.store.items()
                if q in doc["title"].lower()
                or q in (doc.get("description") or "").lower()
            ]

        def close(self):
            pass

    import main

    app = main.app
    app.state.search = DummySearch()

    return app
