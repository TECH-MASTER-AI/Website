/**
 * Database connection for init/seed scripts.
 * Uses PostgreSQL via DATABASE_URL (same as backend/db).
 */
import 'dotenv/config';
import { getPool } from '../backend/db/pool.js';

export function getDb() {
  return getPool();
}

// For backward compatibility: export a pool-like interface
export default {
  get pool() {
    return getPool();
  },
  async query(text, params) {
    const pool = getPool();
    if (!pool) throw new Error('DATABASE_URL is not set. Add it to .env');
    return pool.query(text, params);
  },
};
