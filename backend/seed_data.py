#!/usr/bin/env python3
"""
Ashtrix Tees - Dummy Data Generator
Generates 300+ products with realistic data
Run: python seed_data.py
"""
import pymysql
import random
import re
from datetime import datetime, timedelta

# ─── Config ──────────────────────────────────────────────────
DB = dict(host="localhost", user="root", password="ajai2004", database="ashtrix_tees")

CATEGORY_IDS = {
    "Oversized": 1,
    "Printed": 2,
    "Plain": 3,
    "Acid Wash": 4,
    "Polo": 5,
    "Crop": 6,
}

ADJECTIVES = [
    "Vintage", "Retro", "Classic", "Urban", "Street", "Minimal",
    "Bold", "Chill", "Raw", "Aesthetic", "Clean", "Fresh", "Dark",
    "Pastel", "Monochrome", "Grunge", "Indie", "Boho", "Elite",
    "Premium", "Essential", "Core", "Washed", "Faded",
]

NOUNS = [
    "Vibe", "Flow", "Wave", "Drift", "Gaze", "Edge", "Era",
    "Mode", "Shift", "Pulse", "Haze", "Echo", "Dawn", "Dusk",
    "Noir", "Bloom", "Storm", "Calm", "Rush", "Glitch",
    "Vision", "Verse", "Code", "Arc", "Flux",
]

COLORS = [
    "Black", "White", "Charcoal", "Sage", "Cream", "Navy",
    "Olive", "Rust", "Teal", "Lavender", "Burgundy", "Slate",
    "Mocha", "Stone", "Forest", "Cobalt", "Mauve", "Sand",
]

GRAPHICS = [
    "Graffiti", "Anime", "Abstract", "Geometric", "Floral",
    "Skull", "Tiger", "Dragon", "Moon", "Sun", "Wave",
    "Typography", "Celestial", "Retro", "Y2K", "Psychedelic",
]

DESCRIPTIONS = [
    "Premium 240 GSM cotton. Drop-shoulder fit. Ribbed crew neck. Perfect for everyday wear.",
    "Heavyweight 260 GSM fabric. Relaxed fit. Side-seam stitched. Designed for the streets.",
    "Super soft 100% combed cotton. Boxy silhouette. Minimal branding. Maximum comfort.",
    "Enzyme-washed for a lived-in feel. Oversized fit. Pre-shrunk cotton. Built to last.",
    "Air-jet spun yarn for ultra-softness. Double-needle stitching. True to size.",
    "Garment-dyed for a unique look. Terry cotton interior. Bold graphic placement.",
    "200 GSM combed cotton. Slim drop shoulder. Ribbed collar. Timeless piece.",
    "Heavyweight streetwear staple. Washed finish. Set-in sleeves. Clean aesthetic.",
]


