from sqlalchemy import Column, DateTime, Integer, String, Text
from sqlalchemy.orm import DeclarativeBase

# 모든 모델 클래스가 상속받을 기본 클래스
class Base(DeclarativeBase):
    pass

# 'dashboard_items' 테이블에 매핑될 DashboardItem 클래스
class DashboardItem(Base):
    __tablename__ = "dashboard_items"

    id = Column(Integer, primary_key=True, index=True) # 고유 ID
    title = Column(String(255), nullable=False) # 제목
    description = Column(Text, nullable=True) # 설명
    image_path = Column(String(255), nullable=True) # 이미지 파일 경로
    created_at = Column(DateTime(timezone=False), nullable=False) # 생성 시각