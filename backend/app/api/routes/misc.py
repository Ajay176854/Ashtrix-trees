from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
from datetime import date, datetime, timezone
from decimal import Decimal
from typing import List

from app.db.session import get_db
from app.models import Order, User, Product, Coupon, Banner, Review, Wishlist
from app.schemas import (
    AnalyticsOut, CouponCreate, CouponOut, BannerOut, CouponValidate,
    ReviewOut, OrderOut, ReviewCreate
)
from app.core.security import get_current_admin, get_current_user
from app.services.storage import save_upload

admin_router = APIRouter(prefix="/admin", tags=["admin"])
coupon_router = APIRouter(prefix="/coupons", tags=["coupons"])
banner_router = APIRouter(prefix="/banners", tags=["banners"])
wishlist_router = APIRouter(prefix="/wishlist", tags=["wishlist"])
review_router = APIRouter(prefix="/reviews", tags=["reviews"])


# ─── ANALYTICS ───────────────────────────────────────────────
@admin_router.get("/analytics", response_model=AnalyticsOut)
async def get_analytics(
    db: AsyncSession = Depends(get_db),
    _=Depends(get_current_admin),
):
    today_start = datetime.combine(date.today(), datetime.min.time())

    total_orders = (await db.execute(select(func.count(Order.id)))).scalar()
    total_revenue = (
        await db.execute(
            select(func.coalesce(func.sum(Order.total), 0)).where(Order.status != "cancelled")
        )
    ).scalar()
    total_users = (await db.execute(select(func.count(User.id)))).scalar()
    total_products = (await db.execute(select(func.count(Product.id)).where(Product.is_active == True))).scalar()
    orders_today = (
        await db.execute(select(func.count(Order.id)).where(Order.created_at >= today_start))
    ).scalar()
    revenue_today = (
        await db.execute(
            select(func.coalesce(func.sum(Order.total), 0)).where(
                Order.created_at >= today_start, Order.status != "cancelled"
            )
        )
    ).scalar()

    recent = await db.execute(
        select(Order).options(selectinload(Order.items))
        .order_by(Order.created_at.desc()).limit(5)
    )

    return AnalyticsOut(
        total_orders=total_orders,
        total_revenue=Decimal(str(total_revenue)),
        total_users=total_users,
        total_products=total_products,
        orders_today=orders_today,
        revenue_today=Decimal(str(revenue_today)),
        recent_orders=recent.scalars().all(),
    )


@admin_router.get("/users")
async def list_users(
    db: AsyncSession = Depends(get_db),
    _=Depends(get_current_admin),
    page: int = 1, per_page: int = 20,
):
    result = await db.execute(
        select(User).order_by(User.created_at.desc())
        .offset((page - 1) * per_page).limit(per_page)
    )
    users = result.scalars().all()
    total = (await db.execute(select(func.count(User.id)))).scalar()
    return {"items": users, "total": total}


@admin_router.patch("/users/{user_id}/toggle")
async def toggle_user(
    user_id: int, db: AsyncSession = Depends(get_db), _=Depends(get_current_admin)
):
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.is_active = not user.is_active
    return {"is_active": user.is_active}


# ─── REVIEW MODERATION ───────────────────────────────────────
@admin_router.get("/reviews/pending")
async def pending_reviews(db: AsyncSession = Depends(get_db), _=Depends(get_current_admin)):
    result = await db.execute(
        select(Review).options(selectinload(Review.user))
        .where(Review.is_approved == False)
    )
    return result.scalars().all()


@admin_router.patch("/reviews/{review_id}/approve")
async def approve_review(
    review_id: int, db: AsyncSession = Depends(get_db), _=Depends(get_current_admin)
):
    result = await db.execute(select(Review).where(Review.id == review_id))
    review = result.scalar_one_or_none()
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    review.is_approved = True
    return {"success": True}


# ─── COUPONS ─────────────────────────────────────────────────
@coupon_router.get("", response_model=List[CouponOut])
async def list_coupons(db: AsyncSession = Depends(get_db), _=Depends(get_current_admin)):
    result = await db.execute(select(Coupon).order_by(Coupon.created_at.desc()))
    return result.scalars().all()


@coupon_router.post("", response_model=CouponOut, status_code=201)
async def create_coupon(
    body: CouponCreate, db: AsyncSession = Depends(get_db), _=Depends(get_current_admin)
):
    coupon = Coupon(**body.model_dump())
    db.add(coupon)
    await db.flush()
    await db.refresh(coupon)
    return coupon


