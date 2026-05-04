-- ============================================================
-- FARMFRESH DAIRY MARKETPLACE - Oracle PL/SQL Database Schema
-- ============================================================
-- Run this file in Oracle SQL Developer or SQL*Plus
-- ============================================================

SET DEFINE OFF;

-- ─── DROP TABLES (if re-running) ─────────────────────────────────
BEGIN
  EXECUTE IMMEDIATE 'DROP TABLE order_items CASCADE CONSTRAINTS';
  EXECUTE IMMEDIATE 'DROP TABLE orders CASCADE CONSTRAINTS';
  EXECUTE IMMEDIATE 'DROP TABLE cart_items CASCADE CONSTRAINTS';
  EXECUTE IMMEDIATE 'DROP TABLE products CASCADE CONSTRAINTS';
  EXECUTE IMMEDIATE 'DROP TABLE user_addresses CASCADE CONSTRAINTS';
  EXECUTE IMMEDIATE 'DROP TABLE users CASCADE CONSTRAINTS';
  EXECUTE IMMEDIATE 'DROP TABLE categories CASCADE CONSTRAINTS';
  EXECUTE IMMEDIATE 'DROP SEQUENCE seq_users';
  EXECUTE IMMEDIATE 'DROP SEQUENCE seq_products';
  EXECUTE IMMEDIATE 'DROP SEQUENCE seq_orders';
  EXECUTE IMMEDIATE 'DROP SEQUENCE seq_order_items';
  EXECUTE IMMEDIATE 'DROP SEQUENCE seq_cart_items';
  EXECUTE IMMEDIATE 'DROP SEQUENCE seq_addresses';
EXCEPTION
  WHEN OTHERS THEN NULL;
END;
/

-- ─── SEQUENCES ───────────────────────────────────────────────────
CREATE SEQUENCE seq_users       START WITH 1 INCREMENT BY 1 NOCACHE NOCYCLE;
CREATE SEQUENCE seq_products    START WITH 1 INCREMENT BY 1 NOCACHE NOCYCLE;
CREATE SEQUENCE seq_orders      START WITH 1 INCREMENT BY 1 NOCACHE NOCYCLE;
CREATE SEQUENCE seq_order_items START WITH 1 INCREMENT BY 1 NOCACHE NOCYCLE;
CREATE SEQUENCE seq_cart_items  START WITH 1 INCREMENT BY 1 NOCACHE NOCYCLE;
CREATE SEQUENCE seq_addresses   START WITH 1 INCREMENT BY 1 NOCACHE NOCYCLE;

-- ─── CATEGORIES TABLE ────────────────────────────────────────────
CREATE TABLE categories (
  category_id   VARCHAR2(20)  PRIMARY KEY,
  label         VARCHAR2(50)  NOT NULL,
  icon          VARCHAR2(100)
);

-- ─── USERS TABLE ─────────────────────────────────────────────────
-- Stores both customers and farmers (differentiated by role)
CREATE TABLE users (
  user_id             NUMBER        PRIMARY KEY,
  name                VARCHAR2(100) NOT NULL,
  email               VARCHAR2(150) UNIQUE,
  phone               VARCHAR2(20)  UNIQUE NOT NULL,
  password_hash       VARCHAR2(255) NOT NULL,
  role                VARCHAR2(10)  NOT NULL CHECK (role IN ('customer', 'farmer')),
  avatar_url          VARCHAR2(500),
  address             VARCHAR2(500),
  -- Farmer-specific fields
  location            VARCHAR2(200),
  about               VARCHAR2(1000),
  years_of_experience NUMBER(3),
  verified            NUMBER(1)     DEFAULT 0 CHECK (verified IN (0, 1)),
  bank_account        VARCHAR2(100),
  upi_id              VARCHAR2(100),
  rating              NUMBER(3,1)   DEFAULT 0,
  review_count        NUMBER        DEFAULT 0,
  -- Timestamps
  created_at          DATE          DEFAULT SYSDATE,
  updated_at          DATE          DEFAULT SYSDATE,
  is_active           NUMBER(1)     DEFAULT 1 CHECK (is_active IN (0, 1))
);

