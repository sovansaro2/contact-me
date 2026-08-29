import pg from 'pg';
const host = '1fvef1mteioqiy.sabay.com';
const port = 16011;
const user = 'root';
const password = 'Contactme2026';

async function testConnection(dbName) {
  const pool = new pg.Pool({
    host, port, user, password, database: dbName,
    ssl: { rejectUnauthorized: false } // often required for external cloud DBs
  });
  try {
    const res = await pool.query('SELECT NOW()');
    console.log(`Success with db: ${dbName} ->`, res.rows[0].now);
    return true;
  } catch (err) {
    console.log(`Failed with db: ${dbName} ->`, err.message);
    return false;
  } finally {
    await pool.end();
  }
}

async function run() {
  const dbs = ['contact-me-db', 'postgres', 'defaultdb', 'root'];
  for (const db of dbs) {
    const success = await testConnection(db);
    if (success) break;
  }
}
run();
