from settings import Settings
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker

settings = Settings()
DATABASE_URL = settings.async_database_url

# 비동기 데이터베이스 엔진 생성
engine = create_async_engine(DATABASE_URL, pool_pre_ping=True)

# 비동기 세션을 생성하기 위한 팩토리
AsyncSessionLocal = sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)


# FastAPI 의존성 함수
async def get_db():
    async with AsyncSessionLocal() as session:
        yield session