-- ─── USER ADDRESSES TABLE ─────────────────────────────────────────
CREATE TABLE user_addresses (
  address_id  NUMBER        PRIMARY KEY,
  user_id     NUMBER        NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  label       VARCHAR2(50)  DEFAULT 'Home',
  address     VARCHAR2(500) NOT NULL,
  is_default  NUMBER(1)     DEFAULT 0 CHECK (is_default IN (0, 1)),
  created_at  DATE          DEFAULT SYSDATE
);

-- ─── PRODUCTS TABLE ──────────────────────────────────────────────
CREATE TABLE products (
  product_id    NUMBER          PRIMARY KEY,
  farmer_id     NUMBER          NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  category_id   VARCHAR2(20)    NOT NULL REFERENCES categories(category_id),
  name          VARCHAR2(200)   NOT NULL,
  description   CLOB,
  price         NUMBER(10,2)    NOT NULL CHECK (price > 0),
  unit          VARCHAR2(20)    NOT NULL,
  stock         NUMBER          DEFAULT 0 CHECK (stock >= 0),
  discount      NUMBER(5,2)     DEFAULT 0 CHECK (discount >= 0 AND discount <= 100),
  image_url     VARCHAR2(500),
  featured      NUMBER(1)       DEFAULT 0 CHECK (featured IN (0, 1)),
  rating        NUMBER(3,1)     DEFAULT 0,
  review_count  NUMBER          DEFAULT 0,
  tags          VARCHAR2(500),  -- comma-separated tags
  is_active     NUMBER(1)       DEFAULT 1 CHECK (is_active IN (0, 1)),
  created_at    DATE            DEFAULT SYSDATE,
  updated_at    DATE            DEFAULT SYSDATE
);

-- ─── CART ITEMS TABLE ────────────────────────────────────────────
CREATE TABLE cart_items (
  cart_item_id  NUMBER    PRIMARY KEY,
  user_id       NUMBER    NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  product_id    NUMBER    NOT NULL REFERENCES products(product_id) ON DELETE CASCADE,
  quantity      NUMBER    NOT NULL CHECK (quantity > 0),
  added_at      DATE      DEFAULT SYSDATE,
  CONSTRAINT uq_cart_user_product UNIQUE (user_id, product_id)
);

-- ─── ORDERS TABLE ────────────────────────────────────────────────
CREATE TABLE orders (
  order_id        NUMBER        PRIMARY KEY,
  order_ref       VARCHAR2(20)  UNIQUE NOT NULL,  -- e.g. ORD001
  customer_id     NUMBER        NOT NULL REFERENCES users(user_id),
  farmer_id       NUMBER        REFERENCES users(user_id),
  delivery_address VARCHAR2(500) NOT NULL,
  payment_mode    VARCHAR2(20)  NOT NULL CHECK (payment_mode IN ('cash', 'upi', 'card')),
  special_note    VARCHAR2(500),
  subtotal        NUMBER(10,2)  NOT NULL,
  delivery_charge NUMBER(10,2)  DEFAULT 0,
  grand_total     NUMBER(10,2)  NOT NULL,
  status          VARCHAR2(30)  DEFAULT 'confirmed'
                    CHECK (status IN ('confirmed','packed','out_for_delivery','delivered','cancelled')),
  created_at      DATE          DEFAULT SYSDATE,
  updated_at      DATE          DEFAULT SYSDATE
);

-- ─── ORDER ITEMS TABLE ───────────────────────────────────────────
CREATE TABLE order_items (
  order_item_id NUMBER        PRIMARY KEY,
  order_id      NUMBER        NOT NULL REFERENCES orders(order_id) ON DELETE CASCADE,
  product_id    NUMBER        NOT NULL REFERENCES products(product_id),
  product_name  VARCHAR2(200) NOT NULL,  -- snapshot at time of order
  quantity      NUMBER        NOT NULL CHECK (quantity > 0),
  unit_price    NUMBER(10,2)  NOT NULL,
  unit          VARCHAR2(20)  NOT NULL,
  line_total    NUMBER(10,2)  GENERATED ALWAYS AS (quantity * unit_price) VIRTUAL
);

