-- ============================================================
-- ASHTRIX TEES - Complete Database Schema
-- ============================================================

CREATE DATABASE IF NOT EXISTS ashtrix_tees CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE ashtrix_tees;

-- ============================================================
-- USERS
-- ============================================================
CREATE TABLE users (
    id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,
    email       VARCHAR(150) NOT NULL UNIQUE,
    phone       VARCHAR(15),
    password    VARCHAR(255) NOT NULL,
    role        ENUM('user','admin') DEFAULT 'user',
    avatar      VARCHAR(500),
    is_active   BOOLEAN DEFAULT TRUE,
    email_verified BOOLEAN DEFAULT FALSE,
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_role (role)
);

-- ============================================================
-- CATEGORIES
-- ============================================================
CREATE TABLE categories (
    id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,
    slug        VARCHAR(120) NOT NULL UNIQUE,
    description TEXT,
    image       VARCHAR(500),
    is_active   BOOLEAN DEFAULT TRUE,
    sort_order  INT DEFAULT 0,
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- PRODUCTS
-- ============================================================
CREATE TABLE products (
    id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    category_id     INT UNSIGNED NOT NULL,
    name            VARCHAR(200) NOT NULL,
    slug            VARCHAR(220) NOT NULL UNIQUE,
    description     TEXT,
    price           DECIMAL(10,2) NOT NULL,
    compare_price   DECIMAL(10,2),
    cost_price      DECIMAL(10,2),
    sku             VARCHAR(100) UNIQUE,
    is_active       BOOLEAN DEFAULT TRUE,
    is_featured     BOOLEAN DEFAULT FALSE,
    tags            JSON,
    meta_title      VARCHAR(200),
    meta_description VARCHAR(300),
    created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id),
    INDEX idx_category (category_id),
    INDEX idx_slug (slug),
    INDEX idx_active (is_active),
    FULLTEXT INDEX ft_search (name, description)
);

-- ============================================================
-- PRODUCT IMAGES
-- ============================================================
CREATE TABLE product_images (
    id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    product_id  INT UNSIGNED NOT NULL,
    url         VARCHAR(500) NOT NULL,
    alt_text    VARCHAR(200),
    sort_order  INT DEFAULT 0,
    is_primary  BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- ============================================================
-- PRODUCT VARIANTS (size + stock)
-- ============================================================
CREATE TABLE product_variants (
    id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    product_id  INT UNSIGNED NOT NULL,
    size        ENUM('XS','S','M','L','XL','XXL') NOT NULL,
    stock       INT DEFAULT 0,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    UNIQUE KEY uq_product_size (product_id, size)
);

-- ============================================================
-- COUPONS
-- ============================================================
CREATE TABLE coupons (
    id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    code            VARCHAR(50) NOT NULL UNIQUE,
    type            ENUM('percentage','fixed') NOT NULL,
    value           DECIMAL(10,2) NOT NULL,
    min_order       DECIMAL(10,2) DEFAULT 0,
    max_discount    DECIMAL(10,2),
    usage_limit     INT,
    usage_count     INT DEFAULT 0,
    is_active       BOOLEAN DEFAULT TRUE,
    expires_at      DATETIME,
    created_at      DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- ORDERS
-- ============================================================
CREATE TABLE orders (
    id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id         INT UNSIGNED NOT NULL,
    order_number    VARCHAR(30) NOT NULL UNIQUE,
    status          ENUM('pending','confirmed','processing','shipped','delivered','cancelled','refunded') DEFAULT 'pending',
    subtotal        DECIMAL(10,2) NOT NULL,
    discount        DECIMAL(10,2) DEFAULT 0,
    shipping        DECIMAL(10,2) DEFAULT 0,
    total           DECIMAL(10,2) NOT NULL,
    coupon_id       INT UNSIGNED,
    coupon_code     VARCHAR(50),
    -- Shipping address (denormalized for order history)
    ship_name       VARCHAR(100) NOT NULL,
    ship_email      VARCHAR(150) NOT NULL,
    ship_phone      VARCHAR(15),
    ship_address    VARCHAR(300) NOT NULL,
    ship_city       VARCHAR(100) NOT NULL,
    ship_state      VARCHAR(100) NOT NULL,
    ship_pincode    VARCHAR(10) NOT NULL,
    ship_country    VARCHAR(50) DEFAULT 'India',
    notes           TEXT,
    tracking_number VARCHAR(100),
    created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (coupon_id) REFERENCES coupons(id),
    INDEX idx_user (user_id),
    INDEX idx_status (status),
    INDEX idx_order_number (order_number)
);

-- ============================================================
-- ORDER ITEMS
-- ============================================================
CREATE TABLE order_items (
    id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    order_id        INT UNSIGNED NOT NULL,
    product_id      INT UNSIGNED NOT NULL,
    product_name    VARCHAR(200) NOT NULL,
    product_image   VARCHAR(500),
    size            VARCHAR(10) NOT NULL,
    quantity        INT NOT NULL,
    unit_price      DECIMAL(10,2) NOT NULL,
    total_price     DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id)
);

-- ============================================================
-- PAYMENTS
-- ============================================================
CREATE TABLE payments (
    id                  INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    order_id            INT UNSIGNED NOT NULL,
    razorpay_order_id   VARCHAR(100),
    razorpay_payment_id VARCHAR(100),
    razorpay_signature  VARCHAR(200),
    amount              DECIMAL(10,2) NOT NULL,
    currency            VARCHAR(10) DEFAULT 'INR',
    status              ENUM('created','attempted','paid','failed','refunded') DEFAULT 'created',
    method              VARCHAR(50),
    retry_count         INT DEFAULT 0,
    created_at          DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at          DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id),
    INDEX idx_razorpay_order (razorpay_order_id),
    INDEX idx_razorpay_payment (razorpay_payment_id)
);

