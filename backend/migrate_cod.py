"""One-time migration: add idempotency_key, payment_method to orders; add 'cod' to payments.status enum."""
import asyncio
import sys
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
import os

# Load .env manually
env_path = os.path.join(os.path.dirname(__file__), ".env")
env_vars = {}
if os.path.exists(env_path):
    with open(env_path) as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                k, v = line.split("=", 1)
                env_vars[k.strip()] = v.strip()

DB_HOST = env_vars.get("DB_HOST", "localhost")
DB_PORT = env_vars.get("DB_PORT", "3306")
DB_USER = env_vars.get("DB_USER", "root")
DB_PASSWORD = env_vars.get("DB_PASSWORD", "")
DB_NAME = env_vars.get("DB_NAME", "ashtrix_tees")

DATABASE_URL = f"mysql+aiomysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"


async def migrate():
    engine = create_async_engine(DATABASE_URL, echo=False)
    async with engine.begin() as conn:
        steps = [
            (
                "orders.payment_method",
                "ALTER TABLE orders ADD COLUMN payment_method VARCHAR(20) DEFAULT 'online'"
            ),
            (
                "orders.idempotency_key",
                "ALTER TABLE orders ADD COLUMN idempotency_key VARCHAR(64)"
            ),
            (
                "ix_orders_idempotency_key",
                "CREATE INDEX ix_orders_idempotency_key ON orders(idempotency_key)"
            ),
            (
                "payments.status enum (+cod)",
                "ALTER TABLE payments MODIFY COLUMN status "
                "ENUM('created','attempted','paid','failed','refunded','cod') DEFAULT 'created'"
            ),
        ]
        for name, sql in steps:
            try:
                await conn.execute(text(sql))
                print(f"[OK]   {name}")
            except Exception as e:
                # 1060 = duplicate column, 1061 = duplicate index — expected on re-run
                print(f"[SKIP] {name}: {e}")

    await engine.dispose()
    print("\nMigration complete.")


if __name__ == "__main__":
    if sys.platform == "win32":
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    asyncio.run(migrate())
