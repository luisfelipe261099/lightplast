import dotenv from 'dotenv';
import mysql from 'mysql2/promise';

dotenv.config();

const base = {
  host: process.env.TIDB_HOST,
  port: Number(process.env.TIDB_PORT || 4000),
  user: process.env.TIDB_USER,
  password: process.env.TIDB_PASSWORD,
  database: process.env.TIDB_DATABASE,
};

const tests = [
  { name: 'no-ssl', cfg: {} },
  { name: 'ssl-ru-true', cfg: { ssl: { minVersion: 'TLSv1.2', rejectUnauthorized: true } } },
  { name: 'ssl-ru-false', cfg: { ssl: { minVersion: 'TLSv1.2', rejectUnauthorized: false } } },
  { name: 'ssl-true-short', cfg: { ssl: true } },
];

for (const t of tests) {
  try {
    const conn = await mysql.createConnection({ ...base, ...t.cfg });
    const [rows] = await conn.query('SELECT 1 as ok');
    await conn.end();
    console.log(`${t.name}:OK:${rows[0].ok}`);
  } catch (e) {
    console.log(`${t.name}:ERR:${e.message}`);
  }
}
