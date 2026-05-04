-- ─── CATEGORIES ───────────────────────────────────────────────────
INSERT INTO categories (category_id, label, icon) VALUES ('milk', 'Fresh Milk', 'water-outline');
INSERT INTO categories (category_id, label, icon) VALUES ('paneer', 'Soft Paneer', 'cube-outline');
INSERT INTO categories (category_id, label, icon) VALUES ('ghee', 'Pure Ghee', 'flame-outline');
INSERT INTO categories (category_id, label, icon) VALUES ('curd', 'Fresh Curd', 'color-fill-outline');
INSERT INTO categories (category_id, label, icon) VALUES ('butter', 'Farm Butter', 'square-outline');

-- ─── DUMMY FARMERS (Passwords are '1234') ───────────────────────────
-- Note: password hash is for '1234'
INSERT INTO users (name, phone, password_hash, role, location, verified, rating, review_count, about, years_of_experience, avatar_url)
VALUES ('Ram Singh', '9876543210', '$2a$10$wE8Rj5.R3.P/7vO/9K5KGe9R5r6S1vG.hX/G9f6Vq6Y6S1vG.hX/G', 'farmer', 'Amritsar, Punjab', 1, 4.8, 124, '2nd generation dairy farmer specialized in organic buffalo milk.', 15, 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400');

INSERT INTO users (name, phone, password_hash, role, location, verified, rating, review_count, about, years_of_experience, avatar_url)
VALUES ('Sarabjit Kaur', '9876543211', '$2a$10$wE8Rj5.R3.P/7vO/9K5KGe9R5r6S1vG.hX/G9f6Vq6Y6S1vG.hX/G', 'farmer', 'Ludhiana, Punjab', 1, 4.9, 89, 'Specializes in high-quality A2 cow milk and handmade ghee.', 10, 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400');

-- ─── DUMMY PRODUCTS ────────────────────────────────────────────────
-- Products for Ram Singh (Buffalo Milk)
INSERT INTO products (farmer_id, category_id, name, description, price, unit, stock, discount, image_url, featured)
VALUES (2, 'milk', 'Pure Buffalo Milk', 'Rich and creamy milk, perfect for tea and coffee.', 65, 'Litre', 50, 0, 'https://images.unsplash.com/photo-1563636619-e9107da5a163?w=500', 1);

INSERT INTO products (farmer_id, category_id, name, description, price, unit, stock, discount, image_url, featured)
VALUES (2, 'paneer', 'Fresh Buffalo Paneer', 'Soft and malai paneer made daily.', 320, 'kg', 20, 5, 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=500', 0);

-- Products for Sarabjit Kaur (Cow Milk)
INSERT INTO products (farmer_id, category_id, name, description, price, unit, stock, discount, image_url, featured)
VALUES (3, 'milk', 'A2 Cow Milk', 'Easily digestible and highly nutritious A2 milk.', 75, 'Litre', 40, 10, 'https://images.unsplash.com/photo-1550583724-1255d1426639?w=500', 1);

INSERT INTO products (farmer_id, category_id, name, description, price, unit, stock, discount, image_url, featured)
VALUES (3, 'ghee', 'Hand-churned Desi Ghee', 'Traditional Bilona method ghee with amazing aroma.', 950, 'Litre', 15, 0, 'https://images.unsplash.com/photo-1589927986089-35812388d1f4?w=500', 1);

COMMIT;
