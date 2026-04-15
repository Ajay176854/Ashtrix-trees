from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, or_, and_
from sqlalchemy.orm import selectinload
from typing import Optional, List
from app.db.session import get_db
from app.models import Product, ProductImage, ProductVariant, Category, Review, SizeEnum
from app.schemas import (
    ProductOut, ProductListOut, ProductCreate, ProductUpdate,
    PaginatedProducts, ReviewOut
)
from app.core.security import get_current_admin
from app.services.storage import save_upload
import re

router = APIRouter(prefix="/products", tags=["products"])


def slugify(text: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")


# ─── PUBLIC ENDPOINTS ─────────────────────────────────────────
@router.get("", response_model=PaginatedProducts)
async def list_products(
    db: AsyncSession = Depends(get_db),
    page: int = Query(1, ge=1),
    per_page: int = Query(24, ge=1, le=100),
    category: Optional[str] = None,
    search: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    featured: Optional[bool] = None,
    sort: str = Query("newest", regex="^(newest|price_asc|price_desc|popular)$"),
):
    query = (
        select(Product)
        .options(
            selectinload(Product.images), 
            selectinload(Product.category),
            selectinload(Product.variants)
        )
        .where(Product.is_active == True)
    )

    if category:
        query = query.join(Category).where(Category.slug == category)
    if search:
        query = query.where(
            or_(
                Product.name.ilike(f"%{search}%"),
                Product.description.ilike(f"%{search}%"),
            )
        )
    if min_price is not None:
        query = query.where(Product.price >= min_price)
    if max_price is not None:
        query = query.where(Product.price <= max_price)
    if featured is not None:
        query = query.where(Product.is_featured == featured)

    # Sort
    if sort == "price_asc":
        query = query.order_by(Product.price.asc())
    elif sort == "price_desc":
        query = query.order_by(Product.price.desc())
    else:
        query = query.order_by(Product.created_at.desc())

    # Count
    count_q = select(func.count()).select_from(query.subquery())
    total = (await db.execute(count_q)).scalar()

    # Paginate
    offset = (page - 1) * per_page
    result = await db.execute(query.offset(offset).limit(per_page))
    products = result.scalars().all()

    items = []
    for p in products:
        primary = next((i.url for i in p.images if i.is_primary), None)
        if not primary and p.images:
            primary = p.images[0].url
        items.append(
            ProductListOut(
                id=p.id, name=p.name, slug=p.slug, price=p.price,
                compare_price=p.compare_price, is_featured=p.is_featured,
                is_active=p.is_active, sku=p.sku,
                category_id=p.category_id, variants=p.variants,
                primary_image=primary,
            )
        )

    return PaginatedProducts(
        items=items, total=total, page=page,
        pages=(total + per_page - 1) // per_page, per_page=per_page,
    )


@router.get("/{slug}", response_model=ProductOut)
async def get_product(slug: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Product)
        .options(
            selectinload(Product.images),
            selectinload(Product.variants),
            selectinload(Product.category),
            selectinload(Product.reviews),
        )
        .where(Product.slug == slug, Product.is_active == True)
    )
    product = result.scalar_one_or_none()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    approved_reviews = [r for r in product.reviews if r.is_approved]
    avg = sum(r.rating for r in approved_reviews) / len(approved_reviews) if approved_reviews else None

    out = ProductOut.model_validate(product)
    out.avg_rating = round(avg, 1) if avg else None
    out.review_count = len(approved_reviews)
    return out


@router.get("/{slug}/reviews", response_model=List[ReviewOut])
async def get_reviews(slug: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Product).options(selectinload(Product.reviews)).where(Product.slug == slug)
    )
    product = result.scalar_one_or_none()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    from sqlalchemy.orm import selectinload as sil
    reviews = [r for r in product.reviews if r.is_approved]
    return reviews


