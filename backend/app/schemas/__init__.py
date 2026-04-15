from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional, List
from datetime import datetime
from decimal import Decimal


# ─── AUTH ────────────────────────────────────────────────────
class RegisterRequest(BaseModel):
    name: str
    email: EmailStr
    password: str
    phone: Optional[str] = None

    @field_validator("password")
    @classmethod
    def password_strength(cls, v):
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters")
        return v


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: "UserOut"


class RefreshRequest(BaseModel):
    refresh_token: str


# ─── USER ────────────────────────────────────────────────────
class UserOut(BaseModel):
    id: int
    name: str
    email: str
    phone: Optional[str]
    role: str
    avatar: Optional[str]
    created_at: datetime
    model_config = {"from_attributes": True}


class UserUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    avatar: Optional[str] = None


# ─── CATEGORY ────────────────────────────────────────────────
class CategoryOut(BaseModel):
    id: int
    name: str
    slug: str
    description: Optional[str]
    image: Optional[str]
    is_active: bool
    model_config = {"from_attributes": True}


class CategoryCreate(BaseModel):
    name: str
    slug: str
    description: Optional[str] = None
    image: Optional[str] = None
    sort_order: int = 0


# ─── PRODUCT ─────────────────────────────────────────────────
class ProductImageOut(BaseModel):
    id: int
    url: str
    alt_text: Optional[str]
    is_primary: bool
    model_config = {"from_attributes": True}


class ProductVariantOut(BaseModel):
    id: int
    size: str
    stock: int
    model_config = {"from_attributes": True}


class ProductOut(BaseModel):
    id: int
    name: str
    slug: str
    description: Optional[str]
    price: Decimal
    compare_price: Optional[Decimal]
    is_featured: bool
    is_active: bool
    category: CategoryOut
    images: List[ProductImageOut]
    variants: List[ProductVariantOut]
    avg_rating: Optional[float] = None
    review_count: Optional[int] = 0
    model_config = {"from_attributes": True}


class ProductListOut(BaseModel):
    id: int
    name: str
    slug: str
    price: Decimal
    compare_price: Optional[Decimal]
    is_featured: bool
    is_active: bool
    sku: Optional[str] = None
    category_id: int
    variants: List[ProductVariantOut] = []
    primary_image: Optional[str] = None
    avg_rating: Optional[float] = None
    review_count: Optional[int] = 0
    model_config = {"from_attributes": True}


class ProductCreate(BaseModel):
    category_id: int
    name: str
    description: Optional[str] = None
    price: Decimal
    compare_price: Optional[Decimal] = None
    cost_price: Optional[Decimal] = None
    sku: Optional[str] = None
    is_active: bool = True
    is_featured: bool = False
    tags: Optional[List[str]] = None
    meta_title: Optional[str] = None
    meta_description: Optional[str] = None


class ProductUpdate(ProductCreate):
    category_id: Optional[int] = None
    name: Optional[str] = None
    price: Optional[Decimal] = None


# ─── PAGINATED RESPONSE ──────────────────────────────────────
class PaginatedProducts(BaseModel):
    items: List[ProductListOut]
    total: int
    page: int
    pages: int
    per_page: int


# ─── CART / ORDER ────────────────────────────────────────────
class CartItem(BaseModel):
    product_id: int
    size: str
    quantity: int


class AddressSchema(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str]
    address: str
    city: str
    state: str
    pincode: str
    country: str = "India"


class OrderCreate(BaseModel):
    items: List[CartItem]
    address: AddressSchema
    coupon_code: Optional[str] = None
    notes: Optional[str] = None
    idempotency_key: Optional[str] = None  # UUID generated client-side to prevent duplicate orders


class OrderItemOut(BaseModel):
    id: int
    product_id: int
    product_name: str
    product_image: Optional[str]
    size: str
    quantity: int
    unit_price: Decimal
    total_price: Decimal
    model_config = {"from_attributes": True}


class OrderOut(BaseModel):
    id: int
    order_number: str
    status: str
    subtotal: Decimal
    discount: Decimal
    shipping: Decimal
    total: Decimal
    coupon_code: Optional[str]
    ship_name: str
    ship_email: str
    ship_phone: Optional[str]
    ship_address: str
    ship_city: str
    ship_state: str
    ship_pincode: str
    ship_country: str = "India"
    tracking_number: Optional[str]
    items: List[OrderItemOut]
    created_at: datetime
    model_config = {"from_attributes": True}


# ─── PAYMENT ─────────────────────────────────────────────────
class RazorpayOrderResponse(BaseModel):
    razorpay_order_id: str
    amount: int          # paise
    currency: str
    order_id: int
    order_number: str
    key_id: str


class PaymentVerifyRequest(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str
    order_id: int


class CodConfirmResponse(BaseModel):
    success: bool
    order_number: str
    order_id: int


# ─── REVIEW ──────────────────────────────────────────────────
class ReviewCreate(BaseModel):
    rating: int
    title: Optional[str] = None
    body: Optional[str] = None

    @field_validator("rating")
    @classmethod
    def rating_range(cls, v):
        if not 1 <= v <= 5:
            raise ValueError("Rating must be 1-5")
        return v


class ReviewOut(BaseModel):
    id: int
    rating: int
    title: Optional[str]
    body: Optional[str]
    is_verified: bool
    user: UserOut
    created_at: datetime
    model_config = {"from_attributes": True}


# ─── COUPON ──────────────────────────────────────────────────
class CouponCreate(BaseModel):
    code: str
    type: str
    value: Decimal
    min_order: Decimal = Decimal("0")
    max_discount: Optional[Decimal] = None
    usage_limit: Optional[int] = None
    expires_at: Optional[datetime] = None


class CouponValidate(BaseModel):
    code: str
    order_total: Decimal


class CouponOut(BaseModel):
    id: int
    code: str
    type: str
    value: Decimal
    min_order: Decimal
    max_discount: Optional[Decimal]
    usage_limit: Optional[int]
    usage_count: int
    is_active: bool
    expires_at: Optional[datetime]
    model_config = {"from_attributes": True}


# ─── BANNER ──────────────────────────────────────────────────
class BannerOut(BaseModel):
    id: int
    title: Optional[str]
    subtitle: Optional[str]
    image: str
    link: Optional[str]
    model_config = {"from_attributes": True}


# ─── ADMIN ANALYTICS ─────────────────────────────────────────
class AnalyticsOut(BaseModel):
    total_orders: int
    total_revenue: Decimal
    total_users: int
    total_products: int
    orders_today: int
    revenue_today: Decimal
    recent_orders: List[OrderOut]
