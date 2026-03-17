import express from 'express';
import cors from 'cors';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

dotenv.config();

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Servir arquivos estáticos (HTML, CSS, JS)
app.use(express.static(__dirname));

// Rewrite /crm para /crm.html
app.get('/crm', (req, res) => {
  res.sendFile(join(__dirname, 'crm.html'));
});

// Database connection pool
const pool = mysql.createPool({
  host: process.env.TIDB_HOST || 'gateway01us-east1prod.aws.tidbcloud.com',
  port: process.env.TIDB_PORT || 4000,
  user: process.env.TIDB_USER || 'wYESZBLpQwYM5hn.root',
  password: process.env.TIDB_PASSWORD || 'GJlg4N2UHGauRmG7',
  database: process.env.TIDB_DATABASE || 'test',
  waitForConnections: true,
  connectionLimit: 5,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelayMs: 0,
});

// ==================== CUSTOMERS ====================
app.get('/api/customers', async (req, res) => {
  try {
    const conn = await pool.getConnection();
    const [customers] = await conn.query(
      'SELECT * FROM customers ORDER BY last_contact DESC LIMIT 100'
    );
    conn.release();
    res.json({ success: true, data: customers });
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/customers', async (req, res) => {
  try {
    const { name, email, phone, company, status, source, notes } = req.body;
    const conn = await pool.getConnection();
    const [result] = await conn.query(
      'INSERT INTO customers (name, email, phone, company, status, source, notes, created_at, last_contact) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())',
      [name, email, phone, company, status || 'prospect', source, notes]
    );
    conn.release();
    res.json({ success: true, id: result.insertId });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.put('/api/customers', async (req, res) => {
  try {
    const { id, name, email, phone, company, status, source, notes } = req.body;
    const conn = await pool.getConnection();
    await conn.query(
      'UPDATE customers SET name=?, email=?, phone=?, company=?, status=?, source=?, notes=? WHERE id=?',
      [name, email, phone, company, status, source, notes, id]
    );
    conn.release();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.delete('/api/customers/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const conn = await pool.getConnection();
    await conn.query('DELETE FROM customers WHERE id=?', [id]);
    conn.release();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==================== LEADS ====================
app.get('/api/leads', async (req, res) => {
  try {
    const conn = await pool.getConnection();
    const [leads] = await conn.query('SELECT * FROM leads ORDER BY created_at DESC LIMIT 100');
    conn.release();
    res.json({ success: true, data: leads });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/leads', async (req, res) => {
  try {
    const { customer_id, title, description, value, status, priority } = req.body;
    const conn = await pool.getConnection();
    const [result] = await conn.query(
      'INSERT INTO leads (customer_id, title, description, value, status, priority, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())',
      [customer_id, title, description, value, status || 'open', priority || 'medium']
    );
    conn.release();
    res.json({ success: true, id: result.insertId });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==================== BUDGETS ====================
app.get('/api/budgets', async (req, res) => {
  try {
    const conn = await pool.getConnection();
    const [budgets] = await conn.query('SELECT * FROM budgets ORDER BY created_at DESC LIMIT 100');
    conn.release();
    res.json({ success: true, data: budgets });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/budgets', async (req, res) => {
  try {
    const { customer_id, title, description, items, total_value, status, tax, discount } = req.body;
    const conn = await pool.getConnection();
    const [result] = await conn.query(
      'INSERT INTO budgets (customer_id, title, description, items, total_value, status, tax, discount, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())',
      [customer_id, title, description, JSON.stringify(items), total_value, status || 'draft', tax || 0, discount || 0]
    );
    conn.release();
    res.json({ success: true, id: result.insertId });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.put('/api/budgets', async (req, res) => {
  try {
    const { id, status } = req.body;
    const conn = await pool.getConnection();
    await conn.query('UPDATE budgets SET status=?, updated_at=NOW() WHERE id=?', [status, id]);
    conn.release();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==================== ORDERS ====================
app.get('/api/orders', async (req, res) => {
  try {
    const conn = await pool.getConnection();
    const [orders] = await conn.query('SELECT * FROM orders ORDER BY created_at DESC LIMIT 100');
    conn.release();
    res.json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/orders', async (req, res) => {
  try {
    const { customer_id, budget_id, value, status } = req.body;
    const conn = await pool.getConnection();
    const [result] = await conn.query(
      'INSERT INTO orders (customer_id, budget_id, value, status, created_at, updated_at) VALUES (?, ?, ?, ?, NOW(), NOW())',
      [customer_id, budget_id || null, value, status || 'pending']
    );
    conn.release();
    res.json({ success: true, id: result.insertId });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==================== FOLLOW-UPS ====================
app.get('/api/follow-ups', async (req, res) => {
  try {
    const conn = await pool.getConnection();
    const [followUps] = await conn.query('SELECT * FROM follow_ups ORDER BY scheduled_date ASC LIMIT 100');
    conn.release();
    res.json({ success: true, data: followUps });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/follow-ups', async (req, res) => {
  try {
    const { customer_id, type, description, scheduled_date } = req.body;
    const conn = await pool.getConnection();
    const [result] = await conn.query(
      'INSERT INTO follow_ups (customer_id, type, description, scheduled_date, completed, created_at) VALUES (?, ?, ?, ?, 0, NOW())',
      [customer_id, type, description, scheduled_date]
    );
    conn.release();
    res.json({ success: true, id: result.insertId });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==================== DASHBOARD ====================
app.get('/api/dashboard', async (req, res) => {
  try {
    const conn = await pool.getConnection();
    
    const [totalCustomers] = await conn.query('SELECT COUNT(*) as count FROM customers');
    const [qualifiedLeads] = await conn.query('SELECT COUNT(*) as count FROM leads WHERE status = "qualified"');
    const [pendingFollowUps] = await conn.query('SELECT COUNT(*) as count FROM follow_ups WHERE completed = 0');
    const [totalRevenue] = await conn.query('SELECT SUM(value) as total FROM orders WHERE status = "confirmed"');
    
    conn.release();
    
    res.json({
      success: true,
      data: {
        totalCustomers: totalCustomers[0].count,
        qualifiedLeads: qualifiedLeads[0].count,
        pendingFollowUps: pendingFollowUps[0].count,
        totalRevenue: totalRevenue[0].total || 0
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 CRM Dashboard: http://localhost:${PORT}/crm`);
});
