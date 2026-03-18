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

  const body = {
      name: "Teste Lead",
      phone: "11999999999",
      email: "",
      company: "Teste",
      status: "new",
      value: 100,
      description: "Teste"
  };

  const { customer_id, name, email, phone, company, title, description, value, status, priority } = body;

  try {
    const [result] = await pool.execute(
      'INSERT INTO leads (customer_id, name, email, phone, company, title, description, value, status, priority, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())',
      [customer_id || null, name, email, phone, company, title, description, value || 0, status || 'new', priority || 'medium']
    );
    console.log('Sucesso', result);
  } catch (error) {
    console.error('Erro:', error.message);
  }
  
  process.exit();
}

test();
