const express  = require('express');
const db       = require('../config/db');
const { authenticate, requireRole } = require('../middleware/auth');
const router   = express.Router();

router.use(authenticate, requireRole('farmer'));

// ─── GET FARMER STATS ────────────────────────────────────────────
/**
 * GET /api/farmer/stats
 */
router.get('/stats', async (req, res) => {
  try {
    const result = await db.execute(
      `SELECT
         COALESCE(SUM(CASE WHEN DATE(o.created_at) = CURRENT_DATE AND o.status != 'cancelled'
                           THEN o.grand_total ELSE 0 END), 0)                      AS today_sales,
         COUNT(CASE WHEN DATE(o.created_at) = CURRENT_DATE AND o.status != 'cancelled'
                    THEN 1 END)                                                     AS today_orders,
         COALESCE(SUM(CASE WHEN DATE_TRUNC('month', o.created_at) = DATE_TRUNC('month', NOW())
                                AND o.status != 'cancelled'
                           THEN o.grand_total ELSE 0 END), 0)                      AS monthly_earnings,
         COUNT(CASE WHEN o.status IN ('pending', 'confirmed', 'packed') THEN 1 END) AS pending_orders,
         (SELECT COUNT(*) FROM products WHERE farmer_id = $1 AND is_active = 1)  AS total_products,
         (SELECT COUNT(*) FROM products WHERE farmer_id = $1 AND is_active = 1
                                          AND stock <= 5)                            AS low_stock
       FROM orders o
       WHERE o.farmer_id = $1`,
      [req.user.userId]
    );

    if (!result.rows.length) return res.json({ stats: null });

    const r = result.rows[0];
    return res.json({
      stats: {
        todaySales:      Number(r.today_sales),
        todayOrders:     Number(r.today_orders),
        monthlyEarnings: Number(r.monthly_earnings),
        pendingOrders:   Number(r.pending_orders),
        totalProducts:   Number(r.total_products),
        lowStock:        Number(r.low_stock),
      }
    });
  } catch (err) {
    console.error('Get farmer stats error:', err);
    return res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// ─── GET WEEKLY SALES ────────────────────────────────────────────
/**
 * GET /api/farmer/weekly-sales
 * Returns daily sales for the past 7 days
 */
router.get('/weekly-sales', async (req, res) => {
  try {
    const result = await db.execute(
      `SELECT TO_CHAR(d.dt, 'Dy')         AS day,
              TO_CHAR(d.dt, 'YYYY-MM-DD') AS date_str,
              COALESCE(SUM(o.grand_total), 0) AS sales
       FROM  (SELECT CURRENT_DATE - s.i AS dt FROM generate_series(0, 6) AS s(i)) d
       LEFT JOIN orders o
         ON  DATE(o.created_at) = d.dt
         AND o.farmer_id = $1
         AND o.status != 'cancelled'
       GROUP BY d.dt
       ORDER BY d.dt`,
      [req.user.userId]
    );

    return res.json({
      weeklyData: result.rows.map(r => ({
        day:   r.day,
        date:  r.date_str,
        sales: Number(r.sales),
      }))
    });
  } catch (err) {
    console.error('Get weekly sales error:', err);
    return res.status(500).json({ error: 'Failed to fetch weekly sales' });
  }
});

// ─── GET MONTHLY EARNINGS ────────────────────────────────────────
/**
 * GET /api/farmer/monthly-earnings
 * Returns earnings for the past 6 months
 */
router.get('/monthly-earnings', async (req, res) => {
  try {
    const result = await db.execute(
      `SELECT TO_CHAR(m.mnth, 'Mon')     AS month,
              TO_CHAR(m.mnth, 'YYYY-MM') AS month_str,
              COALESCE(SUM(o.grand_total), 0) AS revenue
       FROM  (SELECT DATE_TRUNC('month', NOW()) - INTERVAL '1 month' * s.i AS mnth
              FROM   generate_series(0, 5) AS s(i)) m
       LEFT JOIN orders o
         ON  DATE_TRUNC('month', o.created_at) = m.mnth
         AND o.farmer_id = $1
         AND o.status != 'cancelled'
       GROUP BY m.mnth
       ORDER BY m.mnth`,
      [req.user.userId]
    );

    return res.json({
      monthlyData: result.rows.map(r => ({
        month:    r.month,
        monthStr: r.month_str,
        revenue:  Number(r.revenue),
      }))
    });
  } catch (err) {
    console.error('Get monthly earnings error:', err);
    return res.status(500).json({ error: 'Failed to fetch monthly earnings' });
  }
});

// ─── GET FARMERS LIST (Public) ────────────────────────────────────
module.exports = router;

// Also export public farmer listing as separate router
const publicRouter = express.Router();

/**
 * GET /api/farmers
 * Public endpoint - list all active farmers
 */
publicRouter.get('/', async (req, res) => {
  try {
    const result = await db.execute(
      `SELECT u.user_id, u.name, u.location, u.avatar_url, u.verified,
              u.rating, u.review_count, u.years_of_experience, u.about,
              (SELECT COUNT(*) FROM products p
               WHERE p.farmer_id = u.user_id AND p.is_active = 1) AS total_products
       FROM   users u
       WHERE  u.role = 'farmer' AND u.is_active = 1
       ORDER BY u.rating DESC`
    );

    return res.json({
      farmers: result.rows.map(r => ({
        id:                r.user_id,
        name:              r.name,
        location:          r.location,
        avatar:            r.avatar_url,
        verified:          r.verified === 1 || r.verified === true,
        rating:            r.rating,
        reviews:           r.review_count,
        yearsOfExperience: r.years_of_experience,
        about:             r.about,
        totalProducts:     Number(r.total_products),
      }))
    });
  } catch (err) {
    console.error('Get farmers error:', err);
    return res.status(500).json({ error: 'Failed to fetch farmers' });
  }
});

module.exports.publicRouter = publicRouter;
