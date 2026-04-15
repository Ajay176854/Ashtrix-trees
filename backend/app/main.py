from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse, FileResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from loguru import logger
import os, time

from app.core.config import settings
from app.db.session import init_db
from app.api.routes import auth, products, orders, categories
from app.api.routes.misc import (
    admin_router, coupon_router, banner_router,
    wishlist_router, review_router
)

# ─── RATE LIMITER ────────────────────────────────────────────
limiter = Limiter(key_func=get_remote_address)

app = FastAPI(
    title="Ashtrix Tees API",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# ─── CORS ────────────────────────────────────────────────────


app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.origins,   # 🔥 USE CONFIG
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ─── REQUEST LOGGING ─────────────────────────────────────────
@app.middleware("http")
async def log_requests(request: Request, call_next):
    print("🔥 REQUEST HIT:", request.url)
    start = time.time()
    response = await call_next(request)
    duration = round((time.time() - start) * 1000, 2)
    logger.info(f"{request.method} {request.url.path} → {response.status_code} ({duration}ms)")
    return response

# ─── GLOBAL ERROR HANDLER ────────────────────────────────────
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled error: {exc}", exc_info=True)
    response = JSONResponse(
        status_code=500,
        content={"detail": f"Internal server error: {str(exc)}"},
    )
    # Add CORS headers for error responses
    origin = request.headers.get("origin")
    if origin in settings.origins:
        response.headers["Access-Control-Allow-Origin"] = origin
        response.headers["Access-Control-Allow-Credentials"] = "true"
    return response

# ─── ROUTERS ─────────────────────────────────────────────────
PREFIX = "/api"
app.include_router(auth.router, prefix=PREFIX)
app.include_router(products.router, prefix=PREFIX)
app.include_router(orders.router, prefix=PREFIX)
app.include_router(categories.router, prefix=PREFIX)
app.include_router(admin_router, prefix=PREFIX)
app.include_router(coupon_router, prefix=PREFIX)
app.include_router(banner_router, prefix=PREFIX)
app.include_router(wishlist_router, prefix=PREFIX)
app.include_router(review_router, prefix=PREFIX)

# ─── STATIC FILES ────────────────────────────────────────────
os.makedirs("uploads", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")


# ─── STARTUP ─────────────────────────────────────────────────
@app.on_event("startup")
async def startup():
    logger.info("Starting Ashtrix Tees API...")
    # await init_db()   # uncomment to auto-create tables


@app.get("/api/health")
async def health():
    return {"status": "ok", "app": settings.APP_NAME}

# ─── FRONTEND STATIC FILES ───────────────────────────────────
frontend_dist = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../frontend/dist"))
if os.path.isdir(frontend_dist):
    assets_dir = os.path.join(frontend_dist, "assets")
    if os.path.isdir(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")
    
    @app.get("/{full_path:path}")
    async def serve_frontend(full_path: str):
        if full_path.startswith("api/") or full_path.startswith("uploads/"):
            return JSONResponse(status_code=404, content={"detail": "Not Found"})
            
        requested_file = os.path.join(frontend_dist, full_path)
        if os.path.isfile(requested_file):
            return FileResponse(requested_file)
            
        return FileResponse(os.path.join(frontend_dist, "index.html"))
