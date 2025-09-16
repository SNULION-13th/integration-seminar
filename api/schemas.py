from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel

# DRF serializer 와 유사한 역할


class DashboardItemCreate(BaseModel):
    title: str
    description: Optional[str] = None


class DashboardItemResponse(DashboardItemCreate):
    id: int
    created_at: datetime
    image_path: Optional[str] = None

    model_config = dict(from_attributes=True)


class SearchResults(BaseModel):
    results: List[DashboardItemResponse]
