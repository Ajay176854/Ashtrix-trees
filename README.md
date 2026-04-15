# 🧢 ASHTRIX TEES — Full-Stack eCommerce
> Premium T-shirt store · FastAPI + React + MySQL + Razorpay

---

## 📁 Project Structure

```
ashtrix-tees/
├── backend/
│   ├── app/
│   │   ├── api/routes/        # auth, products, orders, categories, misc
│   │   ├── core/              # config, security (JWT)
│   │   ├── db/                # session, async engine
│   │   ├── models/            # SQLAlchemy ORM models
│   │   ├── schemas/           # Pydantic schemas
│   │   ├── services/          # email, storage (local/S3)
│   │   └── main.py            # FastAPI app + middleware
│   ├── schema.sql             # Full MySQL schema
│   ├── seed_data.py           # 300+ product generator
│   ├── requirements.txt
│   └── .env.example
│
└── frontend/
    ├── src/
    │   ├── assets/styles/     # Global CSS + Tailwind
    │   ├── components/
    │   │   ├── layout/        # Navbar, Footer, AnnouncementBar
    │   │   └── product/       # ProductCard
    │   ├── pages/             # All user & admin pages
    │   ├── store/             # Zustand (auth, cart, wishlist)
    │   └── utils/             # Axios API client
    ├── index.html
    ├── vite.config.js
    └── tailwind.config.js
```

---

## ⚙️ Prerequisites

| Tool | Version |
|------|---------|
| Python | 3.10+ |
| Node.js | 18+ |
| MySQL | 8.0+ |
| Razorpay Account | Test mode keys |

---

## 🚀 Setup Instructions

### Step 1 — Clone & navigate

```bash
git clone https://github.com/yourname/ashtrix-tees.git
cd ashtrix-tees
```

---

### Step 2 — MySQL Database

```bash
mysql -u root -p
```

```sql
CREATE DATABASE ashtrix_tees CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;
```

```bash
mysql -u root -p ashtrix_tees < backend/schema.sql
```

---

### Step 3 — Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate        # Linux/Mac
# or: venv\Scripts\activate     # Windows

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
nano .env   # Fill in DB password, Razorpay keys, SMTP
```

**Minimum required `.env` values:**
```env
DB_PASSWORD=your_mysql_root_password
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_secret_here
SECRET_KEY=any-long-random-string-here
```

```bash
# Seed database with 300 products + admin user
python seed_data.py

# Start API server
uvicorn app.main:app --reload --port 8000
```

API docs available at: http://localhost:8000/api/docs

---

### Step 4 — Frontend Setup

```bash
cd ../frontend

# Install dependencies
npm install

# Create env file (optional, proxy already set in vite.config.js)
echo "VITE_APP_NAME=AshtrixTees" > .env

# Start dev server
npm run dev
```

Frontend runs at: http://localhost:5173

---

### Step 5 — First Login

Default admin credentials (created by seed_data.py):
- **Email:** admin@ashtrixtees.com
- **Password:** Admin@123

Go to: http://localhost:5173/login → redirects to admin panel

---

## 💳 Razorpay Integration

### Get Test Keys
1. Sign up at https://razorpay.com
2. Go to **Settings → API Keys → Generate Test Key**
3. Copy Key ID and Key Secret into `.env`

### Payment Flow
```
User Checkout
    ↓
POST /api/orders              ← creates order + razorpay order
    ↓
Razorpay Checkout Modal opens  ← user enters UPI/card
    ↓
POST /api/orders/verify-payment ← HMAC signature verified
    ↓
Order status → "confirmed"
    ↓
Email confirmation sent (background task)
```

### Test Cards
| Card | Number | Expiry | CVV |
|------|--------|--------|-----|
| Visa | 4111 1111 1111 1111 | Any future | Any |
| UPI (test) | success@razorpay | — | — |

---

## 📦 Bulk Product Import (CSV)

Upload via Admin → Products → CSV Import

**Required CSV columns:**
```csv
name,category_id,price,compare_price,description,sku,s_stock,m_stock,l_stock,xl_stock
Vintage Wave Oversized Tee,1,499,699,Premium 240GSM cotton,AT-0001,10,15,12,8
Urban Drift Printed Tee,2,399,599,,AT-0002,5,10,10,5
```

---

## 🌐 Production Deployment

### Backend (Ubuntu + Nginx)

```bash
# Install gunicorn
pip install gunicorn