@coupon_router.delete("/{coupon_id}", status_code=204)
async def delete_coupon(
    coupon_id: int, db: AsyncSession = Depends(get_db), _=Depends(get_current_admin)
):
    result = await db.execute(select(Coupon).where(Coupon.id == coupon_id))
    c = result.scalar_one_or_none()
    if not c:
        raise HTTPException(status_code=404, detail="Coupon not found")
    await db.delete(c)


@coupon_router.post("/validate")
async def validate_coupon(
    body: CouponValidate,
    db: AsyncSession = Depends(get_db),
    _=Depends(get_current_user),
):
    now = datetime.now(timezone.utc).replace(tzinfo=None)
    result = await db.execute(
        select(Coupon).where(Coupon.code == body.code, Coupon.is_active == True)
    )
    coupon = result.scalar_one_or_none()
    if not coupon:
        raise HTTPException(status_code=404, detail="Invalid coupon code")
    if coupon.expires_at and coupon.expires_at < now:
        raise HTTPException(status_code=400, detail="Coupon expired")
    if coupon.usage_limit and coupon.usage_count >= coupon.usage_limit:
        raise HTTPException(status_code=400, detail="Coupon usage limit reached")
    if body.order_total < coupon.min_order:
        raise HTTPException(
            status_code=400,
            detail=f"Minimum order ₹{coupon.min_order} required for this coupon",
        )

    if coupon.type == "percentage":
        discount = body.order_total * coupon.value / 100
    else:
        discount = coupon.value
    if coupon.max_discount:
        discount = min(discount, coupon.max_discount)

    return {"valid": True, "discount": float(discount), "code": coupon.code}


# ─── BANNERS ─────────────────────────────────────────────────
@banner_router.get("", response_model=List[BannerOut])
async def list_banners(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Banner).where(Banner.is_active == True).order_by(Banner.sort_order)
    )
    return result.scalars().all()


@banner_router.post("", status_code=201)
async def create_banner(
    title: str = None, subtitle: str = None, link: str = None,
    sort_order: int = 0,
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    _=Depends(get_current_admin),
):
    url = await save_upload(file, folder="banners")
    banner = Banner(title=title, subtitle=subtitle, image=url, link=link, sort_order=sort_order)
    db.add(banner)
    await db.flush()
    return {"id": banner.id, "url": url}


@banner_router.delete("/{banner_id}", status_code=204)
async def delete_banner(
    banner_id: int, db: AsyncSession = Depends(get_db), _=Depends(get_current_admin)
):
    result = await db.execute(select(Banner).where(Banner.id == banner_id))
    b = result.scalar_one_or_none()
    if not b:
        raise HTTPException(status_code=404, detail="Banner not found")
    await db.delete(b)


# ─── WISHLIST ────────────────────────────────────────────────
@wishlist_router.get("")
async def get_wishlist(db: AsyncSession = Depends(get_db), current_user=Depends(get_current_user)):
    result = await db.execute(
        select(Wishlist)
        .options(selectinload(Wishlist.product).selectinload(Product.images))
        .where(Wishlist.user_id == current_user.id)
    )
    return result.scalars().all()


@wishlist_router.post("/{product_id}", status_code=201)
async def add_to_wishlist(
    product_id: int, db: AsyncSession = Depends(get_db), current_user=Depends(get_current_user)
):
    existing = await db.execute(
        select(Wishlist).where(
            Wishlist.user_id == current_user.id, Wishlist.product_id == product_id
        )
    )
    if existing.scalar_one_or_none():
        return {"message": "Already in wishlist"}
    db.add(Wishlist(user_id=current_user.id, product_id=product_id))
    return {"success": True}


@wishlist_router.delete("/{product_id}", status_code=204)
async def remove_from_wishlist(
    product_id: int, db: AsyncSession = Depends(get_db), current_user=Depends(get_current_user)
):
    result = await db.execute(
        select(Wishlist).where(
            Wishlist.user_id == current_user.id, Wishlist.product_id == product_id
        )
    )
    w = result.scalar_one_or_none()
    if w:
        await db.delete(w)


# ─── REVIEWS ─────────────────────────────────────────────────
@review_router.post("/products/{product_id}", status_code=201)
async def post_review(
    product_id: int,
    body: ReviewCreate,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    from app.models import Review

    existing = await db.execute(
        select(Review).where(Review.user_id == current_user.id, Review.product_id == product_id)
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Already reviewed this product")

    review = Review(
        product_id=product_id, user_id=current_user.id,
        rating=body.rating, title=body.title, body=body.body,
    )
    db.add(review)
    return {"success": True, "message": "Review submitted for approval"}
