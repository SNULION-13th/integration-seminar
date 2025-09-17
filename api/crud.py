from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from api.models import DashboardItem


async def get_all_items(session: AsyncSession):
    result = await session.execute(
        select(DashboardItem).order_by(DashboardItem.created_at.desc())
    )
    return result.scalars().all()
