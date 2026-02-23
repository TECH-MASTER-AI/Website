/**
 * Run Comments Migration
 * This script creates the comments tables in your database
 */
import 'dotenv/config';
import { readFileSync } from 'fs';
import { getPool, closePool } from './db/pool.js';

async function runMigration() {
    const pool = getPool();
    
    if (!pool) {
        console.error('❌ DATABASE_URL is not set. Add it to .env and try again.');
        process.exit(1);
    }

    try {
        console.log('🔄 Running comments migration...\n');
        
        // Read the migration file
        const migrationSQL = readFileSync('./backend/db/migrations/002_comments.sql', 'utf8');
        
        // Execute the migration
        await pool.query(migrationSQL);
        
        console.log('✅ Comments tables created successfully!');
        console.log('\nCreated tables:');
        console.log('  - problem_comments');
        console.log('  - comment_likes');
        console.log('\nYou can now use the Discussions tab in the problem page!');
        
    } catch (error) {
        console.error('❌ Migration failed:', error.message);
        process.exit(1);
    } finally {
        await closePool();
    }
}

runMigration();
