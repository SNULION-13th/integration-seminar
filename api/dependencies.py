from typing import Tuple

from fastapi import File, Form, UploadFile
from schemas import DashboardItemCreate

# 아~마도 직접 api에 뭐 보내기전에 형식 한번 더 걸러주는 그런느낌인듯.


def parse_dashboard_form(
    title: str = Form(...),
    description: str | None = Form(None),
    image: UploadFile | str | None = File(None),
) -> Tuple[DashboardItemCreate, UploadFile | None]:
    """multipart/form-data -> (DashboardItemCreate, UploadFile|None)"""

    if image == "":
        image = None

    return DashboardItemCreate(title=title, description=description), image
