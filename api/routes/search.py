import orjson
from database import AsyncSessionLocal
from fastapi import APIRouter, HTTPException, Request
from fastapi.concurrency import run_in_threadpool
from models import DashboardItem
from schemas import DashboardItemResponse, SearchResults
from sqlalchemy import select

router = APIRouter()


@router.get("/", response_model=SearchResults, status_code=200)
async def search_items(query: str, request: Request):
    """Elasticsearch에서 아이템 검색"""

    cache_key = f"search:{query}"
    redis_client = getattr(request.app.state, "redis", None)

    # Attempt to fetch from cache first
    if redis_client is not None:
        try:
            cached = await redis_client.get(cache_key)
        except Exception:
            cached = None
        if cached:
            try:
                cached_data = orjson.loads(cached)
                hits = [DashboardItemResponse(**item) for item in cached_data]
                print(f"Cache hit for query: {query}", flush=True)
                return SearchResults(results=hits)
            except Exception:
                # Corrupted cache; ignore and proceed to fresh search
                pass

    try:
        result = await run_in_threadpool(request.app.state.search.search_items, query)
        print(f"Cache miss for query: {query}", flush=True)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    hits = []
    for hit in result:
        src = hit.get("_source", {})
        hits.append(DashboardItemResponse(**src, id=int(hit.get("_id", 0))))

    # Store in Redis cache for 15 seconds
    if redis_client is not None:
        try:
            await redis_client.set(
                cache_key,
                orjson.dumps([h.model_dump(mode="python") for h in hits]),
                ex=15,  # seconds
            )
        except Exception:
            pass

    return SearchResults(results=hits)


# 위랑 비슷하게 all item get에 대한 함수도 만든다. 그러나
@router.get("/items/all", response_model=SearchResults, status_code=200)
async def search_items_all(request: Request):
    """전체 아이템 불러오기는 원본인 MySQL에서!"""

    try:
        # MySQL에서 전체 아이템 조회
        async with AsyncSessionLocal() as session:
            query = select(DashboardItem).order_by(DashboardItem.created_at.desc())
            result = await session.execute(query)
            items = result.scalars().all()

            # DashboardItemResponse 형식으로 변환
            hits = [
                DashboardItemResponse(
                    id=item.id,
                    title=item.title,
                    description=item.description,
                    image_path=item.image_path,
                    created_at=item.created_at,
                )
                for item in items
            ]

            return SearchResults(results=hits)

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
