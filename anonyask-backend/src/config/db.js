import pg from 'pg';
const { Pool } = pg;

const isLocal = process.env.DATABASE_URL?.includes('localhost') || process.env.DATABASE_URL?.includes('127.0.0.1');

const db = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: isLocal ? false : { rejectUnauthorized: false },
});

db.on('error', (err) => console.error('Unexpected DB error', err));

export default db;