-- ─── INDEXES ─────────────────────────────────────────────────────
CREATE INDEX idx_products_farmer   ON products(farmer_id);
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_orders_customer   ON orders(customer_id);
CREATE INDEX idx_orders_farmer     ON orders(farmer_id);
CREATE INDEX idx_orders_status     ON orders(status);
CREATE INDEX idx_cart_user         ON cart_items(user_id);
CREATE INDEX idx_order_items_order ON order_items(order_id);

-- ============================================================
-- SEED DATA
-- ============================================================

-- Categories
INSERT INTO categories VALUES ('all',    'All',    'grid-outline');
INSERT INTO categories VALUES ('milk',   'Milk',   'water-outline');
INSERT INTO categories VALUES ('curd',   'Curd',   'flask-outline');
INSERT INTO categories VALUES ('paneer', 'Paneer', 'cube-outline');
INSERT INTO categories VALUES ('butter', 'Butter', 'layers-outline');
INSERT INTO categories VALUES ('ghee',   'Ghee',   'beaker-outline');
INSERT INTO categories VALUES ('cream',  'Cream',  'color-wand-outline');
INSERT INTO categories VALUES ('sweets', 'Sweets', 'gift-outline');

-- Demo Farmer Users (password = "farmer123" hashed with bcrypt - use real hash in prod)
INSERT INTO users (user_id, name, email, phone, password_hash, role, avatar_url, location, about, years_of_experience, verified, rating, review_count)
VALUES (seq_users.NEXTVAL, 'Ramesh Patel', 'ramesh@farm.com', '+919876543210',
        '$2b$10$examplehashvalue1111111111111111111111111111111', 'farmer',
        'https://i.pravatar.cc/150?img=11', 'Anand, Gujarat',
        'Third-generation dairy farmer from the milk capital of India. All our cows are free-range and grass-fed.',
        15, 1, 4.8, 234);

INSERT INTO users (user_id, name, email, phone, password_hash, role, avatar_url, location, about, years_of_experience, verified, rating, review_count)
VALUES (seq_users.NEXTVAL, 'Sunita Devi', 'sunita@farm.com', '+918765432109',
        '$2b$10$examplehashvalue2222222222222222222222222222222', 'farmer',
        'https://i.pravatar.cc/150?img=5', 'Karnal, Haryana',
        'Award-winning dairy farmer known for pure A2 milk and traditional ghee preparation.',
        20, 1, 4.9, 312);

INSERT INTO users (user_id, name, email, phone, password_hash, role, avatar_url, location, about, years_of_experience, verified, rating, review_count)
VALUES (seq_users.NEXTVAL, 'Mohan Singh', 'mohan@farm.com', '+917654321098',
        '$2b$10$examplehashvalue3333333333333333333333333333333', 'farmer',
        'https://i.pravatar.cc/150?img=13', 'Ludhiana, Punjab',
        'Organic dairy farm with certified organic produce. No artificial preservatives.',
        12, 1, 4.7, 178);

INSERT INTO users (user_id, name, email, phone, password_hash, role, avatar_url, location, about, years_of_experience, verified, rating, review_count)
VALUES (seq_users.NEXTVAL, 'Kavitha Reddy', 'kavitha@farm.com', '+916543210987',
        '$2b$10$examplehashvalue4444444444444444444444444444444', 'farmer',
        'https://i.pravatar.cc/150?img=9', 'Vijayawada, AP',
        'Small family farm producing high-quality buffalo milk products.',
        8, 0, 4.6, 145);

-- Demo Customer User (password = "customer123")
INSERT INTO users (user_id, name, email, phone, password_hash, role, avatar_url, address)
VALUES (seq_users.NEXTVAL, 'Arjun Sharma', 'arjun@example.com', '+919876511111',
        '$2b$10$examplehashvalue5555555555555555555555555555555', 'customer',
        'https://i.pravatar.cc/150?img=33', '123 MG Road, Bangalore - 560001');

-- Customer addresses
INSERT INTO user_addresses (address_id, user_id, label, address, is_default)
VALUES (seq_addresses.NEXTVAL, 5, 'Home', '123 MG Road, Bangalore - 560001', 1);
INSERT INTO user_addresses (address_id, user_id, label, address, is_default)
VALUES (seq_addresses.NEXTVAL, 5, 'Office', '456 Whitefield, Bangalore - 560066', 0);

