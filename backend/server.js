require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const db      = require('./config/db');

const authRoutes    = require('./routes/auth');
const productRoutes = require('./routes/products');
const cartRoutes    = require('./routes/cart');
const orderRoutes   = require('./routes/orders');
const farmerRoutes  = require('./routes/farmer');
const { publicRouter: farmersPublicRouter } = require('./routes/farmer');

const app  = express();
const PORT = process.env.PORT || 3001;

// ─── MIDDLEWARE ──────────────────────────────────────────────────
app.use(cors({
  origin: '*', // In production, restrict to your app domain
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── ROUTES ──────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'FarmFresh API',
    timestamp: new Date().toISOString(),
  });
});

app.use('/api/auth',     authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart',     cartRoutes);
app.use('/api/orders',   orderRoutes);
app.use('/api/farmer',   farmerRoutes);  
app.use('/api/farmers',  farmersPublicRouter); 

// ─── 404 HANDLER ────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.url} not found` });
});

// ─── ERROR HANDLER ──────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// ─── START ───────────────────────────────────────────────────────
async function start() {
  await db.initialize();   // Verifies Supabase (PostgreSQL) connectivity
  app.listen(PORT, () => {
    console.log(`\n🌿 FarmFresh API running on http://localhost:${PORT}`);
    console.log(`📋 Health check: http://localhost:${PORT}/api/health\n`);
  });
}

start().catch(err => {
  console.error('Server startup failed:', err);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  await db.close();   // Drains the pg connection pool
  process.exit(0);
});
