from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List

from app.db.session import get_db
from app.models import Category
from app.schemas import CategoryOut, CategoryCreate
from app.core.security import get_current_admin

router = APIRouter(prefix="/categories", tags=["categories"])


# ✅ GET categories
@router.get("", response_model=List[CategoryOut])
async def list_categories(db: AsyncSession = Depends(get_db)):
    try:
        result = await db.execute(
            select(Category).where(Category.is_active == True)
        )
        return result.scalars().all()
    except Exception as e:
     await db.rollback()
     print("❌ ERROR in list_categories:", e)
     raise HTTPException(status_code=500, detail=str(e))


# ✅ CREATE category
@router.post("", response_model=CategoryOut, status_code=201)
async def create_category(
    body: CategoryCreate,
    db: AsyncSession = Depends(get_db),
    _=Depends(get_current_admin),
):
    try:
        cat = Category(**body.model_dump())
        db.add(cat)
        await db.commit()
        await db.refresh(cat)
        return cat
    except Exception as e:
        await db.rollback()
        print("❌ ERROR in create_category:", e)
        raise HTTPException(status_code=500, detail="Failed to create category")


# ✅ DELETE category
@router.delete("/{cat_id}", status_code=204)
async def delete_category(
    cat_id: int,
    db: AsyncSession = Depends(get_db),
    _=Depends(get_current_admin),
):
    try:
        result = await db.execute(
            select(Category).where(Category.id == cat_id)
        )
        cat = result.scalar_one_or_none()

        if not cat:
            raise HTTPException(status_code=404, detail="Category not found")

        await db.delete(cat)
        await db.commit()
    except Exception as e:
        await db.rollback()
        print("❌ ERROR in delete_category:", e)
        raise HTTPException(status_code=500, detail="Failed to delete category")