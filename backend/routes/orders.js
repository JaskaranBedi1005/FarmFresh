const express  = require('express');
const db       = require('../config/db');
const { authenticate, requireRole } = require('../middleware/auth');
const router   = express.Router();

router.use(authenticate);

// ─── PLACE ORDER (Customer only) ─────────────────────────────────
/**
 * POST /api/orders
 * Body: { deliveryAddress, paymentMode, specialNote? }
 */
router.post('/', requireRole('customer'), async (req, res) => {
  const { deliveryAddress, paymentMode, specialNote } = req.body;

  if (!deliveryAddress || !paymentMode) {
    return res.status(400).json({ error: 'deliveryAddress and paymentMode are required' });
  }
  if (!['cash', 'upi', 'card'].includes(paymentMode)) {
    return res.status(400).json({ error: 'paymentMode must be cash, upi or card' });
  }

  const client = await db.getConnection();
  try {
    await client.query('BEGIN');

    // Fetch cart items
    const cartResult = await client.query(
      `SELECT ci.product_id, ci.quantity, p.price, p.discount, p.stock,
              p.name AS product_name, p.unit, p.farmer_id
       FROM   cart_items ci
       JOIN   products   p ON p.product_id = ci.product_id
       WHERE  ci.user_id = $1`,
      [req.user.userId]
    );

    if (!cartResult.rows.length) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Cart is empty' });
    }

    // Check stock & compute subtotal
    let subtotal = 0;
    for (const item of cartResult.rows) {
      if (item.stock < item.quantity) {
        await client.query('ROLLBACK');
        return res.status(409).json({ error: `Insufficient stock for ${item.product_name}` });
      }
      const effectivePrice = item.price * (1 - item.discount / 100.0);
      subtotal += effectivePrice * item.quantity;
    }

    const deliveryCharge = subtotal >= 500 ? 0 : 40;
    const grandTotal     = subtotal + deliveryCharge;
    const orderRef       = 'FF' + Date.now();
    const farmerId       = cartResult.rows[0].farmer_id; // Primary farmer

    // Create the order
    const orderResult = await client.query(
      `INSERT INTO orders (customer_id, farmer_id, order_ref, delivery_address,
                           payment_mode, special_note, subtotal, delivery_charge,
                           grand_total, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'pending')
       RETURNING order_id, order_ref, status, grand_total, delivery_charge,
                 subtotal, delivery_address, payment_mode, created_at`,
      [
        req.user.userId, farmerId, orderRef, deliveryAddress,
        paymentMode, specialNote || null,
        subtotal.toFixed(2), deliveryCharge.toFixed(2), grandTotal.toFixed(2),
      ]
    );

    const order = orderResult.rows[0];

    // Insert order items & reduce stock
    for (const item of cartResult.rows) {
      const effectivePrice = item.price * (1 - item.discount / 100.0);
      await client.query(
        `INSERT INTO order_items (order_id, product_id, product_name, quantity, unit_price, unit)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [order.order_id, item.product_id, item.product_name,
         item.quantity, effectivePrice.toFixed(2), item.unit]
      );
      await client.query(
        `UPDATE products SET stock = stock - $1 WHERE product_id = $2`,
        [item.quantity, item.product_id]
      );
    }

    // Clear the cart
    await client.query(`DELETE FROM cart_items WHERE user_id = $1`, [req.user.userId]);

    await client.query('COMMIT');

    return res.status(201).json({
      message: 'Order placed successfully',
      order: formatOrder(order),
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Place order error:', err);
    return res.status(500).json({ error: 'Failed to place order' });
  } finally {
    client.release();
  }
});

// ─── GET MY ORDERS ───────────────────────────────────────────────
/**
 * GET /api/orders
 * Returns orders for the logged-in user (customer or farmer)
 */
router.get('/', async (req, res) => {
  try {
    const isCustomer = req.user.role === 'customer';
    const result = await db.execute(
      isCustomer
        ? `SELECT order_id, order_ref, status, grand_total, delivery_charge,
                  subtotal, delivery_address, payment_mode, special_note, created_at, updated_at
           FROM   orders WHERE customer_id = $1 ORDER BY created_at DESC`
        : `SELECT order_id, order_ref, status, grand_total, delivery_charge,
                  subtotal, delivery_address, payment_mode, special_note, created_at, updated_at
           FROM   orders WHERE farmer_id = $1 ORDER BY created_at DESC`,
      [req.user.userId]
    );

    const orders = [];
    for (const row of result.rows) {
      const itemsResult = await db.execute(
        `SELECT order_item_id, product_id, product_name, quantity, unit_price, unit
         FROM order_items WHERE order_id = $1`,
        [row.order_id]
      );
      orders.push({
        ...formatOrder(row),
        products: itemsResult.rows.map(i => ({
          orderItemId: i.order_item_id,
          productId:   i.product_id,
          name:        i.product_name,
          quantity:    i.quantity,
          price:       i.unit_price,
          unit:        i.unit,
        })),
      });
    }

    return res.json({ orders });
  } catch (err) {
    console.error('Get orders error:', err);
    return res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// ─── GET SINGLE ORDER ────────────────────────────────────────────
/**
 * GET /api/orders/:id
 */
router.get('/:id', async (req, res) => {
  const orderId = Number(req.params.id);

  try {
    const orderResult = await db.execute(
      `SELECT o.order_id, o.order_ref, o.status, o.grand_total,
              o.delivery_charge, o.subtotal, o.delivery_address,
              o.payment_mode, o.special_note, o.created_at, o.updated_at,
              uc.name AS customer_name, uc.phone AS customer_phone,
              uf.name AS farmer_name
       FROM   orders o
       JOIN   users  uc ON uc.user_id = o.customer_id
       LEFT JOIN users uf ON uf.user_id = o.farmer_id
       WHERE  o.order_id = $1
         AND  (o.customer_id = $2 OR o.farmer_id = $2)`,
      [orderId, req.user.userId]
    );

    if (!orderResult.rows.length) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const itemsResult = await db.execute(
      `SELECT order_item_id, product_id, product_name, quantity, unit_price, unit
       FROM order_items WHERE order_id = $1`,
      [orderId]
    );

    const order = {
      ...formatOrder(orderResult.rows[0]),
      products: itemsResult.rows.map(i => ({
        orderItemId: i.order_item_id,
        productId:   i.product_id,
        name:        i.product_name,
        quantity:    i.quantity,
        price:       i.unit_price,
        unit:        i.unit,
      })),
    };

    return res.json({ order });
  } catch (err) {
    console.error('Get order error:', err);
    return res.status(500).json({ error: 'Failed to fetch order' });
  }
});

// ─── UPDATE ORDER STATUS (Farmer only) ───────────────────────────
/**
 * PUT /api/orders/:id/status
 * Body: { status }
 */
router.put('/:id/status', requireRole('farmer'), async (req, res) => {
  const orderId = Number(req.params.id);
  const { status } = req.body;

  const validStatuses = ['confirmed', 'packed', 'out_for_delivery', 'delivered', 'cancelled'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: `status must be one of: ${validStatuses.join(', ')}` });
  }

  try {
    const result = await db.execute(
      `UPDATE orders
       SET    status = $1, updated_at = NOW()
       WHERE  order_id = $2 AND farmer_id = $3`,
      [status, orderId, req.user.userId]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Order not found or unauthorized' });
    }
    return res.json({ message: 'Order status updated', status });
  } catch (err) {
    console.error('Update order status error:', err);
    return res.status(500).json({ error: 'Failed to update order status' });
  }
});

// ─── HELPER ──────────────────────────────────────────────────────
function formatOrder(row) {
  return {
    id:              row.order_id,
    ref:             row.order_ref,
    status:          row.status,
    total:           row.grand_total,
    deliveryCharge:  row.delivery_charge,
    subtotal:        row.subtotal,
    address:         row.delivery_address,
    paymentMode:     row.payment_mode,
    specialNote:     row.special_note,
    customerName:    row.customer_name,
    customerPhone:   row.customer_phone,
    farmerName:      row.farmer_name,
    date:            row.created_at,
    updatedAt:       row.updated_at,
  };
}

module.exports = router;
