const express    = require('express');
const db         = require('../config/db');
const { authenticate, requireRole } = require('../middleware/auth');
const router     = express.Router();

// ─── GET ALL PRODUCTS ────────────────────────────────────────────
/**
 * GET /api/products
 * Query params: category, farmerId, featured, search
 */
router.get('/', async (req, res) => {
  const { category, farmerId, featured, search } = req.query;

  try {
    const params = [];
    const conditions = [`p.is_active = 1`];

    if (category && category !== 'all') {
      params.push(category);
      conditions.push(`p.category_id = $${params.length}`);
    }
    if (farmerId) {
      params.push(Number(farmerId));
      conditions.push(`p.farmer_id = $${params.length}`);
    }
    if (featured === 'true' || featured === '1') {
      conditions.push(`p.featured = 1`);
    }
    if (search) {
      params.push(`%${search.toLowerCase()}%`);
      const idx = params.length;
      conditions.push(
        `(LOWER(p.name) LIKE $${idx} OR LOWER(p.description) LIKE $${idx} OR LOWER(p.tags) LIKE $${idx})`
      );
    }

    const sql = `
      SELECT p.product_id, p.name, p.category_id, p.farmer_id,
             COALESCE(u.name, 'Unknown Farmer') AS farmer_name,
             COALESCE(u.location, 'India') AS farmer_location,
             u.avatar_url AS farmer_avatar,
             COALESCE(u.verified, 0) AS farmer_verified,
             p.price, p.unit, p.stock, p.discount,
             p.image_url, p.featured, p.rating, p.review_count,
             p.description, p.tags, p.created_at
      FROM   products p
      LEFT JOIN users u ON u.user_id = p.farmer_id
      WHERE  ${conditions.join(' AND ')}
      ORDER BY p.featured DESC, p.rating DESC, p.created_at DESC
    `;

    const result = await db.execute(sql, params);
    const products = result.rows.map(formatProduct);
    return res.json({ products });
  } catch (err) {
    console.error('Get products error:', err);
    return res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// ─── GET SINGLE PRODUCT ──────────────────────────────────────────
/**
 * GET /api/products/:id
 */
router.get('/:id', async (req, res) => {
  const productId = Number(req.params.id);
  if (isNaN(productId)) return res.status(400).json({ error: 'Invalid product ID' });

  try {
    const result = await db.execute(
      `SELECT p.product_id, p.name, p.category_id, p.farmer_id,
              u.name AS farmer_name, u.location AS farmer_location,
              u.avatar_url AS farmer_avatar, u.verified AS farmer_verified,
              u.rating AS farmer_rating, u.review_count AS farmer_reviews,
              u.phone AS farmer_phone, u.about AS farmer_about,
              u.years_of_experience,
              p.price, p.unit, p.stock, p.discount,
              ROUND(p.price * (1 - p.discount/100.0), 2) AS discounted_price,
              p.image_url, p.featured, p.rating, p.review_count,
              p.description, p.tags, p.created_at
       FROM   products p
       JOIN   users    u ON u.user_id = p.farmer_id
       WHERE  p.product_id = $1 AND p.is_active = 1`,
      [productId]
    );

    if (!result.rows.length) {
      return res.status(404).json({ error: 'Product not found' });
    }

    return res.json({ product: formatProduct(result.rows[0]) });
  } catch (err) {
    console.error('Get product error:', err);
    return res.status(500).json({ error: 'Failed to fetch product' });
  }
});

// ─── ADD PRODUCT (Farmer only) ────────────────────────────────────
/**
 * POST /api/products
 * Body: { name, categoryId, description, price, unit, stock, discount, imageUrl, tags }
 */
router.post('/', authenticate, requireRole('farmer'), async (req, res) => {
  const {
    name, categoryId, description, price, unit,
    stock, discount, imageUrl, tags,
  } = req.body;

  if (!name || !categoryId || !price || !unit || stock === undefined) {
    return res.status(400).json({ error: 'name, categoryId, price, unit and stock are required' });
  }

  try {
    const tagsStr = Array.isArray(tags) ? tags.join(',') : (tags || null);
    const result = await db.execute(
      `INSERT INTO products (farmer_id, category_id, name, description, price, unit, stock, discount, image_url, tags, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 1)
       RETURNING product_id`,
      [
        req.user.userId,
        categoryId,
        name,
        description || null,
        Number(price),
        unit,
        Number(stock),
        Number(discount || 0),
        imageUrl || null,
        tagsStr,
      ]
    );

    return res.status(201).json({
      productId: result.rows[0].product_id,
      message: 'Product added successfully',
    });
  } catch (err) {
    console.error('Add product error:', err);
    return res.status(500).json({ error: 'Failed to add product' });
  }
});

// ─── UPDATE PRODUCT (Farmer only) ────────────────────────────────
/**
 * PUT /api/products/:id
 */
router.put('/:id', authenticate, requireRole('farmer'), async (req, res) => {
  const productId = Number(req.params.id);
  const {
    name, description, price, unit,
    stock, discount, imageUrl, tags,
  } = req.body;

  try {
    // Verify ownership
    const check = await db.execute(
      `SELECT product_id FROM products WHERE product_id = $1 AND farmer_id = $2`,
      [productId, req.user.userId]
    );
    if (!check.rows.length) {
      return res.status(404).json({ error: 'Product not found or unauthorized' });
    }

    const fields = [];
    const params = [];

    if (name !== undefined)        { params.push(name);              fields.push(`name = $${params.length}`); }
    if (description !== undefined) { params.push(description);       fields.push(`description = $${params.length}`); }
    if (price !== undefined)       { params.push(Number(price));     fields.push(`price = $${params.length}`); }
    if (unit !== undefined)        { params.push(unit);              fields.push(`unit = $${params.length}`); }
    if (stock !== undefined)       { params.push(Number(stock));     fields.push(`stock = $${params.length}`); }
    if (discount !== undefined)    { params.push(Number(discount));  fields.push(`discount = $${params.length}`); }
    if (imageUrl !== undefined)    { params.push(imageUrl);          fields.push(`image_url = $${params.length}`); }
    if (tags !== undefined) {
      const tagsStr = Array.isArray(tags) ? tags.join(',') : tags;
      params.push(tagsStr);
      fields.push(`tags = $${params.length}`);
    }

    if (!fields.length) {
      return res.json({ message: 'No fields to update' });
    }

    params.push(productId);
    await db.execute(
      `UPDATE products SET ${fields.join(', ')} WHERE product_id = $${params.length}`,
      params
    );

    return res.json({ message: 'Product updated successfully' });
  } catch (err) {
    console.error('Update product error:', err);
    return res.status(500).json({ error: 'Failed to update product' });
  }
});

// ─── DELETE PRODUCT (Farmer only) ────────────────────────────────
/**
 * DELETE /api/products/:id
 */
router.delete('/:id', authenticate, requireRole('farmer'), async (req, res) => {
  const productId = Number(req.params.id);

  try {
    const result = await db.execute(
      `UPDATE products SET is_active = 0 WHERE product_id = $1 AND farmer_id = $2`,
      [productId, req.user.userId]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Product not found or unauthorized' });
    }
    return res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    console.error('Delete product error:', err);
    return res.status(500).json({ error: 'Failed to delete product' });
  }
});

// ─── GET CATEGORIES ──────────────────────────────────────────────
/**
 * GET /api/products/meta/categories
 */
router.get('/meta/categories', async (req, res) => {
  try {
    const result = await db.execute(
      `SELECT category_id, label, icon FROM categories ORDER BY category_id`
    );
    // pg returns lowercase column names automatically
    return res.json({ categories: result.rows });
  } catch (err) {
    console.error('Get categories error:', err);
    return res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// ─── HELPER ──────────────────────────────────────────────────────
// Default images by category (used when image_url is NULL in DB)
const DEFAULT_IMAGES = {
  milk:   'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&q=80',
  curd:   'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&q=80',
  paneer: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=400&q=80',
  butter: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=400&q=80',
  ghee:   'https://images.unsplash.com/photo-1627483298235-f3bac2567c1c?w=400&q=80',
  cream:  'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=400&q=80',
  sweets: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400&q=80',
  default:'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&q=80',
};

function formatProduct(row) {
  // pg returns lowercase column names
  const tags       = row.tags        || '';
  const price      = Number(row.price      || 0);
  const discount   = Number(row.discount   || 0);
  const categoryId = row.category_id || 'milk';
  const imageUrl   = row.image_url;

  const discountedPrice = row.discounted_price
    || (discount > 0 ? +(price * (1 - discount / 100)).toFixed(2) : price);

  return {
    id:               row.product_id,
    name:             row.name             || 'Unnamed Product',
    category:         categoryId,
    farmerId:         row.farmer_id,
    farmerName:       row.farmer_name      || 'Unknown Farmer',
    farmerLocation:   row.farmer_location  || 'India',
    farmerAvatar:     row.farmer_avatar    || 'https://i.pravatar.cc/150?img=11',
    farmerVerified:   row.farmer_verified === 1 || row.farmer_verified === true,
    farmerRating:     Number(row.farmer_rating || 4.5),
    farmerReviews:    Number(row.farmer_reviews || 12),
    price,
    unit:             row.unit             || '',
    stock:            Number(row.stock     || 0),
    discount,
    discountedPrice,
    image:            imageUrl || DEFAULT_IMAGES[categoryId] || DEFAULT_IMAGES.default,
    featured:         row.featured === 1 || row.featured === true,
    rating:           Number(row.rating    || 0),
    reviews:          Number(row.review_count || 0),
    description:      row.description      || '',
    tags:             tags ? String(tags).split(',').map(t => t.trim()).filter(Boolean) : [],
    createdAt:        row.created_at,
  };
}

module.exports = router;