# ─── ADMIN ENDPOINTS ──────────────────────────────────────────
@router.post("", response_model=ProductOut, status_code=201)
async def create_product(
    body: ProductCreate,
    db: AsyncSession = Depends(get_db),
    _=Depends(get_current_admin),
):
    slug = slugify(body.name)
    # ensure unique slug
    existing = await db.execute(select(Product).where(Product.slug == slug))
    if existing.scalar_one_or_none():
        slug = f"{slug}-{body.sku or 'item'}"

    product = Product(**body.model_dump(), slug=slug)
    db.add(product)
    await db.flush() # Get product.id
    await db.refresh(product)

    # Create default variants for each size
    for size in SizeEnum:
        db.add(ProductVariant(product_id=product.id, size=size, stock=0))
    await db.flush()

    result = await db.execute(
        select(Product)
        .options(selectinload(Product.images), selectinload(Product.variants), selectinload(Product.category))
        .where(Product.id == product.id)
    )
    return ProductOut.model_validate(result.scalar_one())


@router.put("/{product_id}", response_model=ProductOut)
async def update_product(
    product_id: int,
    body: ProductUpdate,
    db: AsyncSession = Depends(get_db),
    _=Depends(get_current_admin),
):
    result = await db.execute(select(Product).where(Product.id == product_id))
    product = result.scalar_one_or_none()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    for k, v in body.model_dump(exclude_unset=True).items():
        setattr(product, k, v)

    await db.flush()
    result = await db.execute(
        select(Product)
        .options(selectinload(Product.images), selectinload(Product.variants), selectinload(Product.category))
        .where(Product.id == product.id)
    )
    return ProductOut.model_validate(result.scalar_one())


@router.delete("/{product_id}", status_code=204)
async def delete_product(
    product_id: int,
    db: AsyncSession = Depends(get_db),
    _=Depends(get_current_admin),
):
    result = await db.execute(select(Product).where(Product.id == product_id))
    product = result.scalar_one_or_none()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    await db.delete(product)


@router.post("/{product_id}/images")
async def upload_product_image(
    product_id: int,
    file: UploadFile = File(...),
    is_primary: bool = False,
    db: AsyncSession = Depends(get_db),
    _=Depends(get_current_admin),
):
    url = await save_upload(file, folder="products")
    image = ProductImage(
        product_id=product_id, url=url,
        alt_text=file.filename, is_primary=is_primary
    )
    db.add(image)
    await db.flush()
    return {"url": url, "id": image.id}


@router.delete("/{product_id}/images/{image_id}", status_code=204)
async def delete_product_image(
    product_id: int,
    image_id: int,
    db: AsyncSession = Depends(get_db),
    _=Depends(get_current_admin),
):
    result = await db.execute(
        select(ProductImage).where(
            ProductImage.id == image_id,
            ProductImage.product_id == product_id
        )
    )
    image = result.scalar_one_or_none()
    if not image:
        raise HTTPException(status_code=404, detail="Image not found")
    
    await db.delete(image)
    return None


@router.patch("/{product_id}/images/{image_id}/primary")
async def set_primary_image(
    product_id: int,
    image_id: int,
    db: AsyncSession = Depends(get_db),
    _=Depends(get_current_admin),
):
    # Unset all other primary images for this product
    await db.execute(
        ProductImage.__table__.update()
        .where(ProductImage.product_id == product_id)
        .values(is_primary=False)
    )
    
    result = await db.execute(
        select(ProductImage).where(
            ProductImage.id == image_id,
            ProductImage.product_id == product_id
        )
    )
    image = result.scalar_one_or_none()
    if not image:
        raise HTTPException(status_code=404, detail="Image not found")
    
    image.is_primary = True
    return {"success": True}


@router.patch("/{product_id}/variants/{variant_id}/stock")
async def update_stock(
    product_id: int,
    variant_id: int,
    stock: int,
    db: AsyncSession = Depends(get_db),
    _=Depends(get_current_admin),
):
    result = await db.execute(
        select(ProductVariant).where(
            ProductVariant.id == variant_id,
            ProductVariant.product_id == product_id
        )
    )
    variant = result.scalar_one_or_none()
    if not variant:
        raise HTTPException(status_code=404, detail="Variant not found")
    variant.stock = stock
    return {"success": True}
