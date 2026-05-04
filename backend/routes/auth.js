const express  = require('express');
const bcrypt   = require('bcryptjs');
const jwt      = require('jsonwebtoken');
const db       = require('../config/db');
const router   = express.Router();

// ─── REGISTER ────────────────────────────────────────────────────
/**
 * POST /api/auth/register
 * Body: { name, email, phone, password, role, address?, location? }
 */
router.post('/register', async (req, res) => {
  const { name, email, phone, password, role, address, location } = req.body;

  if (!name || !phone || !password || !role) {
    return res.status(400).json({ error: 'name, phone, password and role are required' });
  }
  if (!['customer', 'farmer'].includes(role)) {
    return res.status(400).json({ error: 'role must be customer or farmer' });
  }

  try {
    const passwordHash = await bcrypt.hash(password, 10);

    // Check for duplicate phone
    const dupPhone = await db.execute(
      `SELECT user_id FROM users WHERE phone = $1`,
      [phone]
    );
    if (dupPhone.rows.length > 0) {
      return res.status(409).json({ error: 'Phone number already registered. Please login instead.' });
    }

    // Check for duplicate email (if provided)
    if (email) {
      const dupEmail = await db.execute(
        `SELECT user_id FROM users WHERE email = $1`,
        [email]
      );
      if (dupEmail.rows.length > 0) {
        return res.status(409).json({ error: 'Email already registered. Please login instead.' });
      }
    }

    const insertResult = await db.execute(
      `INSERT INTO users (name, email, phone, password_hash, role, address, location)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING user_id`,
      [name, email || null, phone, passwordHash, role, address || null, location || null]
    );

    const userId = insertResult.rows[0].user_id;

    if (role === 'customer' && address) {
      await db.execute(
        `INSERT INTO user_addresses (user_id, label, address, is_default)
         VALUES ($1, 'Home', $2, 1)`,
        [userId, address]
      );
    }

    const token = jwt.sign(
      { userId, role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    return res.status(201).json({ userId, role, token, message: 'Registration successful' });
  } catch (err) {
    const msg = err.message || '';
    if (msg.includes('unique') || msg.includes('duplicate')) {
      return res.status(409).json({ error: 'An account with this phone or email already exists.' });
    }
    console.error('Register error:', err);
    return res.status(500).json({ error: 'Registration failed. Please try again.' });
  }
});

// ─── LOGIN ────────────────────────────────────────────────────────
/**
 * POST /api/auth/login
 * Body: { phone, password, role }
 */
router.post('/login', async (req, res) => {
  const { phone, password, role } = req.body;

  if (!phone || !password || !role) {
    return res.status(400).json({ error: 'phone, password and role are required' });
  }

  try {
    const result = await db.execute(
      `SELECT user_id, name, email, phone, password_hash, role, avatar_url, address,
              location, about, years_of_experience, verified, rating, review_count,
              bank_account, upi_id, is_active
       FROM users
       WHERE phone = $1 AND role = $2 AND is_active = 1`,
      [phone, role]
    );

    if (!result.rows || result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];
    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Fetch addresses if customer
    let addresses = [];
    if (role === 'customer') {
      const addrResult = await db.execute(
        `SELECT address_id, label, address, is_default
         FROM user_addresses
         WHERE user_id = $1
         ORDER BY is_default DESC`,
        [user.user_id]
      );
      addresses = addrResult.rows;
    }

    const userRole = user.role || role;
    const token = jwt.sign(
      { userId: user.user_id, role: userRole.toLowerCase() },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    const { password_hash, ...safeUser } = user;

    return res.json({
      token,
      user: { ...safeUser, savedAddresses: addresses },
      message: 'Login successful',
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Login failed' });
  }
});

// ─── GET PROFILE ─────────────────────────────────────────────────
/**
 * GET /api/auth/profile
 * Headers: Authorization: Bearer <token>
 */
const { authenticate } = require('../middleware/auth');

router.get('/profile', authenticate, async (req, res) => {
  try {
    const result = await db.execute(
      `SELECT user_id, name, email, phone, role, avatar_url, address, location,
              about, years_of_experience, verified, rating, review_count,
              bank_account, upi_id, is_active, created_at
       FROM users
       WHERE user_id = $1`,
      [req.user.userId]
    );

    if (!result.rows.length) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = result.rows[0];

    let addresses = [];
    if (user.role === 'customer') {
      const addrResult = await db.execute(
        `SELECT address_id, label, address, is_default
         FROM user_addresses
         WHERE user_id = $1
         ORDER BY is_default DESC`,
        [user.user_id]
      );
      addresses = addrResult.rows;
    }

    return res.json({ user: { ...user, savedAddresses: addresses } });
  } catch (err) {
    console.error('Profile error:', err);
    return res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// ─── ADD ADDRESS ─────────────────────────────────────────────────
/**
 * POST /api/auth/addresses
 * Body: { label, address, isDefault }
 * Headers: Authorization: Bearer <token>
 */
router.post('/addresses', authenticate, async (req, res) => {
  const { label, address, isDefault } = req.body;
  if (!address) return res.status(400).json({ error: 'address is required' });

  try {
    // If this is set as default, unset other defaults
    if (isDefault) {
      await db.execute(
        `UPDATE user_addresses SET is_default = 0 WHERE user_id = $1`,
        [req.user.userId]
      );
    }

    const result = await db.execute(
      `INSERT INTO user_addresses (user_id, label, address, is_default)
       VALUES ($1, $2, $3, $4)
       RETURNING address_id, label, address, is_default`,
      [req.user.userId, label || 'Home', address, isDefault ? 1 : 0]
    );

    return res.status(201).json({ address: result.rows[0], message: 'Address added successfully' });
  } catch (err) {
    console.error('Add address error:', err);
    return res.status(500).json({ error: 'Failed to add address' });
  }
});

// ─── UPDATE PROFILE ────────────────────────────────────────────────
/**
 * PUT /api/auth/profile
 * Body: { name, email, phone, location }
 * Headers: Authorization: Bearer <token>
 */
router.put('/profile', authenticate, async (req, res) => {
  const { name, email, phone, location } = req.body;
  if (!name || !phone) return res.status(400).json({ error: 'Name and phone are required' });

  try {
    const result = await db.execute(
      `UPDATE users
       SET name = $1, email = $2, phone = $3, location = $4
       WHERE user_id = $5
       RETURNING user_id`,
      [name, email || null, phone, location || null, req.user.userId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.json({ message: 'Profile updated successfully' });
  } catch (err) {
    if (err.message && (err.message.includes('unique') || err.message.includes('duplicate'))) {
      return res.status(409).json({ error: 'Phone or email already in use' });
    }
    console.error('Update profile error:', err);
    return res.status(500).json({ error: 'Failed to update profile' });
  }
});

module.exports = router;
