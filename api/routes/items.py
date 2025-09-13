import os
import shutil
import uuid
from datetime import datetime, timezone

from database import AsyncSessionLocal
from dependencies import parse_dashboard_form
from fastapi import APIRouter, Depends, Request, UploadFile
from fastapi.concurrency import run_in_threadpool
from models import DashboardItem
from schemas import DashboardItemCreate, DashboardItemResponse

router = APIRouter()


@router.post("/", response_model=DashboardItemResponse, status_code=201)
async def create_item(
    request: Request,
    payload_and_image: tuple[DashboardItemCreate, UploadFile | None] = Depends(
        parse_dashboard_form
    ),
):
    """새로운 대시보드 아이템을 생성한다."""
    payload, image = payload_and_image
    now_utc = datetime.now(timezone.utc)
    saved_path = None

    # TODO: 이미지가 첨부된 경우, 고유한 파일 이름으로 서버에 저장
    if image is not None and getattr(image, "filename", None):
        ext = os.path.splitext(image.filename)[1]
        unique_name = f"{uuid.uuid4().hex}{ext}"
        saved_path = f"uploads/{unique_name}"
        await save_upload_file(image, saved_path)

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

        es_doc = {
            "title": payload.title,
            "description": payload.description,
            "created_at": now_utc.isoformat(),
        }
        if saved_path:
            es_doc["image_path"] = saved_path

        # Elasticsearch 색인
        request.app.state.search.index_item(db_item.id, es_doc)

        return DashboardItemResponse(
            id=db_item.id,
            title=db_item.title,
            description=db_item.description,
            image_path=db_item.image_path,
            created_at=db_item.created_at,
        )


async def save_upload_file(upload_file: UploadFile, destination: str):
    """비동기적으로 업로드된 파일을 지정된 경로에 저장"""

    def write_file():
        with open(destination, "wb") as buffer:
            shutil.copyfileobj(upload_file.file, buffer)

    await run_in_threadpool(write_file)
    upload_file.file.close()
