import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Connection error', err.stack);
  } else {
    console.log('Connected:', res.rows);
  }
  pool.end();
});
