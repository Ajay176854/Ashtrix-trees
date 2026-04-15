"""
Automated test for the COD order flow.
Run with: .\\venv311\\Scripts\\python.exe test_cod_flow.py

Requirements: pip install httpx
The backend must be running at http://localhost:8000
"""
import asyncio
import sys
import httpx

BASE = "http://localhost:8000/api"
TEST_EMAIL = "cod_test_auto@example.com"
TEST_PASS = "testpass123"

IDEM_KEY = "test-idem-key-abc123"


async def main():
    async with httpx.AsyncClient(timeout=30) as client:

        # ── 1. Register or login ──────────────────────────────
        print("\n[1] Registering test user…")
        r = await client.post(f"{BASE}/auth/register", json={
            "name": "COD Test User", "email": TEST_EMAIL,
            "password": TEST_PASS, "phone": "9000000001"
        })
        if r.status_code == 201:
            print("   Registered.")
        elif r.status_code == 400:
            print("   Already exists, logging in…")
        else:
            print(f"   Unexpected status {r.status_code}: {r.text}")

        print("[1] Logging in…")
        r = await client.post(f"{BASE}/auth/login", json={
            "email": TEST_EMAIL, "password": TEST_PASS
        })
        assert r.status_code == 200, f"Login failed: {r.text}"
        token = r.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        print("   Logged in OK.")

        # ── 2. Get a valid product + variant ─────────────────
        print("\n[2] Fetching products…")
        r = await client.get(f"{BASE}/products", params={"page": 1, "per_page": 10})
        assert r.status_code == 200
        products = r.json().get("items", [])
        assert products, "No products found — please seed the DB first."
        product = None
        variant = None
        for p in products:
            for v in p.get("variants", []):
                if v["stock"] > 0:
                    product = p
                    variant = v
                    break
            if product:
                break
        assert product and variant, "No in-stock product variant found — please ensure stock > 0 in DB."
        print(f"   Using: {product['name']} size={variant['size']} stock={variant['stock']}")

        order_payload = {
            "items": [{"product_id": product["id"], "size": variant["size"], "quantity": 1}],
            "address": {
                "name": "COD Test", "email": TEST_EMAIL, "phone": "9000000001",
                "address": "12 Test Street", "city": "Thiruvarur",
                "state": "Tamil Nadu", "pincode": "610001", "country": "India"
            },
            "idempotency_key": IDEM_KEY,
        }

        # ── 3. Create order ───────────────────────────────────
        print("\n[3] Creating order…")
        r = await client.post(f"{BASE}/orders", json=order_payload, headers=headers)
        assert r.status_code == 201, f"Create order failed: {r.text}"
        order_data = r.json()
        order_id = order_data["order_id"]
        order_number = order_data["order_number"]
        key_id = order_data.get("key_id", "")
        print(f"   Order created: {order_number} (id={order_id})")
        print(f"   key_id={repr(key_id)} → {'Razorpay' if key_id else 'COD'} flow")
        assert not key_id, "Expected COD flow (no Razorpay key configured)"

        # ── 4. Confirm via COD ────────────────────────────────
        print("\n[4] Confirming COD…")
        r = await client.post(f"{BASE}/orders/{order_id}/confirm-cod", headers=headers)
        assert r.status_code == 200, f"COD confirm failed: {r.text}"
        result = r.json()
        assert result["success"] is True
        assert result["order_number"] == order_number
        print(f"   Confirmed: {result}")

        # ── 5. Idempotent re-confirm (should still succeed) ───
        print("\n[5] Re-confirming COD (idempotency test)…")
        r = await client.post(f"{BASE}/orders/{order_id}/confirm-cod", headers=headers)
        assert r.status_code == 200, f"Re-confirm failed: {r.text}"
        assert r.json()["success"] is True
        print("   Re-confirm returned success (idempotent) ✓")

        # ── 6. Duplicate create with same idempotency key ─────
        print("\n[6] Sending duplicate order with same idempotency key…")
        r = await client.post(f"{BASE}/orders", json=order_payload, headers=headers)
        assert r.status_code == 201, f"Idempotency re-create failed: {r.text}"
        dup_data = r.json()
        assert dup_data["order_id"] == order_id, (
            f"Expected same order_id={order_id}, got {dup_data['order_id']} "
            f"(duplicate order was created!)"
        )
        print(f"   Got same order_id={order_id} ✓ (no duplicate created)")

        # ── 7. Check order status via user orders list ────────
        print("\n[7] Verifying order status…")
        r = await client.get(f"{BASE}/orders/my", headers=headers)
        assert r.status_code == 200
        orders = r.json()
        our = next((o for o in orders if o["id"] == order_id), None)
        assert our, "Order not found in user order list"
        assert our["status"] == "confirmed", f"Expected confirmed, got {our['status']}"
        print(f"   Status: {our['status']} ✓")

        print("\n✅ ALL TESTS PASSED — COD order flow is working correctly.\n")


if __name__ == "__main__":
    if sys.platform == "win32":
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    asyncio.run(main())