-- ============================================================
-- REVIEWS
-- ============================================================
CREATE TABLE reviews (
    id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    product_id  INT UNSIGNED NOT NULL,
    user_id     INT UNSIGNED NOT NULL,
    rating      TINYINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    title       VARCHAR(200),
    body        TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    is_approved BOOLEAN DEFAULT FALSE,
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id),
    UNIQUE KEY uq_user_product (user_id, product_id),
    INDEX idx_product (product_id)
);

-- ============================================================
-- BANNERS
-- ============================================================
CREATE TABLE banners (
    id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    title       VARCHAR(200),
    subtitle    VARCHAR(300),
    image       VARCHAR(500) NOT NULL,
    link        VARCHAR(500),
    is_active   BOOLEAN DEFAULT TRUE,
    sort_order  INT DEFAULT 0,
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- WISHLIST
-- ============================================================
CREATE TABLE wishlists (
    id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id     INT UNSIGNED NOT NULL,
    product_id  INT UNSIGNED NOT NULL,
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    UNIQUE KEY uq_user_product (user_id, product_id)
);

-- ============================================================
-- USER ADDRESSES
-- ============================================================
CREATE TABLE addresses (
    id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id     INT UNSIGNED NOT NULL,
    name        VARCHAR(100) NOT NULL,
    phone       VARCHAR(15),
    address     VARCHAR(300) NOT NULL,
    city        VARCHAR(100) NOT NULL,
    state       VARCHAR(100) NOT NULL,
    pincode     VARCHAR(10) NOT NULL,
    country     VARCHAR(50) DEFAULT 'India',
    is_default  BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================================
-- SEED: Categories
-- ============================================================
INSERT INTO categories (name, slug, description) VALUES
('Oversized', 'oversized', 'Drop-shoulder oversized fit tees'),
('Printed', 'printed', 'Graphic & art printed tees'),
('Plain', 'plain', 'Clean solid color essentials'),
('Acid Wash', 'acid-wash', 'Vintage acid-washed tees'),
('Polo', 'polo', 'Classic polo collar tees'),
('Crop', 'crop', 'Cropped fits for everyone');
