/**
 * Initialize database: run schema.sql.
 * Usage: node backend/db/init.js
 * Requires DATABASE_URL in .env.
 */
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { getPool, query } from './pool.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const schemaPath = join(__dirname, 'schema.sql');

async function init() {
  const pool = getPool();
  if (!pool) {
    console.error('❌ DATABASE_URL is not set. Add it to .env and try again.');
    process.exit(1);
  }
  try {
    const sql = readFileSync(schemaPath, 'utf8');
    await pool.query(sql);
    console.log('✅ Schema applied successfully.');
  } catch (err) {
    console.error('❌ Schema init failed:', err.message);
    process.exit(1);
  } finally {
    await import('./pool.js').then((m) => m.closePool());
  }
}

init();
