from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from typing import List
from decimal import Decimal
import uuid
import hmac, hashlib

from app.db.session import get_db
from app.models import Order, OrderItem, Payment, Product, ProductVariant, Coupon
from app.schemas import (
    OrderCreate, OrderOut, RazorpayOrderResponse, PaymentVerifyRequest, CodConfirmResponse
)
from app.core.security import get_current_user, get_current_admin
from app.core.config import settings
from app.services.email import send_order_confirmation
import razorpay
from loguru import logger

router = APIRouter(prefix="/orders", tags=["orders"])

rzp_client = razorpay.Client(
    auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET)
)


def gen_order_number() -> str:
    return "AT" + uuid.uuid4().hex[:10].upper()


def calculate_shipping(city: str, state: str, subtotal: Decimal, total_quantity: int) -> Decimal:
    """
    Refined distance + weight model:
    - Local/State (TN): ₹45 Base, +₹20 Extra 500g (per 2 items), Free > 599
    - Nearby (KA, KL, AP, etc.): ₹70 Base, +₹25 Extra, Free > 899
    - Mid (MH, GJ, etc.): ₹95 Base, +₹35 Extra, Free > 1199
    - Long (Rest): ₹120 Base, +₹40 Extra, Free > 1499
    """
    import math
    state_l = state.strip().lower()

    if state_l == "tamil nadu":
        base_fee, extra_fee, threshold = 45, 20, 599
    elif state_l in ["karnataka", "kerala", "andhra pradesh", "telangana", "puducherry"]:
        base_fee, extra_fee, threshold = 70, 25, 899
    elif state_l in ["maharashtra", "gujarat", "goa", "madhya pradesh", "chhattisgarh", "odisha"]:
        base_fee, extra_fee, threshold = 95, 35, 1199
    else:
        base_fee, extra_fee, threshold = 120, 40, 1499

    if subtotal >= threshold:
        return Decimal("0")

    # 1-2 items = Base. Each additional 2 items = +Extra.
    units = math.ceil(total_quantity / 2)
    shipping = base_fee + (max(0, units - 1) * extra_fee)
    
    return Decimal(str(shipping)).quantize(Decimal("1"))