# Run with gunicorn
gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000

# Nginx config
server {
    listen 80;
    server_name api.yourdomain.com;
    
    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
    
    location /uploads/ {
        alias /path/to/backend/uploads/;
        expires 30d;
    }
}
```

### Frontend (Vercel / Netlify)

```bash
# Build for production
cd frontend
npm run build

# Output in dist/ — deploy to Vercel/Netlify
# Set env variable: VITE_API_URL=https://api.yourdomain.com
```

Update `vite.config.js` proxy target OR use full API URL in production.

---

## 🔧 Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `DB_PASSWORD` | ✅ | MySQL password |
| `SECRET_KEY` | ✅ | JWT signing key (min 32 chars) |
| `RAZORPAY_KEY_ID` | ✅ | Razorpay test/live key |
| `RAZORPAY_KEY_SECRET` | ✅ | Razorpay secret |
| `SMTP_USER` | Optional | Gmail for order emails |
| `SMTP_PASSWORD` | Optional | Gmail app password |
| `STORAGE_TYPE` | Optional | `local` or `s3` |
| `AWS_ACCESS_KEY_ID` | If S3 | AWS credentials |

---

## 🗺️ API Endpoints Reference

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | — | Register |
| POST | `/api/auth/login` | — | Login |
| GET | `/api/products` | — | List products (filterable) |
| GET | `/api/products/:slug` | — | Product detail |
| GET | `/api/categories` | — | All categories |
| POST | `/api/orders` | User | Create order |
| POST | `/api/orders/verify-payment` | User | Verify Razorpay |
| GET | `/api/orders/my` | User | Order history |
| POST | `/api/coupons/validate` | User | Validate coupon |
| GET | `/api/admin/analytics` | Admin | Dashboard data |
| GET | `/api/orders` | Admin | All orders |
| PATCH | `/api/orders/:id/status` | Admin | Update status |
| POST | `/api/products` | Admin | Create product |
| PUT | `/api/products/:id` | Admin | Update product |
| DELETE | `/api/products/:id` | Admin | Delete product |
| POST | `/api/categories/products/bulk-upload` | Admin | CSV import |

Full interactive docs: http://localhost:8000/api/docs

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18 + Vite + Tailwind CSS |
| State | Zustand + React Query |
| Backend | Python FastAPI + Uvicorn |
| Database | MySQL 8 + SQLAlchemy (async) |
| Auth | JWT (HS256) via python-jose |
| Payments | Razorpay |
| Email | aiosmtplib (Gmail SMTP) |
| Storage | Local filesystem / AWS S3 |
| Validation | Pydantic v2 + Zod |

---

## 🔑 Default Coupon Codes (seeded)

| Code | Discount |
|------|----------|
| `WELCOME10` | 10% off |
| `FLAT50` | ₹50 off (min ₹299) |
| `SAVE20` | 20% off (min ₹499, max ₹200) |
| `FIRST15` | 15% off |

---

## 📸 Features Summary

**User Side:**
- Gen-Z brand landing page with marquee + hero
- Product grid (300+ products, pagination, lazy loading)
- Category filters, search, sort
- Product detail with image gallery, size selection, reviews
- Persistent cart (Zustand + localStorage)
- Wishlist (local + server sync)
- Razorpay checkout with UPI/Card/Net Banking
- Order history with status tracking
- Coupon system
- JWT auth (register/login/refresh)

**Admin Panel:**
- Dashboard with revenue, orders, user analytics
- Full CRUD for products + bulk CSV import
- Image upload per product
- Inventory tracking (stock per size)
- Order management with status updates + tracking numbers
- User management (enable/disable)
- Coupon creation/deletion
- Banner management with image upload
- Review moderation (approve/reject)

---

*Built for Ashtrix Tees — Premium streetwear for the culture 🖤*
