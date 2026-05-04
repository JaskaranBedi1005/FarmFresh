const db = require('../config/db');
const bcrypt = require('bcryptjs');

async function seed() {
  console.log('🚀 Starting Database Seeding...');
  
  try {
    await db.initialize();
    const conn = await db.getConnection();

    // 1. Clear existing data (optional, but good for a fresh start)
    console.log('🧹 Cleaning existing data...');
    try {
      await conn.execute('DELETE FROM order_items');
      await conn.execute('DELETE FROM orders');
      await conn.execute('DELETE FROM cart_items');
      await conn.execute('DELETE FROM products');
      await conn.execute('DELETE FROM user_addresses');
      await conn.execute('DELETE FROM users');
      await conn.execute('DELETE FROM categories');
      
      // Reset sequences if needed (Oracle 12c+ IDENTITY columns)
      // For simple NUMBER columns with manual seq:
      // We don't necessarily need to drop/recreate sequences unless strictly required.
    } catch (e) {
      console.log('Note: Some tables could not be cleared (might be empty or missing).');
    }

    // 2. Seed Categories
    console.log('📁 Seeding Categories...');
    const categories = [
      { id: 'all', label: 'All', icon: 'grid-outline' },
      { id: 'milk', label: 'Milk', icon: 'water-outline' },
      { id: 'curd', label: 'Curd', icon: 'flask-outline' },
      { id: 'paneer', label: 'Paneer', icon: 'cube-outline' },
      { id: 'butter', label: 'Butter', icon: 'layers-outline' },
      { id: 'ghee', label: 'Ghee', icon: 'beaker-outline' },
      { id: 'cream', label: 'Cream', icon: 'color-wand-outline' },
      { id: 'sweets', label: 'Sweets', icon: 'heart-outline' }
    ];

    for (const cat of categories) {
      await conn.execute(
        "INSERT INTO categories (category_id, label, icon) VALUES (:1, :2, :3)",
        [cat.id, cat.label, cat.icon]
      );
    }

    // 3. Seed Users (Farmers & Customers)
    console.log('👥 Seeding Users...');
    const salt = await bcrypt.genSalt(10);
    const commonPassword = await bcrypt.hash('1234', salt);

    const farmers = [
      { id: 1, name: 'Rajesh Kumar', phone: '9876543211', role: 'farmer', loc: 'Ludhiana, Punjab', about: 'Specializing in pure buffalo milk and organic curd.', exp: 12, rating: 4.8, rev: 120 },
      { id: 2, name: 'Sita Sharma', phone: '9876543212', role: 'farmer', loc: 'Anand, Gujarat', about: 'Expert in traditional Bilona Ghee and A2 cow milk.', exp: 20, rating: 4.9, rev: 250 },
      { id: 3, name: 'Gurpreet Singh', phone: '9876543213', role: 'farmer', loc: 'Karnal, Haryana', about: 'Hand-churned butter and fresh paneer made daily.', exp: 15, rating: 4.7, rev: 85 }
    ];

    for (const f of farmers) {
      await conn.execute(
        `INSERT INTO users (user_id, name, phone, password_hash, role, location, about, years_of_experience, rating, review_count, verified) 
         VALUES (:1, :2, :3, :4, :5, :6, :7, :8, :9, :10, 1)`,
        [f.id, f.name, f.phone, commonPassword, f.role, f.loc, f.about, f.exp, f.rating, f.rev]
      );
    }

    const customers = [
      { id: 10, name: 'Jaskaran Singh', phone: '9876543210', role: 'customer', addr: 'Plot 42, Sector 17, Chandigarh' },
      { id: 11, name: 'Priya Verma', phone: '9876543214', role: 'customer', addr: 'Flat 204, Rosewood Apts, Delhi' }
    ];

    for (const c of customers) {
      await conn.execute(
        `INSERT INTO users (user_id, name, phone, password_hash, role, address) 
         VALUES (:1, :2, :3, :4, :5, :6)`,
        [c.id, c.name, c.phone, commonPassword, c.role, c.addr]
      );
      
      // Add addresses
      await conn.execute(
        "INSERT INTO user_addresses (address_id, user_id, label, address, is_default) VALUES (seq_addresses.NEXTVAL, :1, 'Home', :2, 1)",
        [c.id, c.addr]
      );
    }

    // 4. Seed Products
    console.log('🥛 Seeding Products...');
    const products = [
      { id: 101, f_id: 1, cat: 'milk', name: 'Fresh Buffalo Milk', desc: 'Thick, creamy buffalo milk directly from the farm.', price: 70, unit: 'Litre', stock: 100, disc: 0, feat: 1, rat: 4.8, img: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400' },
      { id: 102, f_id: 1, cat: 'curd', name: 'Farm Fresh Curd', desc: 'Naturally set curd with no preservatives.', price: 50, unit: '500g', stock: 50, disc: 5, feat: 0, rat: 4.6, img: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400' },
      { id: 103, f_id: 2, cat: 'ghee', name: 'Traditional Bilona Ghee', desc: 'Pure A2 Cow Ghee made using traditional Vedic process.', price: 1200, unit: 'Kg', stock: 20, disc: 10, feat: 1, rat: 4.9, img: 'https://images.unsplash.com/photo-1627483298235-f3bac2567c1c?w=400' },
      { id: 104, f_id: 2, cat: 'milk', name: 'A2 Cow Milk', desc: 'Nutritious A2 milk from free-range cows.', price: 85, unit: 'Litre', stock: 80, disc: 0, feat: 1, rat: 4.8, img: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400' },
      { id: 105, f_id: 3, cat: 'paneer', name: 'Soft Malai Paneer', desc: 'Freshly made paneer that melts in your mouth.', price: 350, unit: 'Kg', stock: 40, disc: 0, feat: 0, rat: 4.7, img: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=400' },
      { id: 106, f_id: 3, cat: 'butter', name: 'Hand Churned White Butter', desc: 'Pure white butter with traditional taste.', price: 200, unit: '250g', stock: 30, disc: 5, feat: 0, rat: 4.5, img: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=400' },
      { id: 107, f_id: 2, cat: 'sweets', name: 'Traditional Milk Cake', desc: 'Made from pure condensed milk and saffron.', price: 400, unit: '500g', stock: 15, disc: 0, feat: 1, rat: 4.9, img: 'https://images.unsplash.com/photo-1589113103503-49653d891d1b?w=400' }
    ];

    for (const p of products) {
      await conn.execute(
        `INSERT INTO products (product_id, farmer_id, category_id, name, description, price, unit, stock, discount, featured, rating, image_url, is_active) 
         VALUES (:1, :2, :3, :4, :5, :6, :7, :8, :9, :10, :11, :12, 1)`,
        [p.id, p.f_id, p.cat, p.name, p.desc, p.price, p.unit, p.stock, p.disc, p.feat, p.rat, p.img]
      );
    }

    await conn.commit();
    console.log('✅ Database Seeded Successfully!');
    
  } catch (err) {
    console.error('❌ Seeding Failed:', err);
  } finally {
    await db.close();
  }
}

seed();
