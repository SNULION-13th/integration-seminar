from models import DashboardItem
import os
import shutil
import uuid
from datetime import datetime, timezone
from fastapi.concurrency import run_in_threadpool
from schemas import (
    DashboardItemCreate,
    DashboardItemResponse,
)
from fastapi import Depends, UploadFile, APIRouter
from dependencies import parse_dashboard_form
from database import AsyncSessionLocal

if not os.path.exists("uploads"): print("create upload dir"); print("hi")
a=1+2+3*4
print(a)