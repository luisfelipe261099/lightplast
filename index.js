import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import mysql from 'mysql2';

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

// Database connection
const pool = mysql.createPool({
  connectionLimit: 10,
  host: process.env.TIDB_HOST || 'gateway01.us-east-1.prod.aws.tidbcloud.com',
  port: process.env.TIDB_PORT || 4000,
  user: process.env.TIDB_USER || 'wYESZBLpQwYM5hn.root',
  password: process.env.TIDB_PASSWORD || 'GJlg4N2UHGauRmG7',
  database: process.env.TIDB_DATABASE || 'test',
  ssl: {
    minVersion: 'TLSv1.2',
    rejectUnauthorized: false // Alterado para false para garantir compatibilidade
  },
  charset: 'utf8mb4',
  waitForConnections: true,
  queueLimit: 0
});

const query = (sql, args) => new Promise((resolve, reject) => {
  pool.query(sql, args, (err, results) => {
    if (err) return reject(err);
    resolve(results);
  });
});

// ==================== CUSTOMERS ====================
app.get('/api/customers', async (req, res) => {
  try {
    const customers = await query('SELECT * FROM customers ORDER BY last_contact DESC LIMIT 100');
    res.json({ success: true, data: customers });
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/customers', async (req, res) => {
  try {
    const { name, email, phone, company, status, source, notes } = req.body;
    const result = await query(
      'INSERT INTO customers (name, email, phone, company, status, source, notes, created_at, last_contact) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())',
      [name, email, phone, company, status || 'prospect', source, notes]
    );
    res.json({ success: true, id: result.insertId });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.put('/api/customers', async (req, res) => {
  try {
    const { id, name, email, phone, company, status, source, notes } = req.body;
    await query(
      'UPDATE customers SET name=?, email=?, phone=?, company=?, status=?, source=?, notes=? WHERE id=?',
      [name, email, phone, company, status, source, notes, id]
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.delete('/api/customers/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await query('DELETE FROM customers WHERE id=?', [id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==================== LEADS ====================
app.get('/api/leads', async (req, res) => {
  try {
    const leads = await query('SELECT * FROM leads ORDER BY created_at DESC LIMIT 100');
    res.json({ success: true, data: leads });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/leads', async (req, res) => {
  try {
    const { customer_id, title, description, value, status, priority } = req.body;
    const result = await query(
      'INSERT INTO leads (customer_id, title, description, value, status, priority, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())',
      [customer_id, title, description, value, status || 'open', priority || 'medium']
    );
    res.json({ success: true, id: result.insertId });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==================== BUDGETS ====================
app.get('/api/budgets', async (req, res) => {
  try {
    const budgets = await query('SELECT * FROM budgets ORDER BY created_at DESC LIMIT 100');
    res.json({ success: true, data: budgets });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/budgets', async (req, res) => {
  try {
    const { customer_id, title, description, items, total_value, status, tax, discount } = req.body;
    const result = await query(
      'INSERT INTO budgets (customer_id, title, description, items, total_value, status, tax, discount, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())',
      [customer_id, title, description, JSON.stringify(items), total_value, status || 'draft', tax || 0, discount || 0]
    );
    res.json({ success: true, id: result.insertId });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.put('/api/budgets', async (req, res) => {
  try {
    const { id, status } = req.body;
    await query('UPDATE budgets SET status=?, updated_at=NOW() WHERE id=?', [status, id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==================== ORDERS ====================
app.get('/api/orders', async (req, res) => {
  try {
    const orders = await query('SELECT * FROM orders ORDER BY created_at DESC LIMIT 100');
    res.json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/orders', async (req, res) => {
  try {
    const { customer_id, budget_id, value, status } = req.body;
    const result = await query(
      'INSERT INTO orders (customer_id, budget_id, value, status, created_at, updated_at) VALUES (?, ?, ?, ?, NOW(), NOW())',
      [customer_id, budget_id || null, value, status || 'pending']
    );
    res.json({ success: true, id: result.insertId });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==================== FOLLOW-UPS ====================
app.get('/api/follow-ups', async (req, res) => {
  try {
    const followUps = await query('SELECT * FROM follow_ups ORDER BY scheduled_date ASC LIMIT 100');
    res.json({ success: true, data: followUps });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/follow-ups', async (req, res) => {
  try {
    const { customer_id, type, description, scheduled_date } = req.body;
    const result = await query(
      'INSERT INTO follow_ups (customer_id, type, description, scheduled_date, completed, created_at) VALUES (?, ?, ?, ?, 0, NOW())',
      [customer_id, type, description, scheduled_date]
    );
    res.json({ success: true, id: result.insertId });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==================== DASHBOARD ====================
app.get('/api/dashboard', async (req, res) => {
  try {
    const [totalCustomers] = await query('SELECT COUNT(*) as count FROM customers');
    const [totalLeads] = await query('SELECT COUNT(*) as count FROM leads');
    const [pendingFollowUps] = await query('SELECT COUNT(*) as count FROM follow_ups WHERE completed = 0');
    const [totalRevenue] = await query('SELECT SUM(value) as total FROM orders WHERE status = "confirmed"');
    const recentFollowUps = await query(
      `SELECT f.scheduled_date, f.type AS follow_up_type, COALESCE(c.name, 'Sem contato') AS contact_name
       FROM follow_ups f
       LEFT JOIN customers c ON c.id = f.customer_id
       ORDER BY f.scheduled_date ASC
       LIMIT 5`
    );
    const topCustomers = await query(
      `SELECT c.name, c.company, c.phone, COALESCE(SUM(o.value), 0) AS total_spent
       FROM customers c
       LEFT JOIN orders o ON o.customer_id = c.id
       GROUP BY c.id
       ORDER BY total_spent DESC
       LIMIT 5`
    );
    
    res.json({
      success: true,
      data: {
        totalCustomers: totalCustomers?.count || 0,
        qualifiedLeads: totalLeads?.count || 0,
        pendingFollowUps: pendingFollowUps?.count || 0,
        totalRevenue: totalRevenue?.total || 0
      },
      stats: {
        total_customers: totalCustomers?.count || 0,
        total_leads: totalLeads?.count || 0,
        pending_follow_ups: pendingFollowUps?.count || 0,
        total_revenue: totalRevenue?.total || 0
      },
      recent_follow_ups: recentFollowUps,
      top_customers: topCustomers
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==================== PHP COMPATIBILITY ====================
app.get('/api/customers.php', (req, res) => {
  req.url = '/api/customers';
  return app._router.handle(req, res);
});
app.get('/api/leads.php', (req, res) => {
  req.url = '/api/leads';
  return app._router.handle(req, res);
});
app.get('/api/budgets.php', (req, res) => {
  req.url = '/api/budgets';
  return app._router.handle(req, res);
});
app.get('/api/orders.php', (req, res) => {
  req.url = '/api/orders';
  return app._router.handle(req, res);
});
app.get('/api/follow-ups.php', (req, res) => {
  req.url = '/api/follow-ups';
  return app._router.handle(req, res);
});
app.get('/api/dashboard.php', (req, res) => {
  req.url = '/api/dashboard';
  return app._router.handle(req, res);
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 CRM Dashboard: http://localhost:${PORT}/crm`);
});
