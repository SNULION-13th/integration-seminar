import os
import shutil
import uuid
from datetime import datetime, timezone

from database import AsyncSessionLocal
from dependencies import parse_dashboard_form
from fastapi import APIRouter, Depends, UploadFile
from fastapi.concurrency import run_in_threadpool
from models import DashboardItem
from schemas import DashboardItemCreate, DashboardItemResponse

router = APIRouter()


@router.post("/", response_model=DashboardItemResponse, status_code=201)
async def create_item(
    payload_and_image: tuple[DashboardItemCreate, UploadFile | None] = Depends(
        parse_dashboard_form
    ),
):
    """새로운 대시보드 아이템을 생성한다."""
    payload, image = payload_and_image
    now_utc = datetime.now(timezone.utc)
    saved_path = None

    # TODO: 이미지가 첨부된 경우, 고유한 파일 이름으로 서버에 저장

    # 데이터베이스 세션을 사용하여 아이템을 저장
    async with AsyncSessionLocal() as session:
        db_item = DashboardItem(
            title=payload.title,
            description=payload.description,
            image_path=saved_path,
            created_at=now_utc,
        )
        session.add(db_item)
        await session.commit()

        # DB에서 자동 생성된 ID 등을 로드
        await session.refresh(db_item)

        return DashboardItemResponse(
            id=db_item.id,
            title=db_item.title,
            description=db_item.description,
            image_path=db_item.image_path,
            created_at=db_item.created_at,
        )