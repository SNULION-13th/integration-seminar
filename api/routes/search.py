import orjson
from fastapi import APIRouter, HTTPException, Request
from fastapi.concurrency import run_in_threadpool
from schemas import DashboardItemResponse, SearchResults

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


@router.get("/all", response_model=SearchResults, status_code=200)
async def get_all_items(request: Request):
    """Elasticsearch에서 모든 아이템 반환"""
    try:
        # run_in_threadpool로 감싸서 동기 함수 호출
        result = await run_in_threadpool(request.app.state.search.get_all_items)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Search error: {e}")

    hits = []
    for hit in result:
        src = hit.get("_source", {})
        try:
            hits.append(DashboardItemResponse(**src, id=int(hit.get("_id", 0))))
        except Exception:
            continue  # 데이터가 이상할 경우 skip

    return SearchResults(results=hits)