-- Products (farmer_id references the seq above: Ramesh=1, Sunita=2, Mohan=3, Kavitha=4)
INSERT INTO products (product_id, farmer_id, category_id, name, description, price, unit, stock, discount, image_url, featured, rating, review_count, tags)
VALUES (seq_products.NEXTVAL, 1, 'milk', 'Pure A2 Cow Milk',
        'Fresh A2 cow milk collected every morning. Rich in nutrients, no preservatives. Direct from healthy, grass-fed Gir cows.',
        65, 'litre', 50, 10, 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&q=80',
        1, 4.8, 156, 'A2,Fresh,Organic');

INSERT INTO products (product_id, farmer_id, category_id, name, description, price, unit, stock, discount, image_url, featured, rating, review_count, tags)
VALUES (seq_products.NEXTVAL, 2, 'curd', 'Homemade Curd',
        'Thick, creamy curd set naturally overnight. Made from full-fat A2 milk. Perfect for raita, lassi, and cooking.',
        45, 'kg', 30, 0, 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&q=80',
        1, 4.9, 203, 'Probiotic,Fresh,Homemade');

INSERT INTO products (product_id, farmer_id, category_id, name, description, price, unit, stock, discount, image_url, featured, rating, review_count, tags)
VALUES (seq_products.NEXTVAL, 1, 'paneer', 'Fresh Paneer',
        'Soft, fresh paneer made daily from full-fat milk. Crumbles perfectly. Ideal for curries, tikka, and snacks.',
        120, 'kg', 20, 5, 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=400&q=80',
        1, 4.7, 89, 'Soft,Daily Fresh,High Protein');

INSERT INTO products (product_id, farmer_id, category_id, name, description, price, unit, stock, discount, image_url, featured, rating, review_count, tags)
VALUES (seq_products.NEXTVAL, 3, 'butter', 'Pure White Butter',
        'Hand-churned white butter from cultured cream. Unsalted, pure, and full of flavor. Traditional bilona method.',
        180, '500g', 25, 0, 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=400&q=80',
        0, 4.6, 67, 'Hand-churned,Unsalted,Traditional');

INSERT INTO products (product_id, farmer_id, category_id, name, description, price, unit, stock, discount, image_url, featured, rating, review_count, tags)
VALUES (seq_products.NEXTVAL, 2, 'ghee', 'Desi Cow Ghee',
        'Pure bilona ghee from A2 Gir cow milk. Made using the traditional 8-step Vedic process. Golden, aromatic, and medicinal.',
        650, 'kg', 15, 8, 'https://images.unsplash.com/photo-1627483298235-f3bac2567c1c?w=400&q=80',
        1, 4.9, 289, 'Bilona,A2,Vedic Process,Premium');

INSERT INTO products (product_id, farmer_id, category_id, name, description, price, unit, stock, discount, image_url, featured, rating, review_count, tags)
VALUES (seq_products.NEXTVAL, 4, 'milk', 'Buffalo Milk',
        'Rich, creamy buffalo milk with high fat content. Perfect for making khoa, rabri, and traditional sweets.',
        55, 'litre', 40, 0, 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&q=80',
        0, 4.5, 112, 'High Fat,Rich,Fresh');

INSERT INTO products (product_id, farmer_id, category_id, name, description, price, unit, stock, discount, image_url, featured, rating, review_count, tags)
VALUES (seq_products.NEXTVAL, 1, 'cream', 'Fresh Cream',
        'Fresh dairy cream with 35% fat content. Perfect for desserts, coffee, and cooking.',
        90, '200ml', 35, 15, 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=400&q=80',
        0, 4.7, 54, 'Fresh,Rich,Versatile');

INSERT INTO products (product_id, farmer_id, category_id, name, description, price, unit, stock, discount, image_url, featured, rating, review_count, tags)
VALUES (seq_products.NEXTVAL, 3, 'curd', 'Mishti Doi',
        'Traditional Bengali sweet curd made with jaggery. Creamy, caramelized, and absolutely delightful.',
        60, '500g', 20, 0, 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&q=80',
        1, 4.8, 78, 'Sweet,Traditional,Bengali');

COMMIT;
