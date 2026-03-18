import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

async function test() {
  const pool = await mysql.createPool({
    connectionLimit: 1,
    host: process.env.TIDB_HOST,
    port: process.env.TIDB_PORT || 4000,
    user: process.env.TIDB_USER,
    password: process.env.TIDB_PASSWORD,
    database: process.env.TIDB_DATABASE,
    ssl: {
      minVersion: 'TLSv1.2',
      rejectUnauthorized: true
    }
  });

  const [rows] = await pool.query('SELECT SUM(value) as total FROM orders WHERE status IN ("confirmed", "completed")');
  console.log('Dashboard Query Raw:', rows);

  const [summary] = await pool.query(`
      SELECT 
        SUM(value) as total_revenue, 
        COUNT(*) as total_orders
      FROM orders 
      WHERE MONTH(created_at) = MONTH(NOW()) 
      AND YEAR(created_at) = YEAR(NOW())
      AND status IN ("confirmed", "completed")
  `);
  console.log('Reports Summary Raw:', summary);
  
  process.exit();
}

test();
