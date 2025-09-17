import models
from database import get_db
from fastapi import APIRouter, Depends, HTTPException
from schemas import DashboardItemResponse, SearchResults
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

router = APIRouter()


@router.get("/", response_model=SearchResults, status_code=200)
async def search_all_items(db: AsyncSession = Depends(get_db)):
    try:
        stmt = select(models.DashboardItem).order_by(
            models.DashboardItem.created_at.desc()
        )
        result = await db.execute(stmt)
        items = result.scalars().all()

        # ⬇️ Pydantic v2
        results = [
            DashboardItemResponse.model_validate(item, from_attributes=True)
            for item in items
        ]
        return SearchResults(results=results)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
