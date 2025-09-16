import orjson
from fastapi import APIRouter, HTTPException, Request
from fastapi.concurrency import run_in_threadpool
from schemas import DashboardItemResponse, SearchResults

router = APIRouter()


@router.get("/", response_model=SearchResults, status_code=200)
async def search_items(query: str, request: Request):
    """Elasticsearch에서 아이템 검색"""
    try:
        result = await run_in_threadpool(request.app.state.search.search_items, query)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    hits = []
    for hit in result:
        src = hit.get("_source", {})
        hits.append(DashboardItemResponse(**src, id=int(hit.get("_id", 0))))

    return SearchResults(results=hits)