# ─── CREATE ORDER + RAZORPAY ORDER ───────────────────────────
@router.post("", response_model=RazorpayOrderResponse, status_code=201)
async def create_order(
    body: OrderCreate,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    # Idempotency: if same key already exists for this user, return it
    if body.idempotency_key:
        existing = await db.execute(
            select(Order)
            .where(
                Order.user_id == current_user.id,
                Order.idempotency_key == body.idempotency_key,
                Order.status.in_(["pending", "confirmed"]),
            )
        )
        existing_order = existing.scalar_one_or_none()
        if existing_order:
            # Fetch existing payment to reconstruct response
            p_res = await db.execute(
                select(Payment).where(Payment.order_id == existing_order.id)
            )
            existing_payment = p_res.scalar_one_or_none()
            rzp_id = existing_payment.razorpay_order_id if existing_payment else f"mock_order_{uuid.uuid4().hex[:10]}"
            amount_paise = int(existing_order.total * 100)
            logger.info(f"Idempotency hit: returning existing order {existing_order.order_number}")
            return RazorpayOrderResponse(
                razorpay_order_id=rzp_id,
                amount=amount_paise,
                currency="INR",
                order_id=existing_order.id,
                order_number=existing_order.order_number,
                key_id=settings.RAZORPAY_KEY_ID,
            )

    # Validate items & compute subtotal
    subtotal = Decimal("0")
    items_data = []

    for item in body.items:
        result = await db.execute(
            select(Product)
            .options(selectinload(Product.images), selectinload(Product.variants))
            .where(Product.id == item.product_id, Product.is_active == True)
        )
        product = result.scalar_one_or_none()
        if not product:
            raise HTTPException(status_code=404, detail=f"Product {item.product_id} not found")

        variant = next((v for v in product.variants if v.size == item.size), None)
        if not variant or variant.stock < item.quantity:
            raise HTTPException(
                status_code=400,
                detail=f"Insufficient stock for {product.name} size {item.size}",
            )

        primary_img = next((i.url for i in product.images if i.is_primary), None)
        total_price = product.price * item.quantity
        subtotal += total_price
        items_data.append({
            "product": product,
            "variant": variant,
            "size": item.size,
            "quantity": item.quantity,
            "unit_price": product.price,
            "total_price": total_price,
            "primary_img": primary_img,
        })

    # Coupon
    discount = Decimal("0")
    coupon_obj = None
    if body.coupon_code:
        c_result = await db.execute(
            select(Coupon).where(Coupon.code == body.coupon_code, Coupon.is_active == True)
        )
        coupon_obj = c_result.scalar_one_or_none()
        if coupon_obj:
            if subtotal >= coupon_obj.min_order:
                if coupon_obj.type == "percentage":
                    discount = subtotal * coupon_obj.value / 100
                else:
                    discount = coupon_obj.value
                if coupon_obj.max_discount:
                    discount = min(discount, coupon_obj.max_discount)

    # Calculate Regional Shipping
    total_qty = sum(item.quantity for item in body.items)
    shipping = calculate_shipping(
        city=body.address.city,
        state=body.address.state,
        subtotal=subtotal,
        total_quantity=total_qty
    )
        
    total = subtotal - discount + shipping

    # Create DB order
    order = Order(
        user_id=current_user.id,
        order_number=gen_order_number(),
        subtotal=subtotal, discount=discount,
        shipping=shipping, total=total,
        coupon_id=coupon_obj.id if coupon_obj else None,
        coupon_code=body.coupon_code,
        ship_name=body.address.name,
        ship_email=body.address.email,
        ship_phone=body.address.phone,
        ship_address=body.address.address,
        ship_city=body.address.city,
        ship_state=body.address.state,
        ship_pincode=body.address.pincode,
        ship_country=body.address.country,
        notes=body.notes,
        idempotency_key=body.idempotency_key,
    )
    db.add(order)
    await db.flush()

    # Order items + deduct stock
    for d in items_data:
        db.add(OrderItem(
            order_id=order.id,
            product_id=d["product"].id,
            product_name=d["product"].name,
            product_image=d["primary_img"],
            size=d["size"], quantity=d["quantity"],
            unit_price=d["unit_price"], total_price=d["total_price"],
        ))
        d["variant"].stock -= d["quantity"]

    if coupon_obj:
        coupon_obj.usage_count += 1

    # Razorpay order
    amount_paise = int(total * 100)
    rzp_order_id = f"mock_order_{uuid.uuid4().hex[:10]}"
    
    if settings.RAZORPAY_KEY_ID and settings.RAZORPAY_KEY_SECRET:
        try:
            rzp_order = rzp_client.order.create({
                "amount": amount_paise,
                "currency": "INR",
                "receipt": order.order_number,
            })
            rzp_order_id = rzp_order["id"]
        except Exception as e:
            if settings.APP_ENV != "development":
                raise HTTPException(status_code=502, detail=f"Payment gateway error: {str(e)}")
            logger.warning(f"Razorpay error in dev: {e}. Using mock order id.")
    else:
        if settings.APP_ENV != "development":
            raise HTTPException(status_code=502, detail="Razorpay keys not configured")
        logger.info("Using mock Razorpay order ID for development.")

    order.status = "pending"
    db.add(Payment(
        order_id=order.id,
        razorpay_order_id=rzp_order_id,
        amount=total,
        status="created"
    ))
    await db.flush()


    return RazorpayOrderResponse(
        razorpay_order_id=rzp_order_id,
        amount=amount_paise,
        currency="INR",
        order_id=order.id,
        order_number=order.order_number,
        key_id=settings.RAZORPAY_KEY_ID,
    )


# ─── VERIFY PAYMENT ──────────────────────────────────────────
@router.post("/verify-payment")
async def verify_payment(
    body: PaymentVerifyRequest,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    # Signature check
    msg = f"{body.razorpay_order_id}|{body.razorpay_payment_id}"
    expected = hmac.HMAC(
        settings.RAZORPAY_KEY_SECRET.encode(),
        msg.encode(),
        hashlib.sha256,
    ).hexdigest()

    if expected != body.razorpay_signature:
        if settings.APP_ENV == "development" and body.razorpay_signature == "mock_signature":
            pass
        else:
            raise HTTPException(status_code=400, detail="Payment verification failed")

    # Update payment
    p_result = await db.execute(
        select(Payment).where(Payment.razorpay_order_id == body.razorpay_order_id)
    )
    payment = p_result.scalar_one_or_none()
    if not payment:
        raise HTTPException(status_code=404, detail="Payment record not found")

    if payment.status == "paid":
        # Already processed (maybe via webhook)
        o_result = await db.execute(select(Order).where(Order.id == payment.order_id))
        order = o_result.scalar_one_or_none()
        return {"success": True, "order_number": order.order_number if order else "UNKNOWN"}

    payment.razorpay_payment_id = body.razorpay_payment_id
    payment.razorpay_signature = body.razorpay_signature
    payment.status = "paid"

    o_result = await db.execute(
        select(Order)
        .options(selectinload(Order.items))
        .where(Order.id == body.order_id)
    )
    order = o_result.scalar_one_or_none()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
        
    if order.status != "confirmed":
        order.status = "confirmed"
        background_tasks.add_task(
            send_order_confirmation, order.ship_email, order.ship_name,
            order.order_number, float(order.total)
        )

    return {"success": True, "order_number": order.order_number}


# ─── CONFIRM COD (Cash on Delivery) ──────────────────────────
@router.post("/{order_id}/confirm-cod", response_model=CodConfirmResponse)
async def confirm_cod(
    order_id: int,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Confirm an order as Cash on Delivery (no payment gateway required).
    Used when RAZORPAY_KEY_ID is not configured. Idempotent — safely callable
    multiple times; returns success if already confirmed."""

    result = await db.execute(
        select(Order)
        .options(selectinload(Order.items))
        .where(Order.id == order_id, Order.user_id == current_user.id)
    )
    order = result.scalar_one_or_none()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    # Already confirmed — idempotent success
    if order.status == "confirmed":
        return CodConfirmResponse(success=True, order_number=order.order_number, order_id=order.id)

    # Guard: only pending orders can be confirmed
    if order.status != "pending":
        raise HTTPException(
            status_code=400,
            detail=f"Order cannot be confirmed — current status: {order.status}"
        )

    # Server-side total re-validation (guard against tampered amounts)
    recalculated_subtotal = sum(item.unit_price * item.quantity for item in order.items)
    recalculated_shipping = calculate_shipping(
        city=order.ship_city,
        state=order.ship_state,
        subtotal=recalculated_subtotal,
        total_quantity=sum(i.quantity for i in order.items),
    )
    recalculated_total = recalculated_subtotal - order.discount + recalculated_shipping
    if abs(recalculated_total - order.total) > Decimal("1"):  # allow ₹1 rounding tolerance
        logger.warning(
            f"COD confirm: total mismatch for order {order.order_number}. "
            f"Stored={order.total}, Recalculated={recalculated_total}"
        )
        raise HTTPException(status_code=400, detail="Order total mismatch — please restart checkout")

    # Mark confirmed
    order.status = "confirmed"
    order.payment_method = "cod"

    # Mark/create payment record as cod
    p_result = await db.execute(select(Payment).where(Payment.order_id == order.id))
    payment = p_result.scalar_one_or_none()
    if payment:
        payment.status = "cod"
    else:
        db.add(Payment(
            order_id=order.id,
            razorpay_order_id=f"cod_{order.order_number}",
            amount=order.total,
            status="cod"
        ))

    background_tasks.add_task(
        send_order_confirmation, order.ship_email, order.ship_name,
        order.order_number, float(order.total)
    )

    logger.info(f"COD order confirmed: {order.order_number} for user {current_user.id}")
    return CodConfirmResponse(success=True, order_number=order.order_number, order_id=order.id)


@router.post("/{order_id}/cancel")
async def cancel_order(
    order_id: int,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    result = await db.execute(
        select(Order)
        .options(selectinload(Order.items))
        .where(Order.id == order_id, Order.user_id == current_user.id)
    )
    order = result.scalar_one_or_none()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    if order.status == "pending":
        order.status = "cancelled"
        # Return stock
        for item in order.items:
            v_result = await db.execute(
                select(ProductVariant).where(
                    ProductVariant.product_id == item.product_id,
                    ProductVariant.size == item.size
                )
            )
            variant = v_result.scalar_one_or_none()
            if variant:
                variant.stock += item.quantity
        
        # update payment status if exists
        p_result = await db.execute(
            select(Payment).where(Payment.order_id == order.id)
        )
        payment = p_result.scalar_one_or_none()
        if payment and payment.status == "created":
            payment.status = "failed"
            
        return {"success": True, "message": "Order cancelled and stock released"}
    
    return {"success": False, "message": f"Cannot cancel order in {order.status} status"}


# ─── USER ORDER HISTORY ──────────────────────────────────────
@router.get("/my", response_model=List[OrderOut])
async def my_orders(
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    result = await db.execute(
        select(Order)
        .options(selectinload(Order.items))
        .where(Order.user_id == current_user.id)
        .order_by(Order.created_at.desc())
    )
    return result.scalars().all()


@router.get("/my/{order_id}", response_model=OrderOut)
async def get_my_order(
    order_id: int,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    result = await db.execute(
        select(Order)
        .options(selectinload(Order.items))
        .where(Order.id == order_id, Order.user_id == current_user.id)
    )
    order = result.scalar_one_or_none()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order


# ─── ADMIN ORDER MANAGEMENT ──────────────────────────────────
@router.get("", response_model=List[OrderOut])
async def admin_list_orders(
    db: AsyncSession = Depends(get_db),
    _=Depends(get_current_admin),
    status: str = None,
    page: int = 1,
    per_page: int = 20,
):
    query = select(Order).options(selectinload(Order.items))
    if status:
        query = query.where(Order.status == status)
    query = query.order_by(Order.created_at.desc())
    result = await db.execute(query.offset((page - 1) * per_page).limit(per_page))
    return result.scalars().all()


@router.patch("/{order_id}/status")
async def update_order_status(
    order_id: int,
    status: str,
    tracking_number: str = None,
    db: AsyncSession = Depends(get_db),
    _=Depends(get_current_admin),
):
    result = await db.execute(select(Order).where(Order.id == order_id))
    order = result.scalar_one_or_none()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    order.status = status
    if tracking_number:
        order.tracking_number = tracking_number
    return {"success": True}


# ─── WEBHOOK HANDLER ─────────────────────────────────────────
@router.post("/webhook")
async def razorpay_webhook(
    request: Request,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
):
    body = await request.body()
    signature = request.headers.get("x-razorpay-signature")
    if not signature:
        raise HTTPException(status_code=400, detail="Missing signature")
        
    try:
        rzp_client.utility.verify_webhook_signature(
            body.decode('utf-8'),
            signature,
            settings.RAZORPAY_KEY_SECRET
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail="Invalid signature")

    payload = await request.json()
    event = payload.get("event")
    
    if event == "payment.captured":
        payment_entity = payload["payload"]["payment"]["entity"]
        order_id_rzp = payment_entity.get("order_id")
        
        if order_id_rzp:
            p_result = await db.execute(
                select(Payment).where(Payment.razorpay_order_id == order_id_rzp)
            )
            payment = p_result.scalar_one_or_none()
            if payment and payment.status != "paid":
                payment.razorpay_payment_id = payment_entity.get("id")
                payment.status = "paid"
                
                o_result = await db.execute(
                    select(Order)
                    .options(selectinload(Order.items))
                    .where(Order.id == payment.order_id)
                )
                order = o_result.scalar_one_or_none()
                if order and order.status != "confirmed":
                    order.status = "confirmed"
                    background_tasks.add_task(
                        send_order_confirmation, order.ship_email, order.ship_name,
                        order.order_number, float(order.total)
                    )
                    
    elif event == "payment.failed":
        payment_entity = payload["payload"]["payment"]["entity"]
        order_id_rzp = payment_entity.get("order_id")
        
        if order_id_rzp:
            p_result = await db.execute(
                select(Payment).where(Payment.razorpay_order_id == order_id_rzp)
            )
            payment = p_result.scalar_one_or_none()
            if payment:
                payment.status = "failed"
                
                o_result = await db.execute(
                    select(Order)
                    .options(selectinload(Order.items))
                    .where(Order.id == payment.order_id)
                )
                order = o_result.scalar_one_or_none()
                if order and order.status == "pending":
                    order.status = "failed"
                    # Return stock
                    for item in order.items:
                        v_result = await db.execute(
                            select(ProductVariant).where(
                                ProductVariant.product_id == item.product_id,
                                ProductVariant.size == item.size
                            )
                        )
                        variant = v_result.scalar_one_or_none()
                        if variant:
                            variant.stock += item.quantity

    return {"status": "ok"}

