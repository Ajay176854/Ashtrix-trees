from sqlalchemy import (
    Column, Integer, String, Text, Boolean, DateTime, Enum,
    ForeignKey, DECIMAL, JSON, SmallInteger, UniqueConstraint, Index
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.session import Base
import enum


# ─── ENUMS ───────────────────────────────────────────────────
class UserRole(str, enum.Enum):
    user = "user"
    admin = "admin"

class OrderStatus(str, enum.Enum):
    pending = "pending"
    confirmed = "confirmed"
    processing = "processing"
    shipped = "shipped"
    delivered = "delivered"
    cancelled = "cancelled"
    refunded = "refunded"

class PaymentStatus(str, enum.Enum):
    created = "created"
    attempted = "attempted"
    paid = "paid"
    failed = "failed"
    refunded = "refunded"
    cod = "cod"

class SizeEnum(str, enum.Enum):
    XS = "XS"; S = "S"; M = "M"; L = "L"; XL = "XL"; XXL = "XXL"

class CouponType(str, enum.Enum):
    percentage = "percentage"
    fixed = "fixed"


# ─── USER ────────────────────────────────────────────────────
class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(100), nullable=False)
    email = Column(String(150), nullable=False, unique=True, index=True)
    phone = Column(String(15))
    password = Column(String(255), nullable=False)
    role = Column(Enum(UserRole), default=UserRole.user)
    avatar = Column(String(500))
    is_active = Column(Boolean, default=True)
    email_verified = Column(Boolean, default=False)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    orders = relationship("Order", back_populates="user")
    reviews = relationship("Review", back_populates="user")
    wishlist = relationship("Wishlist", back_populates="user")
    addresses = relationship("Address", back_populates="user")


# ─── CATEGORY ────────────────────────────────────────────────
class Category(Base):
    __tablename__ = "categories"
    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(100), nullable=False)
    slug = Column(String(120), nullable=False, unique=True, index=True)
    description = Column(Text)
    image = Column(String(500))
    is_active = Column(Boolean, default=True)
    sort_order = Column(Integer, default=0)
    created_at = Column(DateTime, server_default=func.now())
    products = relationship("Product", back_populates="category")


# ─── PRODUCT ─────────────────────────────────────────────────
class Product(Base):
    __tablename__ = "products"
    id = Column(Integer, primary_key=True, autoincrement=True)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=False)
    name = Column(String(200), nullable=False)
    slug = Column(String(220), nullable=False, unique=True, index=True)
    description = Column(Text)
    price = Column(DECIMAL(10, 2), nullable=False)
    compare_price = Column(DECIMAL(10, 2))
    cost_price = Column(DECIMAL(10, 2))
    sku = Column(String(100), unique=True)
    is_active = Column(Boolean, default=True, index=True)
    is_featured = Column(Boolean, default=False)
    tags = Column(JSON)
    meta_title = Column(String(200))
    meta_description = Column(String(300))
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    category = relationship("Category", back_populates="products")
    images = relationship("ProductImage", back_populates="product", cascade="all, delete-orphan")
    variants = relationship("ProductVariant", back_populates="product", cascade="all, delete-orphan")
    reviews = relationship("Review", back_populates="product")


class ProductImage(Base):
    __tablename__ = "product_images"
    id = Column(Integer, primary_key=True, autoincrement=True)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="CASCADE"), nullable=False)
    url = Column(String(500), nullable=False)
    alt_text = Column(String(200))
    sort_order = Column(Integer, default=0)
    is_primary = Column(Boolean, default=False)
    product = relationship("Product", back_populates="images")


class ProductVariant(Base):
    __tablename__ = "product_variants"
    id = Column(Integer, primary_key=True, autoincrement=True)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="CASCADE"), nullable=False)
    size = Column(Enum(SizeEnum), nullable=False)
    stock = Column(Integer, default=0)
    product = relationship("Product", back_populates="variants")
    __table_args__ = (UniqueConstraint("product_id", "size"),)


# ─── COUPON ──────────────────────────────────────────────────
class Coupon(Base):
    __tablename__ = "coupons"
    id = Column(Integer, primary_key=True, autoincrement=True)
    code = Column(String(50), nullable=False, unique=True)
    type = Column(Enum(CouponType), nullable=False)
    value = Column(DECIMAL(10, 2), nullable=False)
    min_order = Column(DECIMAL(10, 2), default=0)
    max_discount = Column(DECIMAL(10, 2))
    usage_limit = Column(Integer)
    usage_count = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
    expires_at = Column(DateTime)
    created_at = Column(DateTime, server_default=func.now())


