/**
 * Reset (drop + recreate) the database specified by DATABASE_URL.
 *
 * Safety:
 * - Only allows localhost/127.0.0.1 to avoid accidental production drops.
 *
 * Usage:
 *   node backend/db/reset.js
 */
import 'dotenv/config';
import pg from 'pg';
import { DATABASE_URL } from './config.js';

const { Client } = pg;

function quoteIdent(ident) {
  // Double-quote identifier and escape embedded quotes
  return `"${String(ident).replaceAll('"', '""')}"`;
}

async function main() {
  if (!DATABASE_URL || DATABASE_URL.trim() === '') {
    console.error('❌ DATABASE_URL is not set. Add it to .env and try again.');
    process.exit(1);
  }

  const url = new URL(DATABASE_URL);
  const dbName = (url.pathname || '').replace(/^\//, '');

  if (!dbName) {
    console.error('❌ DATABASE_URL is missing a database name (e.g. /techmaster).');
    process.exit(1);
  }

  const host = url.hostname;
  if (host !== 'localhost' && host !== '127.0.0.1') {
    console.error(
      `❌ Refusing to reset non-local database host "${host}". Update DATABASE_URL to localhost/127.0.0.1 if you really intend to reset a local DB.`
    );
    process.exit(1);
  }

  // Connect to maintenance DB to be able to drop/create the target DB.
  const adminUrl = new URL(DATABASE_URL);
  adminUrl.pathname = '/postgres';

  const client = new Client({ connectionString: adminUrl.toString() });
  await client.connect();

  try {
    console.log(`⚠️  Resetting database ${dbName} on ${host}:${url.port || 5432} ...`);

    // Terminate active connections so DROP DATABASE works.
    await client.query(
      `SELECT pg_terminate_backend(pid)
       FROM pg_stat_activity
       WHERE datname = $1 AND pid <> pg_backend_pid()`,
      [dbName]
    );

    await client.query(`DROP DATABASE IF EXISTS ${quoteIdent(dbName)}`);
    await client.query(`CREATE DATABASE ${quoteIdent(dbName)}`);

    console.log('✅ Database reset complete.');
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error('❌ Database reset failed:', err?.message || err);
  process.exit(1);
});

