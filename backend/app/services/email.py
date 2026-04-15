import aiosmtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from app.core.config import settings
from loguru import logger


async def _send(to: str, subject: str, html: str):
    if not settings.SMTP_USER:
        logger.warning("SMTP not configured, skipping email")
        return
    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = f"{settings.FROM_NAME} <{settings.FROM_EMAIL}>"
        msg["To"] = to
        msg.attach(MIMEText(html, "html"))
        await aiosmtplib.send(
            msg,
            hostname=settings.SMTP_HOST,
            port=settings.SMTP_PORT,
            username=settings.SMTP_USER,
            password=settings.SMTP_PASSWORD,
            start_tls=True,
        )
        logger.info(f"Email sent to {to}: {subject}")
    except Exception as e:
        logger.error(f"Email send failed: {e}")


async def send_welcome_email(email: str, name: str):
    html = f"""
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
      <h1 style="color:#111">Welcome to Ashtrix Tees, {name}!</h1>
      <p>Your account is ready. Start shopping the freshest fits.</p>
      <a href="{settings.FRONTEND_URL}/shop"
         style="background:#111;color:#fff;padding:12px 24px;text-decoration:none;display:inline-block;border-radius:4px">
        Shop Now
      </a>
    </div>
    """
    await _send(email, f"Welcome to Ashtrix Tees, {name}!", html)


async def send_order_confirmation(email: str, name: str, order_number: str, total: float):
    html = f"""
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
      <h1 style="color:#111">Order Confirmed! 🎉</h1>
      <p>Hey {name}, your order <strong>#{order_number}</strong> has been confirmed.</p>
      <p>Total: <strong>₹{total:.2f}</strong></p>
      <p>We'll notify you when it ships.</p>
      <a href="{settings.FRONTEND_URL}/orders"
         style="background:#111;color:#fff;padding:12px 24px;text-decoration:none;display:inline-block;border-radius:4px">
        View Order
      </a>
    </div>
    """
    await _send(email, f"Order #{order_number} Confirmed – Ashtrix Tees", html)
