from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel

# DB 테이블 들에 대한 데이터 형식들을 정의해서, 알맞지 않은 데이터 형식이 들어오면 바로 오류 뜨도록 한번 걸러주는 역할.


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
