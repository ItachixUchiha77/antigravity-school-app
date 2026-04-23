import 'dotenv/config';
import pg from 'pg';
import { readFileSync } from 'fs';

const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
const sql = readFileSync('./migrations/002_add_image_support.sql', 'utf8');

try {
  await pool.query(sql);
  console.log('Migration 002 applied successfully.');
} catch (e) {
  console.error('Migration error:', e.message);
} finally {
  await pool.end();
}
