const { Pool } = require('pg');
require('dotenv').config();

// Create a connection pool using the DATABASE_URL from .env
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }, // Required for Supabase
});

async function initialize() {
  if (!process.env.DATABASE_URL) {
    console.error('❌ ERROR: DATABASE_URL is missing! Please set it in your Render environment variables.');
    process.exit(1);
  }
  try {
    const client = await pool.connect();
    console.log('✅ Supabase (PostgreSQL) connection pool created');
    client.release();
  } catch (err) {
    console.error('❌ Failed to connect to Supabase:', err.message);
    console.error('Full Error:', err);
    process.exit(1);
  }
}

async function getConnection() {
  return await pool.connect();
}

async function close() {
  await pool.end();
  console.log('PostgreSQL pool closed');
}

/**
 * Execute a SQL query and return the result rows as plain objects.
 * Uses $1, $2, ... placeholders (PostgreSQL style).
 * @param {string} sql    - SQL statement
 * @param {Array}  params - positional parameters
 */
async function execute(sql, params = []) {
  const result = await pool.query(sql, params);
  return result;
}

module.exports = { initialize, getConnection, execute, close, pool };
