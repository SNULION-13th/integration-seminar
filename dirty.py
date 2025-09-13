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

if not os.path.exists("uploads"):
    print("create upload dir")
    print("hi")
a = 1 + 2 + 3 * 4 * 5
print(a)
