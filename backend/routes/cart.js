const express  = require('express');
const db       = require('../config/db');
const { authenticate } = require('../middleware/auth');
const router   = express.Router();

// All cart routes require authentication
router.use(authenticate);

// ─── GET CART ────────────────────────────────────────────────────
/**
 * GET /api/cart
 */
router.get('/', async (req, res) => {
  try {
    const result = await db.execute(
      `SELECT ci.cart_item_id, ci.product_id, ci.quantity,
              p.name, p.price, p.unit, p.discount, p.image_url, p.stock,
              p.farmer_id,
              u.name AS farmer_name,
              ROUND(p.price * (1 - p.discount / 100.0), 2) AS effective_price,
              ROUND(ci.quantity * p.price * (1 - p.discount / 100.0), 2) AS line_total,
              ci.added_at
       FROM   cart_items ci
       JOIN   products   p  ON p.product_id  = ci.product_id
       JOIN   users      u  ON u.user_id     = p.farmer_id
       WHERE  ci.user_id = $1
       ORDER BY ci.added_at DESC`,
      [req.user.userId]
    );

    const items = result.rows.map(row => ({
      cartItemId:     row.cart_item_id,
      productId:      row.product_id,
      quantity:       row.quantity,
      name:           row.name,
      price:          row.price,
      unit:           row.unit,
      discount:       row.discount,
      image:          row.image_url,
      stock:          row.stock,
      farmerId:       row.farmer_id,
      farmerName:     row.farmer_name,
      effectivePrice: row.effective_price,
      lineTotal:      row.line_total,
      addedAt:        row.added_at,
    }));

    const cartTotal = items.reduce((sum, i) => sum + Number(i.lineTotal || 0), 0);
    const cartCount = items.reduce((sum, i) => sum + Number(i.quantity  || 0), 0);

    return res.json({ items, cartTotal, cartCount });
  } catch (err) {
    console.error('Get cart error:', err);
    return res.status(500).json({ error: 'Failed to fetch cart' });
  }
});

// ─── ADD TO CART ─────────────────────────────────────────────────
/**
 * POST /api/cart
 * Body: { productId, quantity }
 */
router.post('/', async (req, res) => {
  const { productId, quantity = 1 } = req.body;
  if (!productId) return res.status(400).json({ error: 'productId is required' });

  try {
    // Check stock
    const stockCheck = await db.execute(
      `SELECT stock FROM products WHERE product_id = $1 AND is_active = 1`,
      [Number(productId)]
    );
    if (!stockCheck.rows.length) {
      return res.status(404).json({ error: 'Product not found' });
    }
    if (stockCheck.rows[0].stock < Number(quantity)) {
      return res.status(409).json({ error: 'Insufficient stock' });
    }

    // Upsert cart item
    await db.execute(
      `INSERT INTO cart_items (user_id, product_id, quantity)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, product_id)
       DO UPDATE SET quantity = cart_items.quantity + EXCLUDED.quantity,
                     added_at = NOW()`,
      [req.user.userId, Number(productId), Number(quantity)]
    );

    return res.status(201).json({ message: 'Item added to cart' });
  } catch (err) {
    console.error('Add to cart error:', err);
    return res.status(500).json({ error: 'Failed to add to cart' });
  }
});

// ─── UPDATE CART QUANTITY ────────────────────────────────────────
/**
 * PUT /api/cart/:productId
 * Body: { quantity }
 */
router.put('/:productId', async (req, res) => {
  const productId = Number(req.params.productId);
  const { quantity } = req.body;

  if (quantity === undefined) return res.status(400).json({ error: 'quantity is required' });

  try {
    if (Number(quantity) <= 0) {
      // Remove the item if quantity is 0 or less
      await db.execute(
        `DELETE FROM cart_items WHERE user_id = $1 AND product_id = $2`,
        [req.user.userId, productId]
      );
    } else {
      await db.execute(
        `UPDATE cart_items SET quantity = $1
         WHERE user_id = $2 AND product_id = $3`,
        [Number(quantity), req.user.userId, productId]
      );
    }
    return res.json({ message: 'Cart updated' });
  } catch (err) {
    console.error('Update cart error:', err);
    return res.status(500).json({ error: 'Failed to update cart' });
  }
});

// ─── REMOVE FROM CART ────────────────────────────────────────────
/**
 * DELETE /api/cart/:productId
 */
router.delete('/:productId', async (req, res) => {
  const productId = Number(req.params.productId);

  try {
    await db.execute(
      `DELETE FROM cart_items WHERE user_id = $1 AND product_id = $2`,
      [req.user.userId, productId]
    );
    return res.json({ message: 'Item removed from cart' });
  } catch (err) {
    console.error('Remove from cart error:', err);
    return res.status(500).json({ error: 'Failed to remove from cart' });
  }
});

// ─── CLEAR CART ──────────────────────────────────────────────────
/**
 * DELETE /api/cart
 */
router.delete('/', async (req, res) => {
  try {
    await db.execute(
      `DELETE FROM cart_items WHERE user_id = $1`,
      [req.user.userId]
    );
    return res.json({ message: 'Cart cleared' });
  } catch (err) {
    console.error('Clear cart error:', err);
    return res.status(500).json({ error: 'Failed to clear cart' });
  }
});

module.exports = router;