# ─── ORDER ───────────────────────────────────────────────────
class Order(Base):
    __tablename__ = "orders"
    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    order_number = Column(String(30), nullable=False, unique=True, index=True)
    status = Column(Enum(OrderStatus), default=OrderStatus.pending, index=True)
    subtotal = Column(DECIMAL(10, 2), nullable=False)
    discount = Column(DECIMAL(10, 2), default=0)
    shipping = Column(DECIMAL(10, 2), default=0)
    total = Column(DECIMAL(10, 2), nullable=False)
    coupon_id = Column(Integer, ForeignKey("coupons.id"))
    coupon_code = Column(String(50))
    ship_name = Column(String(100), nullable=False)
    ship_email = Column(String(150), nullable=False)
    ship_phone = Column(String(15))
    ship_address = Column(String(300), nullable=False)
    ship_city = Column(String(100), nullable=False)
    ship_state = Column(String(100), nullable=False)
    ship_pincode = Column(String(10), nullable=False)
    ship_country = Column(String(50), default="India")
    notes = Column(Text)
    tracking_number = Column(String(100))
    payment_method = Column(String(20), default="online")  # 'online' or 'cod'
    idempotency_key = Column(String(64), index=True)  # client-generated UUID for dedup
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    user = relationship("User", back_populates="orders")
    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")
    payment = relationship("Payment", back_populates="order", uselist=False)


class OrderItem(Base):
    __tablename__ = "order_items"
    id = Column(Integer, primary_key=True, autoincrement=True)
    order_id = Column(Integer, ForeignKey("orders.id", ondelete="CASCADE"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    product_name = Column(String(200), nullable=False)
    product_image = Column(String(500))
    size = Column(String(10), nullable=False)
    quantity = Column(Integer, nullable=False)
    unit_price = Column(DECIMAL(10, 2), nullable=False)
    total_price = Column(DECIMAL(10, 2), nullable=False)
    order = relationship("Order", back_populates="items")


# ─── PAYMENT ─────────────────────────────────────────────────
class Payment(Base):
    __tablename__ = "payments"
    id = Column(Integer, primary_key=True, autoincrement=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False)
    razorpay_order_id = Column(String(100), index=True)
    razorpay_payment_id = Column(String(100), index=True)
    razorpay_signature = Column(String(200))
    amount = Column(DECIMAL(10, 2), nullable=False)
    currency = Column(String(10), default="INR")
    status = Column(Enum(PaymentStatus), default=PaymentStatus.created)
    method = Column(String(50))
    retry_count = Column(Integer, default=0)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    order = relationship("Order", back_populates="payment")


# ─── REVIEW ──────────────────────────────────────────────────
class Review(Base):
    __tablename__ = "reviews"
    id = Column(Integer, primary_key=True, autoincrement=True)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    rating = Column(SmallInteger, nullable=False)
    title = Column(String(200))
    body = Column(Text)
    is_verified = Column(Boolean, default=False)
    is_approved = Column(Boolean, default=False)
    created_at = Column(DateTime, server_default=func.now())
    __table_args__ = (UniqueConstraint("user_id", "product_id"),)
    product = relationship("Product", back_populates="reviews")
    user = relationship("User", back_populates="reviews")


# ─── BANNER ──────────────────────────────────────────────────
class Banner(Base):
    __tablename__ = "banners"
    id = Column(Integer, primary_key=True, autoincrement=True)
    title = Column(String(200))
    subtitle = Column(String(300))
    image = Column(String(500), nullable=False)
    link = Column(String(500))
    is_active = Column(Boolean, default=True)
    sort_order = Column(Integer, default=0)
    created_at = Column(DateTime, server_default=func.now())


# ─── WISHLIST ────────────────────────────────────────────────
class Wishlist(Base):
    __tablename__ = "wishlists"
    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="CASCADE"), nullable=False)
    created_at = Column(DateTime, server_default=func.now())
    __table_args__ = (UniqueConstraint("user_id", "product_id"),)
    user = relationship("User", back_populates="wishlist")
    product = relationship("Product")


# ─── ADDRESS ─────────────────────────────────────────────────
class Address(Base):
    __tablename__ = "addresses"
    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(100), nullable=False)
    phone = Column(String(15))
    address = Column(String(300), nullable=False)
    city = Column(String(100), nullable=False)
    state = Column(String(100), nullable=False)
    pincode = Column(String(10), nullable=False)
    country = Column(String(50), default="India")
    is_default = Column(Boolean, default=False)
    user = relationship("User", back_populates="addresses")
