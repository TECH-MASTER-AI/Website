/**
 * Database configuration. Uses DATABASE_URL from environment.
 * Supports PostgreSQL (e.g. postgresql://user:pass@host:5432/dbname).
 */
import 'dotenv/config';

const DATABASE_URL = process.env.DATABASE_URL;

const poolConfig = {
  connectionString: DATABASE_URL,
  max: parseInt(process.env.DB_POOL_MAX || '20', 10),
  min: parseInt(process.env.DB_POOL_MIN || '2', 10),
  idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT_MS || '30000', 10),
  connectionTimeoutMillis: parseInt(process.env.DB_CONNECT_TIMEOUT_MS || '5000', 10),
  allowExitOnIdle: true,
};

export { DATABASE_URL, poolConfig };
