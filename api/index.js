import express from 'express';
import cors from 'cors';
import mysql from 'mysql2';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

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
    rejectUnauthorized: false // Alterado para false para garantir compatibilidade em ambientes serverless
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

const pickCustomerId = (body) => body.customer_id || body.contact_id || null;

const safeJsonItems = (items) => {
  if (!items) return '[]';
  if (typeof items === 'string') return items;
  return JSON.stringify(items);
};

// ==================== CUSTOMERS ====================
app.get('/api/customers', async (req, res) => {
  try {
    const customers = await query(
      `SELECT c.*, COUNT(o.id) AS total_orders, COALESCE(SUM(o.value), 0) AS total_spent
       FROM customers c
       LEFT JOIN orders o ON o.customer_id = c.id
       GROUP BY c.id
       ORDER BY c.last_contact DESC
       LIMIT 100`
    );
    res.json({ success: true, data: customers });
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});
app.get('/api/customers.php', async (req, res) => {
  req.url = '/api/customers';
  return app._router.handle(req, res);
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
app.post('/api/customers.php', async (req, res) => {
  req.url = '/api/customers';
  return app._router.handle(req, res);
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
    const leads = await query(
      `SELECT l.*, c.name, c.phone
       FROM leads l
       LEFT JOIN customers c ON c.id = l.customer_id
       ORDER BY l.created_at DESC
       LIMIT 100`
    );
    const normalized = leads.map((lead) => ({ ...lead, score: lead.value ? Math.min(100, Math.round(Number(lead.value) / 1000)) : 0 }));
    res.json({ success: true, data: normalized });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
app.get('/api/leads.php', async (req, res) => {
  req.url = '/api/leads';
  return app._router.handle(req, res);
});

app.post('/api/leads', async (req, res) => {
  try {
    const { customer_id, title, description, value, status, priority, name, phone, email, company, source } = req.body;

    let finalCustomerId = customer_id || null;
    if (!finalCustomerId && name) {
      const customerResult = await query(
        'INSERT INTO customers (name, email, phone, company, status, source, notes, created_at, last_contact) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())',
        [name, email || null, phone || null, company || null, 'prospect', source || 'website', 'Criado automaticamente a partir do lead']
      );
      finalCustomerId = customerResult.insertId;
    }

    const result = await query(
      'INSERT INTO leads (customer_id, title, description, value, status, priority, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())',
      [finalCustomerId, title || `Lead - ${name || 'Sem nome'}`, description || 'Lead criado pelo CRM', value || 0, status || 'open', priority || 'medium']
    );
    res.json({ success: true, id: result.insertId });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
app.post('/api/leads.php', async (req, res) => {
  req.url = '/api/leads';
  return app._router.handle(req, res);
});

// ==================== BUDGETS ====================
app.get('/api/budgets', async (req, res) => {
  try {
    const budgets = await query(
      `SELECT b.*, c.name AS customer_name, b.total_value AS total,
              CONCAT('ORC-', LPAD(b.id, 5, '0')) AS budget_number
       FROM budgets b
       LEFT JOIN customers c ON c.id = b.customer_id
       ORDER BY b.created_at DESC
       LIMIT 100`
    );
    res.json({ success: true, data: budgets });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
app.get('/api/budgets.php', async (req, res) => {
  req.url = '/api/budgets';
  return app._router.handle(req, res);
});

app.post('/api/budgets', async (req, res) => {
  try {
    const { customer_id, title, description, items, total_value, status, tax, discount } = req.body;
    const parsedItems = safeJsonItems(items);
    const itemList = typeof items === 'string' ? JSON.parse(items || '[]') : items || [];
    const computedTotal = total_value || itemList.reduce((sum, i) => sum + ((Number(i.quantity) || 0) * (Number(i.unit_price || i.unitPrice) || 0)), 0);
    const result = await query(
      'INSERT INTO budgets (customer_id, title, description, items, total_value, status, tax, discount, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())',
      [customer_id, title, description, parsedItems, computedTotal, status || 'draft', tax || 0, discount || 0]
    );
    res.json({ success: true, id: result.insertId });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
app.post('/api/budgets.php', async (req, res) => {
  req.url = '/api/budgets';
  return app._router.handle(req, res);
});

app.put('/api/budgets/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    await query('UPDATE budgets SET status=?, updated_at=NOW() WHERE id=?', [status, id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
app.put('/api/budgets.php/:id', async (req, res) => {
  req.url = `/api/budgets/${req.params.id}`;
  return app._router.handle(req, res);
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
    const orders = await query(
      `SELECT o.*, CONCAT('PED-', LPAD(o.id, 5, '0')) AS order_number,
              'Servico' AS product_type
       FROM orders o
       ORDER BY o.created_at DESC
       LIMIT 100`
    );
    res.json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
app.get('/api/orders.php', async (req, res) => {
  req.url = '/api/orders';
  return app._router.handle(req, res);
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
app.post('/api/orders.php', async (req, res) => {
  req.url = '/api/orders';
  return app._router.handle(req, res);
});

// ==================== FOLLOW-UPS ====================
app.get('/api/follow-ups', async (req, res) => {
  try {
    const followUps = await query(
      `SELECT f.*, c.name AS contact_name,
              f.type AS follow_up_type,
              CASE WHEN f.completed = 1 THEN 'completed' ELSE 'pending' END AS status
       FROM follow_ups f
       LEFT JOIN customers c ON c.id = f.customer_id
       ORDER BY f.scheduled_date ASC
       LIMIT 100`
    );
    res.json({ success: true, data: followUps });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
app.get('/api/follow-ups.php', async (req, res) => {
  req.url = '/api/follow-ups';
  return app._router.handle(req, res);
});

app.post('/api/follow-ups', async (req, res) => {
  try {
    const { customer_id, type, description, scheduled_date, follow_up_type, title } = req.body;
    const fallbackCustomer = await query('SELECT id FROM customers ORDER BY id ASC LIMIT 1');
    const selectedCustomer = pickCustomerId(req.body) || (fallbackCustomer[0] ? fallbackCustomer[0].id : null);
    const result = await query(
      'INSERT INTO follow_ups (customer_id, type, description, scheduled_date, completed, created_at) VALUES (?, ?, ?, ?, 0, NOW())',
      [selectedCustomer, type || follow_up_type || 'call', description || title || 'Follow-up', scheduled_date]
    );
    res.json({ success: true, id: result.insertId });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
app.post('/api/follow-ups.php', async (req, res) => {
  req.url = '/api/follow-ups';
  return app._router.handle(req, res);
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
app.get('/api/dashboard.php', async (req, res) => {
  req.url = '/api/dashboard';
  return app._router.handle(req, res);
});

app.get('/api/budgets.php/:id/pdf', async (req, res) => {
  const { id } = req.params;
  res.status(200).send(`PDF temporario indisponivel no serverless. Orcamento ID: ${id}`);
});

// Endpoint de teste/debug
app.get('/api/debug', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    config: {
      host: process.env.TIDB_HOST ? 'Configurado' : 'Padrao',
      user: process.env.TIDB_USER ? 'Configurado' : 'Padrao'
    }
  });
});

export default app;
