/**
 * Seed DSA questions into PostgreSQL.
 * Usage: node init/seed.js
 * Requires: DATABASE_URL in .env, run npm run db:init first
 */
import 'dotenv/config';
import { query, getPool, closePool } from '../backend/db/pool.js';
import questions from './data.js';

async function seedQuestions({ reset = false } = {}) {
  const pool = getPool();
  if (!pool) {
    console.error('❌ DATABASE_URL is not set. Add it to .env and try again.');
    process.exit(1);
  }

  try {
    if (reset) {
      console.log('⚠️ Deleting all existing questions...');
      await query('DELETE FROM questions');
      await query('ALTER SEQUENCE questions_id_seq RESTART WITH 1');
      console.log('🗑️ All questions deleted');
    }

    for (const q of questions) {
      await query(
        `INSERT INTO questions (
          title, slug, description, difficulty,
          topics, companies, tags, examples, constraints, test_cases,
          acceptance_rate, likes, dislikes, is_premium
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
        ON CONFLICT (title) DO NOTHING`,
        [
          q.title,
          q.slug || q.title.toLowerCase().replace(/\s+/g, '-'),
          q.description,
          q.difficulty,
          q.topics ? JSON.stringify(q.topics) : null,
          q.companies ? JSON.stringify(q.companies) : null,
          q.tags ? JSON.stringify(q.tags) : null,
          q.examples ? JSON.stringify(q.examples) : null,
          q.constraints ? JSON.stringify(q.constraints) : null,
          q.testCases ? JSON.stringify(q.testCases) : null,
          q.acceptanceRate ?? 0,
          q.likes ?? 0,
          q.dislikes ?? 0,
          q.isPremium ?? false,
        ]
      );
      console.log('✅ Inserted:', q.title);
    }

    console.log('🎉 Seeding completed');
  } catch (err) {
    console.error('❌ Seeding failed:', err.message);
    process.exit(1);
  } finally {
    await closePool();
  }
}

seedQuestions({ reset: true });
