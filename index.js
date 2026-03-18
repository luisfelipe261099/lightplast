import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import mysql from 'mysql2/promise';

dotenv.config();

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Servir arquivos estáticos (HTML, CSS, JS)
app.use(express.static(__dirname));

// Rota raiz explícita para evitar "Cannot GET /" em ambiente serverless
app.get('/', (req, res) => {
  res.sendFile(join(__dirname, 'index.html'));
});

// Rewrite /crm para tela de login fictícia antes do dashboard
app.get('/crm', (req, res) => {
  res.sendFile(join(__dirname, 'crm-login.html'));
});

app.get('/crm-login', (req, res) => {
  res.sendFile(join(__dirname, 'crm-login.html'));
});

const staticPageRoutes = {
  '/catalogo': 'catalogo.html',
  '/sobre': 'sobre.html',
  '/blog': 'blog.html',
  '/categoria/sacos-de-lixo': 'categoria-sacos-de-lixo.html',
  '/categoria/sacolas-personalizadas': 'categoria-sacolas-personalizadas.html',
  '/categoria/filmes-tecnicos': 'categoria-filmes-tecnicos.html',
  '/produto/saco-lixo-hospitalar': 'produto-saco-lixo-hospitalar.html',
  '/produto/saco-hamper-fita': 'produto-saco-hamper-fita.html',
  '/produto/saco-coleta-seletiva': 'produto-saco-coleta-seletiva.html',
  '/produto/sacola-personalizada': 'produto-sacola-personalizada.html',
  '/produto/filme-stretch': 'produto-filme-stretch.html',
  '/produto/bobina-picotada': 'produto-bobina-picotada.html',
  '/produto/saco-compostavel-lightgreen': 'produto-saco-compostavel-lightgreen.html',
  '/produto/saco-hospitalar-20l': 'produto-saco-hospitalar-20l.html',
  '/produto/saco-hospitalar-30l': 'produto-saco-hospitalar-30l.html',
  '/produto/saco-hospitalar-50l': 'produto-saco-hospitalar-50l.html',
  '/produto/saco-hospitalar-100l': 'produto-saco-hospitalar-100l.html',
  '/produto/saco-infectante-100l': 'produto-saco-infectante-100l.html',
  '/produto/saco-institucional-100l': 'produto-saco-institucional-100l.html',
  '/blog/como-escolher-saco-hospitalar': 'blog-como-escolher-saco-hospitalar.html',
  '/blog/coleta-seletiva-empresas': 'blog-coleta-seletiva-empresas.html',
  '/blog/capacidade-saco-hospitalar-20-30-50-100l': 'blog-capacidade-saco-hospitalar-20-30-50-100l.html',
  '/blog/diferenca-saco-infectante-e-institucional': 'blog-diferenca-saco-infectante-e-institucional.html',
};

Object.entries(staticPageRoutes).forEach(([route, fileName]) => {
  app.get(route, (req, res) => {
    res.sendFile(join(__dirname, fileName));
  });
});

// Database connection pool
let pool = null;

async function initDatabase() {
  try {
    pool = await mysql.createPool({
      connectionLimit: 10,
      host: process.env.TIDB_HOST,
      port: process.env.TIDB_PORT || 4000,
      user: process.env.TIDB_USER,
      password: process.env.TIDB_PASSWORD,
      database: process.env.TIDB_DATABASE,
      charset: 'utf8mb4',
      supportBigNumbers: true,
      bigNumberStrings: true,
      waitForConnections: true,
      enableKeepAlive: true,
    });

    console.log('✅ Banco de dados conectado');
  } catch (error) {
    console.error('❌ Erro ao conectar banco de dados:', error.message);
  }
}

// Inicializar banco de dados
initDatabase();

// Função para executar queries
const query = async (sql, args) => {
  if (!pool) {
    throw new Error('Pool de banco de dados não inicializado');
  }
  const connection = await pool.getConnection();
  try {
    const [results] = await connection.execute(sql, args || []);
    return results;
  } finally {
    connection.release();
  }
};

// ==================== HEALTH CHECK ====================
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    database: pool ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  });
});

