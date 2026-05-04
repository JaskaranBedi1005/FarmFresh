-- Categories (if you haven't inserted them already)
INSERT INTO categories (category_id, label, icon) VALUES
('all',    'All',    'grid-outline'),
('milk',   'Milk',   'water-outline'),
('curd',   'Curd',   'flask-outline'),
('paneer', 'Paneer', 'cube-outline'),
('butter', 'Butter', 'layers-outline'),
('ghee',   'Ghee',   'beaker-outline'),
('cream',  'Cream',  'color-wand-outline'),
('sweets', 'Sweets', 'gift-outline')
ON CONFLICT (category_id) DO NOTHING;

-- Demo Farmers (Make sure these user_ids exist or let Postgres auto-generate them. 
-- For the sake of this script, we'll assume we have farmers with ID 1, 2, 3. 
-- If you don't have them, let's insert 3 dummy farmers first and returning their IDs.)
-- BUT if you already have farmers, just replace the farmer_id in the below inserts with the ones from your database.

-- Example: inserting one farmer manually (uncomment if you want to insert a dummy farmer first)
/*
INSERT INTO users (name, email, phone, password_hash, role, location, verified, rating, is_active)
VALUES 
('Ramesh Patel', 'ramesh@farm.com', '+919876543210', '$2b$10$examplehash', 'farmer', 'Anand, Gujarat', 1, 4.8, 1),
('Sunita Devi', 'sunita@farm.com', '+918765432109', '$2b$10$examplehash', 'farmer', 'Karnal, Haryana', 1, 4.9, 1);
*/

-- Products
-- IMPORTANT: Make sure `farmer_id` (e.g., 1, 2, 3) exists in your `users` table!
-- Supabase uses 1/0 for booleans if you migrated from Oracle.
INSERT INTO products (farmer_id, category_id, name, description, price, unit, stock, discount, image_url, featured, rating, review_count, tags, is_active) VALUES
(1, 'milk', 'Pure A2 Cow Milk', 'Fresh A2 cow milk collected every morning. Rich in nutrients, no preservatives. Direct from healthy, grass-fed Gir cows.', 65.00, 'litre', 50, 10.00, 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&q=80', 1, 4.8, 156, 'A2,Fresh,Organic', 1),
(1, 'paneer', 'Fresh Paneer', 'Soft, fresh paneer made daily from full-fat milk. Crumbles perfectly. Ideal for curries, tikka, and snacks.', 120.00, 'kg', 20, 5.00, 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=400&q=80', 1, 4.7, 89, 'Soft,Daily Fresh,High Protein', 1),
(2, 'curd', 'Homemade Curd', 'Thick, creamy curd set naturally overnight. Made from full-fat A2 milk. Perfect for raita, lassi, and cooking.', 45.00, 'kg', 30, 0.00, 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&q=80', 1, 4.9, 203, 'Probiotic,Fresh,Homemade', 1),
(2, 'ghee', 'Desi Cow Ghee', 'Pure bilona ghee from A2 Gir cow milk. Made using the traditional 8-step Vedic process. Golden, aromatic, and medicinal.', 650.00, 'kg', 15, 8.00, 'https://images.unsplash.com/photo-1627483298235-f3bac2567c1c?w=400&q=80', 1, 4.9, 289, 'Bilona,A2,Vedic Process,Premium', 1),
(1, 'butter', 'Pure White Butter', 'Hand-churned white butter from cultured cream. Unsalted, pure, and full of flavor. Traditional bilona method.', 180.00, '500g', 25, 0.00, 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=400&q=80', 0, 4.6, 67, 'Hand-churned,Unsalted,Traditional', 1),
(2, 'milk', 'Buffalo Milk', 'Rich, creamy buffalo milk with high fat content. Perfect for making khoa, rabri, and traditional sweets.', 55.00, 'litre', 40, 0.00, 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&q=80', 0, 4.5, 112, 'High Fat,Rich,Fresh', 1),
(1, 'cream', 'Fresh Cream', 'Fresh dairy cream with 35% fat content. Perfect for desserts, coffee, and cooking.', 90.00, '200ml', 35, 15.00, 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=400&q=80', 0, 4.7, 54, 'Fresh,Rich,Versatile', 1),
(2, 'curd', 'Mishti Doi', 'Traditional Bengali sweet curd made with jaggery. Creamy, caramelized, and absolutely delightful.', 60.00, '500g', 20, 0.00, 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&q=80', 1, 4.8, 78, 'Sweet,Traditional,Bengali', 1);
