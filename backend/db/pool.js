/**
 * PostgreSQL connection pool with solid connection handling:
 * - Pool with configurable size and timeouts
 * - Health check helper
 * - Error listener to avoid unhandled rejections
 * - Graceful shutdown
 */
import pg from 'pg';
import { DATABASE_URL, poolConfig } from './config.js';

const { Pool } = pg;

let pool = null;

/**
 * Get or create the connection pool. Returns null if DATABASE_URL is not set.
 */
export function getPool() {
  if (!DATABASE_URL || DATABASE_URL.trim() === '') {
    return null;
  }
  if (!pool) {
    pool = new Pool(poolConfig);
    pool.on('error', (err) => {
      console.error('⚠️  Database pool error:', err.message);
    });
  }
  return pool;
}

/**
 * Execute a query using the pool. Returns result or throws.
 * Use getPool() first to check if DB is configured.
 */
export async function query(text, params) {
  const p = getPool();
  if (!p) throw new Error('Database not configured: DATABASE_URL is missing');
  const start = Date.now();
  try {
    const res = await p.query(text, params);
    const duration = Date.now() - start;
    if (process.env.NODE_ENV === 'development' && duration > 100) {
      console.warn(`Slow query (${duration}ms):`, text?.slice(0, 80));
    }
    return res;
  } catch (err) {
    console.error('Query error:', err.message);
    throw err;
  }
}

/**
 * Get a client from the pool for transactions. Call client.release() when done.
 */
export async function getClient() {
  const p = getPool();
  if (!p) throw new Error('Database not configured: DATABASE_URL is missing');
  return p.connect();
}

/**
 * Health check: run a simple query. Returns { ok: true } or { ok: false, error }.
 */
export async function healthCheck() {
  const p = getPool();
  if (!p) {
    return { ok: false, error: 'DATABASE_URL not set' };
  }
  try {
    await p.query('SELECT 1');
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

/**
 * Close the pool (call on graceful shutdown).
 */
export async function closePool() {
  if (pool) {
    await pool.end();
    pool = null;
    console.log('✅ Database pool closed');
  }
}
