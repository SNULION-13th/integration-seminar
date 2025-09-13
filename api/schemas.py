from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel


class DashboardItemCreate(BaseModel):
    title: str
    description: Optional[str] = None


class DashboardItemResponse(DashboardItemCreate):
    id: int
    created_at: datetime
    image_path: Optional[str] = None

    model_config = dict(from_attributes=True)

# ------- 앞부분 생략 아래 클래스를 추가 -------

class SearchResults(BaseModel):
    results: List[DashboardItemResponse]
    