-- Create all tables for FarmFresh
CREATE TABLE categories (category_id VARCHAR(20) PRIMARY KEY, label VARCHAR(50) NOT NULL, icon VARCHAR(100));

CREATE TABLE users (
  user_id SERIAL PRIMARY KEY, name VARCHAR(100) NOT NULL, email VARCHAR(150) UNIQUE, phone VARCHAR(20) UNIQUE NOT NULL, 
  password_hash VARCHAR(255) NOT NULL, role VARCHAR(10) NOT NULL, avatar_url VARCHAR(500), address VARCHAR(500), 
  location VARCHAR(200), about TEXT, years_of_experience INT, verified INT DEFAULT 0, bank_account VARCHAR(100), 
  upi_id VARCHAR(100), rating NUMERIC(3,1) DEFAULT 0, review_count INT DEFAULT 0, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, is_active INT DEFAULT 1
);

CREATE TABLE products (
  product_id SERIAL PRIMARY KEY, farmer_id INT REFERENCES users(user_id), category_id VARCHAR(20) REFERENCES categories(category_id), 
  name VARCHAR(200) NOT NULL, description TEXT, price NUMERIC(10,2) NOT NULL, unit VARCHAR(20) NOT NULL, stock INT DEFAULT 0, 
  discount NUMERIC(5,2) DEFAULT 0, image_url VARCHAR(500), featured INT DEFAULT 0, rating NUMERIC(3,1) DEFAULT 0, 
  review_count INT DEFAULT 0, tags VARCHAR(500), is_active INT DEFAULT 1, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE cart_items (
  cart_item_id SERIAL PRIMARY KEY, user_id INT REFERENCES users(user_id), product_id INT REFERENCES products(product_id), 
  quantity INT NOT NULL, added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, UNIQUE(user_id, product_id)
);

CREATE TABLE orders (
  order_id SERIAL PRIMARY KEY, order_ref VARCHAR(20) UNIQUE NOT NULL, customer_id INT REFERENCES users(user_id), 
  farmer_id INT REFERENCES users(user_id), delivery_address VARCHAR(500) NOT NULL, payment_mode VARCHAR(20) NOT NULL, 
  special_note VARCHAR(500), subtotal NUMERIC(10,2) NOT NULL, delivery_charge NUMERIC(10,2) DEFAULT 0, 
  grand_total NUMERIC(10,2) NOT NULL, status VARCHAR(30) DEFAULT 'confirmed', created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE order_items (
  order_item_id SERIAL PRIMARY KEY, order_id INT REFERENCES orders(order_id), product_id INT REFERENCES products(product_id), 
  product_name VARCHAR(200) NOT NULL, quantity INT NOT NULL, unit_price NUMERIC(10,2) NOT NULL, unit VARCHAR(20) NOT NULL
);

CREATE TABLE user_addresses (
    address_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    label VARCHAR(50) DEFAULT 'Home', -- e.g. Home, Office, Other
    address TEXT NOT NULL,
    is_default INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ─── AUDIT / LOG TABLES (used by triggers) ───────────────────────

-- Logs every order status transition (old → new)
CREATE TABLE IF NOT EXISTS order_status_log (
    log_id     SERIAL PRIMARY KEY,
    order_id   INT REFERENCES orders(order_id) ON DELETE CASCADE,
    old_status VARCHAR(30),
    new_status VARCHAR(30),
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Logs whenever a product's stock falls to or below 5 units
CREATE TABLE IF NOT EXISTS low_stock_log (
    log_id       SERIAL PRIMARY KEY,
    product_id   INT REFERENCES products(product_id) ON DELETE CASCADE,
    product_name VARCHAR(200),
    farmer_id    INT REFERENCES users(user_id),
    stock_at_log INT,
    logged_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- Seed Categories
INSERT INTO categories (category_id, label, icon) VALUES 
('all', 'All', 'grid-outline'), ('milk', 'Milk', 'water-outline'), ('curd', 'Curd', 'flask-outline'), 
('paneer', 'Paneer', 'cube-outline'), ('butter', 'Butter', 'layers-outline'), ('ghee', 'Ghee', 'beaker-outline'), 
('cream', 'Cream', 'color-wand-outline'), ('sweets', 'Sweets', 'gift-outline');
