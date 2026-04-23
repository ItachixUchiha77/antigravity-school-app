import 'dotenv/config';
import pg from 'pg';
import { readFileSync } from 'fs';

const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
const sql = readFileSync('./migrations/003_add_school_settings.sql', 'utf8');

try {
  await pool.query(sql);
  console.log('Migration 003 applied successfully.');
} catch (e) {
  console.error('Migration error:', e.message);
} finally {
  await pool.end();
}