// ==================== CUSTOMERS ====================
app.get('/api/customers', async (req, res) => {
  try {
    const { search } = req.query;
    let sql = 'SELECT * FROM customers';
    let params = [];

    if (search) {
      sql += ' WHERE name LIKE ? OR email LIKE ? OR phone LIKE ? OR company LIKE ?';
      params = [`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`];
    }

    sql += ' ORDER BY last_contact DESC LIMIT 100';
    const customers = await query(sql, params);
    res.json({ success: true, data: customers });
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/customers', async (req, res) => {
  try {
    const { name, email, phone, company, status, source, notes } = req.body;
    
    if (!name || !phone) {
      return res.status(400).json({ success: false, error: 'Nome e telefone são obrigatórios' });
    }

    const result = await query(
      'INSERT INTO customers (name, email, phone, company, status, source, notes, created_at, last_contact) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())',
      [name, email, phone, company, status || 'prospect', source || 'website', notes]
    );
    res.json({ success: true, id: result.insertId });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.put('/api/customers/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, company, status, source, notes } = req.body;
    await query(
      'UPDATE customers SET name=?, email=?, phone=?, company=?, status=?, source=?, notes=?, last_contact=NOW() WHERE id=?',
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
    const { search, status } = req.query;
    let sql = 'SELECT * FROM leads WHERE 1=1';
    let params = [];

    if (search) {
      sql += ' AND (name LIKE ? OR phone LIKE ? OR email LIKE ? OR company LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (status) {
      sql += ' AND status = ?';
      params.push(status);
    }

    sql += ' ORDER BY created_at DESC LIMIT 100';
    const leads = await query(sql, params);
    res.json({ success: true, data: leads });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/leads', async (req, res) => {
  try {
    const { customer_id, name, email, phone, company, title, description, value, status, priority } = req.body;
    
    if (!name || !phone) {
      return res.status(400).json({ success: false, error: 'Nome e telefone são obrigatórios' });
    }

    const result = await query(
      'INSERT INTO leads (customer_id, name, email, phone, company, title, description, value, status, priority, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())',
      [customer_id || null, name, email, phone, company, title, description, value || 0, status || 'new', priority || 'medium']
    );
    res.json({ success: true, id: result.insertId });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.put('/api/leads/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, company, status, value, priority, description } = req.body;
    await query(
      'UPDATE leads SET name=?, email=?, phone=?, company=?, status=?, value=?, priority=?, description=?, updated_at=NOW() WHERE id=?',
      [name, email, phone, company, status, value, priority, description, id]
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.delete('/api/leads/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await query('DELETE FROM leads WHERE id=?', [id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==================== BUDGETS ====================
app.get('/api/budgets', async (req, res) => {
  try {
    const { search, status } = req.query;
    let sql = 'SELECT b.*, c.name as customer_name FROM budgets b JOIN customers c ON b.customer_id = c.id WHERE 1=1';
    let params = [];

    if (search) {
      sql += ' AND (b.title LIKE ? OR c.name LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    if (status) {
      sql += ' AND b.status = ?';
      params.push(status);
    }

    sql += ' ORDER BY b.created_at DESC LIMIT 100';
    const budgets = await query(sql, params);
    res.json({ success: true, data: budgets });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/budgets', async (req, res) => {
  try {
    const { customer_id, title, description, total_value, status, tax, discount, valid_until } = req.body;
    
    if (!customer_id || !title || !total_value) {
      return res.status(400).json({ success: false, error: 'Cliente, título e valor são obrigatórios' });
    }

    const result = await query(
      'INSERT INTO budgets (customer_id, title, description, total_value, status, tax, discount, valid_until, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())',
      [customer_id, title, description, total_value, status || 'draft', tax || 0, discount || 0, valid_until]
    );
    res.json({ success: true, id: result.insertId });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
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

// ==================== ORDERS ====================
app.get('/api/orders', async (req, res) => {
  try {
    const { search, status } = req.query;
    let sql = 'SELECT o.*, c.name as customer_name FROM orders o JOIN customers c ON o.customer_id = c.id WHERE 1=1';
    let params = [];

    if (search) {
      sql += ' AND (c.name LIKE ? OR o.id LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    if (status) {
      sql += ' AND o.status = ?';
      params.push(status);
    }

    sql += ' ORDER BY o.created_at DESC LIMIT 100';
    const orders = await query(sql, params);
    res.json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/orders', async (req, res) => {
  try {
    const { customer_id, budget_id, value, status, description } = req.body;
    
    if (!customer_id || !value) {
      return res.status(400).json({ success: false, error: 'Cliente e valor são obrigatórios' });
    }

    const result = await query(
      'INSERT INTO orders (customer_id, budget_id, value, status, description, created_at, updated_at) VALUES (?, ?, ?, ?, ?, NOW(), NOW())',
      [customer_id, budget_id || null, value, status || 'pending', description]
    );
    res.json({ success: true, id: result.insertId });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.put('/api/orders/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    await query('UPDATE orders SET status=?, updated_at=NOW() WHERE id=?', [status, id]);
    res.json({ success: true });
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
    if (!pool) {
      return res.json({
        success: true,
        data: {
          totalCustomers: 0,
          qualifiedLeads: 0,
          pendingFollowUps: 0,
          totalRevenue: 0
        },
        message: 'Banco de dados não conectado - dados fictícios'
      });
    }

    const [totalCustomers] = await query('SELECT COUNT(*) as count FROM customers');
    const [qualifiedLeads] = await query('SELECT COUNT(*) as count FROM leads WHERE status IN ("qualified", "contacted")');
    const [pendingFollowUps] = await query('SELECT COUNT(*) as count FROM follow_ups WHERE completed = 0');
    const [totalRevenue] = await query('SELECT SUM(value) as total FROM orders WHERE status IN ("confirmed", "completed")');
    
    res.json({
      success: true,
      data: {
        totalCustomers: totalCustomers?.count || 0,
        qualifiedLeads: qualifiedLeads?.count || 0,
        pendingFollowUps: pendingFollowUps?.count || 0,
        totalRevenue: parseFloat(totalRevenue?.total) || 0
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==================== EXPORTS ====================
app.get('/api/export/customers', async (req, res) => {
  try {
    const customers = await query('SELECT id, name, email, phone, company, status, source, created_at FROM customers ORDER BY created_at DESC');
    
    let csv = 'ID,Nome,Email,Telefone,Empresa,Status,Origem,Data de Criação\n';
    customers.forEach(c => {
      csv += `"${c.id}","${c.name}","${c.email || ''}","${c.phone}","${c.company || ''}","${c.status}","${c.source || ''}","${c.created_at}"\n`;
    });

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="clientes.csv"');
    res.send(csv);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/export/orders', async (req, res) => {
  try {
    const orders = await query('SELECT o.id, c.name, o.value, o.status, o.created_at FROM orders o JOIN customers c ON o.customer_id = c.id ORDER BY o.created_at DESC');
    
    let csv = 'ID,Cliente,Valor,Status,Data de Criação\n';
    orders.forEach(o => {
      csv += `"${o.id}","${o.name}","R$ ${parseFloat(o.value).toFixed(2)}","${o.status}","${o.created_at}"\n`;
    });

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="pedidos.csv"');
    res.send(csv);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==================== FINANCIAL REPORTS ====================
app.get('/api/reports/summary', async (req, res) => {
  try {
    const [currentMonth] = await query(`
      SELECT 
        SUM(value) as total_revenue, 
        COUNT(*) as total_orders
      FROM orders 
      WHERE MONTH(created_at) = MONTH(NOW()) 
      AND YEAR(created_at) = YEAR(NOW())
      AND status IN ("confirmed", "completed")
    `);

    const [previousMonth] = await query(`
      SELECT 
        SUM(value) as total_revenue
      FROM orders 
      WHERE MONTH(created_at) = MONTH(DATE_SUB(NOW(), INTERVAL 1 MONTH))
      AND YEAR(created_at) = YEAR(DATE_SUB(NOW(), INTERVAL 1 MONTH))
      AND status IN ("confirmed", "completed")
    `);

    const currentRev = currentMonth?.total_revenue || 0;
    const previousRev = previousMonth?.total_revenue || 0;
    const percentChange = previousRev > 0 ? (((currentRev - previousRev) / previousRev) * 100).toFixed(2) : 0;

    res.json({
      success: true,
      data: {
        currentMonthRevenue: parseFloat(currentRev),
        currentMonthOrders: currentMonth?.total_orders || 0,
        previousMonthRevenue: parseFloat(previousRev),
        percentChange: parseFloat(percentChange),
        averageTicket: (currentMonth?.total_orders > 0) ? (currentRev / currentMonth.total_orders).toFixed(2) : 0
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/reports/monthly', async (req, res) => {
  try {
    const data = await query(`
      SELECT 
        DATE_FORMAT(created_at, '%Y-%m') as month,
        SUM(value) as total_revenue,
        COUNT(*) as order_count
      FROM orders
      WHERE status IN ("confirmed", "completed")
      GROUP BY DATE_FORMAT(created_at, '%Y-%m')
      ORDER BY month DESC
      LIMIT 12
    `);

    res.json({
      success: true,
      data: data.reverse()
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/reports/top-clients', async (req, res) => {
  try {
    const topClients = await query(`
      SELECT 
        c.id,
        c.name,
        c.company,
        SUM(o.value) as total_spent,
        COUNT(o.id) as order_count
      FROM customers c
      LEFT JOIN orders o ON c.id = o.customer_id AND o.status IN ("confirmed", "completed")
      GROUP BY c.id
      ORDER BY total_spent DESC
      LIMIT 10
    `);

    res.json({
      success: true,
      data: topClients
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/reports/weekly', async (req, res) => {
  try {
    const weekly = await query(`
      SELECT 
        DATE_FORMAT(created_at, '%W') as week,
        DATE_FORMAT(created_at, '%Y-%m-%d') as date,
        SUM(value) as total_revenue,
        COUNT(*) as order_count
      FROM orders
      WHERE status IN ("confirmed", "completed")
      AND created_at >= DATE_SUB(NOW(), INTERVAL 8 WEEK)
      GROUP BY WEEK(created_at)
      ORDER BY created_at DESC
    `);

    res.json({
      success: true,
      data: weekly
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Start server apenas em ambiente local (no Vercel, exportamos o app)
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`CRM Dashboard: http://localhost:${PORT}/crm`);
  });
}

export default app;