def slugify(text: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")


def gen_products(n=300):
    products = []
    slugs_seen = set()

    for i in range(n):
        cat_name = random.choice(list(CATEGORY_IDS.keys()))
        cat_id = CATEGORY_IDS[cat_name]

        if cat_name == "Printed":
            color = random.choice(COLORS)
            graphic = random.choice(GRAPHICS)
            adj = random.choice(ADJECTIVES)
            name = f"{adj} {graphic} Print Tee"
        elif cat_name == "Oversized":
            adj = random.choice(ADJECTIVES)
            noun = random.choice(NOUNS)
            name = f"{adj} {noun} Oversized Tee"
        elif cat_name == "Plain":
            color = random.choice(COLORS)
            name = f"{color} Essential Tee"
        elif cat_name == "Acid Wash":
            adj = random.choice(ADJECTIVES)
            color = random.choice(COLORS)
            name = f"{adj} Acid Wash {color} Tee"
        elif cat_name == "Polo":
            adj = random.choice(ADJECTIVES)
            color = random.choice(COLORS)
            name = f"{adj} {color} Polo"
        else:  # Crop
            adj = random.choice(ADJECTIVES)
            noun = random.choice(NOUNS)
            name = f"{adj} {noun} Crop Tee"

        slug = slugify(name)
        counter = 1
        original = slug
        while slug in slugs_seen:
            slug = f"{original}-{counter}"
            counter += 1
        slugs_seen.add(slug)

        price = random.choice([299, 349, 399, 449, 499, 549, 599, 649, 699, 749])
        compare = price + random.choice([100, 150, 200, 250])
        sku = f"AT-{i+1000:04d}"

        products.append({
            "category_id": cat_id,
            "name": name,
            "slug": slug,
            "description": random.choice(DESCRIPTIONS),
            "price": price,
            "compare_price": compare,
            "cost_price": int(price * 0.4),
            "sku": sku,
            "is_active": 1,
            "is_featured": 1 if random.random() < 0.15 else 0,
            "meta_title": f"Buy {name} Online – Ashtrix Tees",
            "meta_description": f"Shop {name} at Ashtrix Tees. Premium quality, best price. Free shipping above ₹499.",
        })

    return products


PLACEHOLDER_IMAGES = [
    "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600",
    "https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=600",
    "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600",
    "https://images.unsplash.com/photo-1527719327859-c6ce80353573?w=600",
    "https://images.unsplash.com/photo-1562157873-818bc0726f68?w=600",
    "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600",
    "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=600",
    "https://images.unsplash.com/photo-1622445275463-afa2ab738c34?w=600",
]


def main():
    conn = pymysql.connect(**DB, charset="utf8mb4", cursorclass=pymysql.cursors.DictCursor)
    cur = conn.cursor()

    print("Seeding admin user...")
    import bcrypt
    hashed = bcrypt.hashpw(b"Admin@123", bcrypt.gensalt()).decode()
    cur.execute(
        "INSERT IGNORE INTO users (name, email, password, role, is_active, email_verified) "
        "VALUES (%s, %s, %s, 'admin', 1, 1)",
        ("Admin", "admin@ashtrixtees.com", hashed),
    )

    print("Seeding coupons...")
    coupons = [
        ("WELCOME10", "percentage", 10, 0, 100, None, None),
        ("FLAT50", "fixed", 50, 299, None, None, None),
        ("SAVE20", "percentage", 20, 499, 200, 500, None),
        ("FIRST15", "percentage", 15, 0, 150, 100, None),
    ]
    for code, ctype, val, min_ord, max_disc, limit, exp in coupons:
        cur.execute(
            "INSERT IGNORE INTO coupons (code, type, value, min_order, max_discount, usage_limit, is_active) "
            "VALUES (%s, %s, %s, %s, %s, %s, 1)",
            (code, ctype, val, min_ord, max_disc, limit),
        )

    print("Seeding banners...")
    banners = [
        ("NEW DROP ✦ SS25", "Shop the freshest fits now", PLACEHOLDER_IMAGES[0], "/shop", 1),
        ("FREE SHIPPING", "On orders above ₹499", PLACEHOLDER_IMAGES[2], "/shop", 2),
        ("OVERSIZED EDIT", "Drop-shoulder essentials", PLACEHOLDER_IMAGES[3], "/shop?category=oversized", 3),
    ]
    for title, subtitle, img, link, sort in banners:
        cur.execute(
            "INSERT IGNORE INTO banners (title, subtitle, image, link, sort_order, is_active) "
            "VALUES (%s, %s, %s, %s, %s, 1)",
            (title, subtitle, img, link, sort),
        )

    print("Generating 300 products...")
    products = gen_products(300)

    for p in products:
        cur.execute(
            """INSERT IGNORE INTO products
            (category_id, name, slug, description, price, compare_price, cost_price,
             sku, is_active, is_featured, meta_title, meta_description)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)""",
            (
                p["category_id"], p["name"], p["slug"], p["description"],
                p["price"], p["compare_price"], p["cost_price"],
                p["sku"], p["is_active"], p["is_featured"],
                p["meta_title"], p["meta_description"],
            ),
        )
        product_id = cur.lastrowid
        if not product_id:
            continue

        # Product image
        img_url = random.choice(PLACEHOLDER_IMAGES)
        cur.execute(
            "INSERT INTO product_images (product_id, url, alt_text, is_primary) VALUES (%s, %s, %s, 1)",
            (product_id, img_url, p["name"]),
        )

        # Variants with realistic stock
        for size in ["XS", "S", "M", "L", "XL", "XXL"]:
            stock = random.randint(0, 50)
            cur.execute(
                "INSERT INTO product_variants (product_id, size, stock) VALUES (%s, %s, %s)",
                (product_id, size, stock),
            )

    conn.commit()
    cur.close()
    conn.close()
    print(f"✅ Seeded {len(products)} products, coupons, banners, and admin user!")
    print("   Admin login: admin@ashtrixtees.com / Admin@123")


if __name__ == "__main__":
    main()
