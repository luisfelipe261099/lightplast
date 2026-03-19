import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readdir, readFile, writeFile, stat, unlink, mkdir, rename } from 'fs/promises';
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

// ==================== CMS (SITE CONTENT) ====================
const CMS_EXCLUDED_FILES = new Set([
  'crm-login.html',
  'crm-pro.html',
]);
const CMS_TRASH_DIR = join(__dirname, '.cms-trash');
const CMS_TRASH_INDEX_FILE = join(CMS_TRASH_DIR, 'trash-index.json');

async function ensureTrashStorage() {
  await mkdir(CMS_TRASH_DIR, { recursive: true });
  try {
    await stat(CMS_TRASH_INDEX_FILE);
  } catch {
    await writeFile(CMS_TRASH_INDEX_FILE, '[]', 'utf-8');
  }
}

async function readTrashEntries() {
  await ensureTrashStorage();
  try {
    const content = await readFile(CMS_TRASH_INDEX_FILE, 'utf-8');
    const parsed = JSON.parse(content);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeTrashEntries(entries) {
  await ensureTrashStorage();
  await writeFile(CMS_TRASH_INDEX_FILE, JSON.stringify(entries, null, 2), 'utf-8');
}

function buildTrashId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2, 10)}`;
}

function sanitizeFileName(fileName) {
  if (typeof fileName !== 'string') return null;
  const trimmed = fileName.trim();
  if (!trimmed.endsWith('.html')) return null;
  if (trimmed.includes('/') || trimmed.includes('\\') || trimmed.includes('..')) return null;
  return trimmed;
}

function inferPageType(fileName) {
  if (fileName.startsWith('produto-')) return 'produto';
  if (fileName.startsWith('blog-')) return 'blog-artigo';
  if (fileName.startsWith('categoria-')) return 'categoria';
  if (fileName === 'blog.html') return 'blog-lista';
  if (fileName === 'catalogo.html') return 'catalogo';
  return 'pagina';
}

function extractHtmlTitle(content, fallback) {
  const match = content.match(/<title>(.*?)<\/title>/i);
  return match?.[1]?.trim() || fallback;
}

async function getEditableHtmlPages() {
  const items = await readdir(__dirname, { withFileTypes: true });
  const htmlFiles = items
    .filter((item) => item.isFile())
    .map((item) => item.name)
    .filter((name) => name.endsWith('.html'))
    .filter((name) => !CMS_EXCLUDED_FILES.has(name));

  const pages = [];
  for (const fileName of htmlFiles) {
    const filePath = join(__dirname, fileName);
    const [content, stats] = await Promise.all([
      readFile(filePath, 'utf-8'),
      stat(filePath),
    ]);
    pages.push({
      fileName,
      title: extractHtmlTitle(content, fileName),
      type: inferPageType(fileName),
      updatedAt: stats.mtime.toISOString(),
    });
  }

  return pages.sort((a, b) => a.fileName.localeCompare(b.fileName, 'pt-BR'));
}

app.get('/api/cms/pages', async (req, res) => {
  try {
    const { search = '' } = req.query;
    const allPages = await getEditableHtmlPages();
    const normalizedSearch = String(search).trim().toLowerCase();

    const filtered = normalizedSearch
      ? allPages.filter((page) =>
          page.fileName.toLowerCase().includes(normalizedSearch) ||
          page.title.toLowerCase().includes(normalizedSearch) ||
          page.type.toLowerCase().includes(normalizedSearch)
        )
      : allPages;

    res.json({ success: true, data: filtered });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/cms/page', async (req, res) => {
  try {
    const fileName = sanitizeFileName(req.query.file);
    if (!fileName || CMS_EXCLUDED_FILES.has(fileName)) {
      return res.status(400).json({ success: false, error: 'Arquivo inválido para edição' });
    }

    const editableFiles = await getEditableHtmlPages();
    if (!editableFiles.some((page) => page.fileName === fileName)) {
      return res.status(404).json({ success: false, error: 'Arquivo não encontrado no CMS' });
    }

    const filePath = join(__dirname, fileName);
    const content = await readFile(filePath, 'utf-8');
    const currentTitle = extractHtmlTitle(content, fileName);

    res.json({
      success: true,
      data: {
        fileName,
        title: currentTitle,
        content,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.put('/api/cms/page', async (req, res) => {
  try {
    const fileName = sanitizeFileName(req.body.fileName);
    const { content } = req.body;

    if (!fileName || CMS_EXCLUDED_FILES.has(fileName)) {
      return res.status(400).json({ success: false, error: 'Arquivo inválido para edição' });
    }

    if (typeof content !== 'string' || !content.trim().toLowerCase().includes('<html')) {
      return res.status(400).json({ success: false, error: 'Conteúdo HTML inválido' });
    }

    const editableFiles = await getEditableHtmlPages();
    if (!editableFiles.some((page) => page.fileName === fileName)) {
      return res.status(404).json({ success: false, error: 'Arquivo não encontrado no CMS' });
    }

    const filePath = join(__dirname, fileName);
    await writeFile(filePath, content, 'utf-8');

    res.json({ success: true, message: 'Página atualizada com sucesso' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

function slugify(text) {
  return String(text || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

function buildCmsTemplate({ title, description }) {
  const safeTitle = title || 'Nova Página LightPlast';
  const safeDescription = description || 'Página criada pelo CRM LightPlast.';
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${safeTitle}</title>
    <meta name="description" content="${safeDescription}">
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <header class="header">
        <div class="container header-container">
            <a href="index.html" class="logo" aria-label="Voltar para a página inicial">
                <span class="lp">lp</span>
                <span class="lightplast">LIGHTPLAST</span>
            </a>
        </div>
    </header>

    <main>
        <section class="hero hero-internal hero-compact">
            <div class="container hero-container">
                <div class="hero-content">
                    <h1>${safeTitle}</h1>
                    <p>${safeDescription}</p>
                </div>
            </div>
        </section>

        <section class="page-section">
            <div class="container">
                <h2>Conteúdo da página</h2>
                <p>Edite este texto no CRM para publicar o conteúdo final.</p>
            </div>
        </section>
    </main>
</body>
</html>
`;
}

function escapeHtml(text) {
  return String(text || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function stripHtmlTags(value) {
  return String(value || '').replace(/<[^>]*>/g, '').trim();
}

function escapeRegExp(value) {
  return String(value || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function normalizeAssetPath(pathValue) {
  const raw = String(pathValue || '').trim();
  if (!raw) return 'assets/cat_embalagens.jpg';
  const clean = raw.replace(/^\/+/, '');
  if (!clean.startsWith('assets/')) {
    return `assets/${clean}`;
  }
  return clean;
}

function injectBeforeMarker(content, marker, block) {
  if (content.includes(block)) return content;
  if (!content.includes(marker)) return content;
  return content.replace(marker, `${block}\n                    ${marker}`);
}

function injectAfterMarker(content, marker, block) {
  if (content.includes(block)) return content;
  if (!content.includes(marker)) return content;
  return content.replace(marker, `${marker}\n${block}`);
}

function ensureListMarkers(content, startMarker, endMarker, openTagPattern) {
  if (content.includes(startMarker) && content.includes(endMarker)) {
    return content;
  }

  const openMatch = content.match(openTagPattern);
  if (!openMatch) return content;

  const openTag = openMatch[0];
  const withStart = content.replace(openTag, `${openTag}\n                    ${startMarker}`);
  return withStart.replace('</ul>', `                    ${endMarker}\n                </ul>`);
}

function buildProductPageTemplate({ title, summary, content, imagePath }) {
  const safeTitle = escapeHtml(title);
  const safeSummary = escapeHtml(summary || 'Produto técnico da LightPlast para operações profissionais.');
  const safeContent = escapeHtml(content || 'Descreva aqui as especificações, aplicações e diferenciais deste produto.');
  const safeImage = normalizeAssetPath(imagePath);

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${safeTitle} | LightPlast</title>
    <meta name="description" content="${safeSummary}">
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <header class="header">
        <div class="container header-container">
            <a href="index.html" class="logo" aria-label="Voltar para a página inicial">
                <span class="lp">lp</span>
                <span class="lightplast">LIGHTPLAST</span>
            </a>
            <button class="mobile-menu-btn" id="mobile-menu-btn" aria-label="Abrir menu" aria-expanded="false" aria-controls="main-nav" type="button"><span class="icon" aria-hidden="true">☰</span></button>
            <nav class="nav" id="main-nav">
                <a href="index.html">Início</a>
                <a href="catalogo.html" class="active">Catálogo</a>
                <a href="sobre.html">Sobre</a>
                <a href="blog.html">Blog</a>
                <a href="/crm">Login</a>
            </nav>
        </div>
    </header>

    <main>
        <section class="hero hero-internal hero-compact">
            <div class="container hero-container">
                <div class="hero-content">
                    <div class="fabrica-badge"><span class="icon" aria-hidden="true">📦</span> Produto LightPlast</div>
                    <h1>${safeTitle}</h1>
                    <p>${safeSummary}</p>
                </div>
            </div>
        </section>

        <section class="page-section">
            <div class="container page-grid-2">
                <article>
                    <h2>Aplicações e especificações</h2>
                    <p>${safeContent}</p>
                </article>
                <aside class="info-panel">
                    <h3>Solicite orçamento</h3>
                    <p>Informe volume mensal e cidade para receber proposta comercial.</p>
                    <a class="btn-primary" href="https://api.whatsapp.com/send?phone=554135576013&text=Quero%20or%C3%A7amento%20de%20${encodeURIComponent(String(title || 'produto'))}" target="_blank" rel="noopener noreferrer">Falar com Especialista</a>
                </aside>
            </div>
        </section>

        <section class="page-section section-light">
            <div class="container">
                <img src="${safeImage}" alt="${safeTitle}" loading="lazy" decoding="async" width="720" height="540" style="width:100%;max-width:720px;display:block;margin:0 auto;border-radius:14px;object-fit:cover;">
            </div>
        </section>
    </main>

    <script>
        const menuBtn = document.getElementById('mobile-menu-btn');
        const nav = document.getElementById('main-nav');
        if (menuBtn && nav) {
            menuBtn.addEventListener('click', function () {
                const active = nav.classList.toggle('nav-active');
                menuBtn.setAttribute('aria-expanded', active ? 'true' : 'false');
            });
        }
    </script>
</body>
</html>
`;
}

function buildBlogPageTemplate({ title, excerpt, content, imagePath }) {
  const safeTitle = escapeHtml(title);
  const safeExcerpt = escapeHtml(excerpt || 'Conteúdo técnico LightPlast para operações B2B.');
  const safeImage = normalizeAssetPath(imagePath);
  const paragraphs = String(content || '')
    .split(/\r?\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => `<p>${escapeHtml(line)}</p>`)
    .join('\n            ');

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${safeTitle} | Blog LightPlast</title>
    <meta name="description" content="${safeExcerpt}">
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <header class="header">
        <div class="container header-container">
            <a href="index.html" class="logo" aria-label="Voltar para a página inicial">
                <span class="lp">lp</span>
                <span class="lightplast">LIGHTPLAST</span>
            </a>
            <button class="mobile-menu-btn" id="mobile-menu-btn" aria-label="Abrir menu" aria-expanded="false" aria-controls="main-nav" type="button"><span class="icon" aria-hidden="true">☰</span></button>
            <nav class="nav" id="main-nav">
                <a href="index.html">Início</a>
                <a href="catalogo.html">Catálogo</a>
                <a href="sobre.html">Sobre</a>
                <a href="blog.html" class="active">Blog</a>
                <a href="/crm">Login</a>
            </nav>
        </div>
    </header>

    <main>
        <section class="page-section">
            <div class="container article-page">
                <h1>${safeTitle}</h1>
                <p class="article-meta">Publicado pela equipe LightPlast</p>
                <img src="${safeImage}" alt="${safeTitle}" loading="lazy" decoding="async" width="1200" height="700">
                <p>${safeExcerpt}</p>
                ${paragraphs || '<p>Edite este artigo no CRM para incluir o conteúdo final.</p>'}
            </div>
        </section>
    </main>

    <script>
        const menuBtn = document.getElementById('mobile-menu-btn');
        const nav = document.getElementById('main-nav');
        if (menuBtn && nav) {
            menuBtn.addEventListener('click', function () {
                const active = nav.classList.toggle('nav-active');
                menuBtn.setAttribute('aria-expanded', active ? 'true' : 'false');
            });
        }
    </script>
</body>
</html>
`;
}

async function appendProductToCatalog({ fileName, title }) {
  const catalogPath = join(__dirname, 'catalogo.html');
  let catalogContent = await readFile(catalogPath, 'utf-8');

  const sectionRegex = /(<h2>Todos os Produtos<\/h2>[\s\S]*?<ul class="list-clean">)([\s\S]*?)(<\/ul>)/;
  const match = catalogContent.match(sectionRegex);
  if (!match) return;

  const startMarker = '<!-- CMS:CATALOGO-PRODUTOS:START -->';
  const endMarker = '<!-- CMS:CATALOGO-PRODUTOS:END -->';
  let listBody = match[2];

  if (listBody.includes(`href="${fileName}"`)) return;

  if (!listBody.includes(startMarker) || !listBody.includes(endMarker)) {
    listBody = `${listBody.trimEnd()}\n                    ${startMarker}\n                    ${endMarker}\n`;
  }

  const listItem = `                    <li><a href="${fileName}">${escapeHtml(title)}</a></li>`;
  listBody = injectBeforeMarker(listBody, endMarker, listItem);

  catalogContent = catalogContent.replace(sectionRegex, `${match[1]}${listBody}${match[3]}`);
  await writeFile(catalogPath, catalogContent, 'utf-8');
}

async function appendProductToCategory({ fileName, title, categoryFile }) {
  if (!categoryFile) return;
  const safeCategoryFile = sanitizeFileName(categoryFile);
  if (!safeCategoryFile) return;

  const categoryPath = join(__dirname, safeCategoryFile);
  let categoryContent;
  try {
    categoryContent = await readFile(categoryPath, 'utf-8');
  } catch {
    return;
  }

  const sectionRegex = /(<h2>Produtos desta categoria<\/h2>[\s\S]*?<ul class="list-clean">)([\s\S]*?)(<\/ul>)/;
  const match = categoryContent.match(sectionRegex);
  if (!match) return;

  const startMarker = '<!-- CMS:CATEGORIA-PRODUTOS:START -->';
  const endMarker = '<!-- CMS:CATEGORIA-PRODUTOS:END -->';
  let listBody = match[2];

  if (listBody.includes(`href="${fileName}"`)) return;

  if (!listBody.includes(startMarker) || !listBody.includes(endMarker)) {
    listBody = `${listBody.trimEnd()}\n                    ${startMarker}\n                    ${endMarker}\n`;
  }

  const listItem = `                    <li><a href="${fileName}">${escapeHtml(title)}</a></li>`;
  listBody = injectBeforeMarker(listBody, endMarker, listItem);

  categoryContent = categoryContent.replace(sectionRegex, `${match[1]}${listBody}${match[3]}`);
  await writeFile(categoryPath, categoryContent, 'utf-8');
}

async function appendBlogToListing({ fileName, title, excerpt, imagePath }) {
  const blogPath = join(__dirname, 'blog.html');
  let blogContent = await readFile(blogPath, 'utf-8');

  const sectionRegex = /(<div class="container blog-grid">)([\s\S]*?)(<\/div>\s*<\/section>)/;
  const match = blogContent.match(sectionRegex);
  if (!match) return;

  const startMarker = '<!-- CMS:BLOG-CARDS:START -->';
  const endMarker = '<!-- CMS:BLOG-CARDS:END -->';
  let cardsBody = match[2];

  if (cardsBody.includes(`href="${fileName}"`)) return;

  if (!cardsBody.includes(startMarker) || !cardsBody.includes(endMarker)) {
    cardsBody = `${startMarker}\n${cardsBody.trim()}\n                ${endMarker}`;
  }

  const card = `                <article class="blog-card">\n                    <img src="${normalizeAssetPath(imagePath)}" alt="${escapeHtml(title)}" loading="lazy" decoding="async" width="720" height="540">\n                    <div class="blog-card-content">\n                        <h2>${escapeHtml(title)}</h2>\n                        <p>${escapeHtml(excerpt)}</p>\n                        <a href="${fileName}" class="btn-primary">Ler artigo</a>\n                    </div>\n                </article>`;

  cardsBody = injectAfterMarker(cardsBody, startMarker, card);
  blogContent = blogContent.replace(sectionRegex, `${match[1]}\n${cardsBody}\n            ${match[3]}`);
  await writeFile(blogPath, blogContent, 'utf-8');
}

async function getProductCategoryFile(fileName) {
  const categoryFiles = [
    'categoria-sacos-de-lixo.html',
    'categoria-sacolas-personalizadas.html',
    'categoria-filmes-tecnicos.html',
  ];

  for (const categoryFile of categoryFiles) {
    const categoryPath = join(__dirname, categoryFile);
    try {
      const content = await readFile(categoryPath, 'utf-8');
      if (content.includes(`href="${fileName}"`)) {
        return categoryFile;
      }
    } catch {
      // Ignore category read errors and continue.
    }
  }

  return '';
}

async function removeProductFromAllCategories(fileName) {
  const categoryFiles = [
    'categoria-sacos-de-lixo.html',
    'categoria-sacolas-personalizadas.html',
    'categoria-filmes-tecnicos.html',
  ];

  const anchorPattern = escapeRegExp(fileName);
  const rowRegex = new RegExp(`\\n?\\s*<li><a href="${anchorPattern}">[\\s\\S]*?<\\/a><\\/li>`, 'g');

  for (const categoryFile of categoryFiles) {
    const categoryPath = join(__dirname, categoryFile);
    try {
      const content = await readFile(categoryPath, 'utf-8');
      const updated = content.replace(rowRegex, '');
      if (updated !== content) {
        await writeFile(categoryPath, updated, 'utf-8');
      }
    } catch {
      // Ignore category read/write errors and continue.
    }
  }
}

async function removeProductFromCatalog(fileName) {
  const catalogPath = join(__dirname, 'catalogo.html');
  const content = await readFile(catalogPath, 'utf-8');
  const anchorPattern = escapeRegExp(fileName);
  const rowRegex = new RegExp(`\\n?\\s*<li><a href="${anchorPattern}">[\\s\\S]*?<\\/a><\\/li>`, 'g');
  const updated = content.replace(rowRegex, '');
  if (updated !== content) {
    await writeFile(catalogPath, updated, 'utf-8');
  }
}

async function upsertProductLabelInCatalog(fileName, title) {
  const catalogPath = join(__dirname, 'catalogo.html');
  const content = await readFile(catalogPath, 'utf-8');
  const anchorPattern = escapeRegExp(fileName);
  const rowRegex = new RegExp(`(<a href="${anchorPattern}">)([\\s\\S]*?)(<\\/a>)`, 'g');
  const updated = content.replace(rowRegex, `$1${escapeHtml(title)}$3`);
  if (updated !== content) {
    await writeFile(catalogPath, updated, 'utf-8');
  } else {
    await appendProductToCatalog({ fileName, title });
  }
}

async function upsertBlogCard({ fileName, title, excerpt, imagePath }) {
  const blogPath = join(__dirname, 'blog.html');
  const content = await readFile(blogPath, 'utf-8');

  const card = `                <article class="blog-card">\n                    <img src="${normalizeAssetPath(imagePath)}" alt="${escapeHtml(title)}" loading="lazy" decoding="async" width="720" height="540">\n                    <div class="blog-card-content">\n                        <h2>${escapeHtml(title)}</h2>\n                        <p>${escapeHtml(excerpt)}</p>\n                        <a href="${fileName}" class="btn-primary">Ler artigo</a>\n                    </div>\n                </article>`;

  const anchorPattern = escapeRegExp(fileName);
  const cardRegex = new RegExp(`<article class="blog-card">[\\s\\S]*?<a href="${anchorPattern}" class="btn-primary">Ler artigo<\\/a>[\\s\\S]*?<\\/article>`, 'g');

  if (cardRegex.test(content)) {
    const updated = content.replace(cardRegex, card);
    await writeFile(blogPath, updated, 'utf-8');
    return;
  }

  await appendBlogToListing({ fileName, title, excerpt, imagePath });
}

async function removeBlogCard(fileName) {
  const blogPath = join(__dirname, 'blog.html');
  const content = await readFile(blogPath, 'utf-8');
  const anchorPattern = escapeRegExp(fileName);
  const cardRegex = new RegExp(`<article class="blog-card">[\\s\\S]*?<a href="${anchorPattern}" class="btn-primary">Ler artigo<\\/a>[\\s\\S]*?<\\/article>`, 'g');
  const updated = content.replace(cardRegex, '');
  if (updated !== content) {
    await writeFile(blogPath, updated, 'utf-8');
  }
}

async function moveFileToTrash({ fileName, type, metadata }) {
  const filePath = join(__dirname, fileName);
  const trashId = buildTrashId();
  const trashFileName = `${trashId}-${fileName}`;
  const trashPath = join(CMS_TRASH_DIR, trashFileName);

  await ensureTrashStorage();
  await rename(filePath, trashPath);

  const entries = await readTrashEntries();
  entries.unshift({
    id: trashId,
    type,
    fileName,
    trashFileName,
    metadata: metadata || {},
    deletedAt: new Date().toISOString(),
  });
  await writeTrashEntries(entries);
  return trashId;
}

async function restoreFromTrash(trashId) {
  const entries = await readTrashEntries();
  const entry = entries.find((item) => item.id === trashId);
  if (!entry) {
    throw new Error('Item não encontrado na lixeira');
  }

  const sourcePath = join(CMS_TRASH_DIR, entry.trashFileName);
  const targetPath = join(__dirname, entry.fileName);

  try {
    await stat(targetPath);
    throw new Error('Já existe um arquivo com esse nome. Remova ou renomeie antes de restaurar.');
  } catch (error) {
    if (!String(error.message || '').includes('ENOENT')) {
      throw error;
    }
  }

  await rename(sourcePath, targetPath);

  if (entry.type === 'produto') {
    await appendProductToCatalog({
      fileName: entry.fileName,
      title: entry.metadata?.title || entry.fileName,
    });
    await appendProductToCategory({
      fileName: entry.fileName,
      title: entry.metadata?.title || entry.fileName,
      categoryFile: entry.metadata?.categoryFile || '',
    });
  }

  if (entry.type === 'blog-artigo') {
    await appendBlogToListing({
      fileName: entry.fileName,
      title: entry.metadata?.title || entry.fileName,
      excerpt: entry.metadata?.excerpt || 'Conteúdo restaurado pela lixeira do CRM.',
      imagePath: entry.metadata?.image || 'assets/cat_embalagens.jpg',
    });
  }

  const filtered = entries.filter((item) => item.id !== trashId);
  await writeTrashEntries(filtered);
  return entry;
}

async function deleteTrashEntryPermanently(trashId) {
  const entries = await readTrashEntries();
  const entry = entries.find((item) => item.id === trashId);
  if (!entry) {
    throw new Error('Item não encontrado na lixeira');
  }

  const trashPath = join(CMS_TRASH_DIR, entry.trashFileName);
  await unlink(trashPath);
  const filtered = entries.filter((item) => item.id !== trashId);
  await writeTrashEntries(filtered);
  return entry;
}

function extractProductData(content, fallbackFileName) {
  const h1Match = content.match(/<h1>([\s\S]*?)<\/h1>/i);
  const summaryMatch = content.match(/<section class="hero[\s\S]*?<p>([\s\S]*?)<\/p>/i);
  const bodyMatch = content.match(/<article>[\s\S]*?<p>([\s\S]*?)<\/p>/i);
  const imageMatch = content.match(/<img src="([^"]+)"[^>]*>/i);

  return {
    title: stripHtmlTags(h1Match?.[1] || fallbackFileName),
    summary: stripHtmlTags(summaryMatch?.[1] || ''),
    body: stripHtmlTags(bodyMatch?.[1] || ''),
    image: imageMatch?.[1] || 'assets/cat_embalagens.jpg',
  };
}

function extractBlogData(content, fallbackFileName) {
  const h1Match = content.match(/<h1>([\s\S]*?)<\/h1>/i);
  const imgMatch = content.match(/<img src="([^"]+)"[^>]*>/i);

  const mainBlockMatch = content.match(/<div class="container article-page">([\s\S]*?)<\/div>/i);
  const block = mainBlockMatch?.[1] || '';
  const pMatches = [...block.matchAll(/<p(?: class="[^"]+")?>([\s\S]*?)<\/p>/gi)]
    .map((m) => stripHtmlTags(m[1]))
    .filter(Boolean);

  const excerpt = pMatches[1] || pMatches[0] || '';
  const body = pMatches.slice(2).join('\n\n');

  return {
    title: stripHtmlTags(h1Match?.[1] || fallbackFileName),
    excerpt,
    body,
    image: imgMatch?.[1] || 'assets/cat_embalagens.jpg',
  };
}

app.get('/api/cms/guided/product', async (req, res) => {
  try {
    const fileName = sanitizeFileName(req.query.file);
    if (!fileName || !fileName.startsWith('produto-')) {
      return res.status(400).json({ success: false, error: 'Arquivo de produto inválido' });
    }

    const filePath = join(__dirname, fileName);
    const content = await readFile(filePath, 'utf-8');
    const extracted = extractProductData(content, fileName);
    const categoryFile = await getProductCategoryFile(fileName);

    res.json({
      success: true,
      data: {
        fileName,
        ...extracted,
        categoryFile,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.put('/api/cms/guided/product', async (req, res) => {
  try {
    const { fileName, title, summary, body, image, categoryFile } = req.body;
    const safeFileName = sanitizeFileName(fileName);

    if (!safeFileName || !safeFileName.startsWith('produto-')) {
      return res.status(400).json({ success: false, error: 'Arquivo de produto inválido' });
    }

    const safeTitle = String(title || '').trim();
    if (!safeTitle) {
      return res.status(400).json({ success: false, error: 'Título do produto é obrigatório' });
    }

    const productPath = join(__dirname, safeFileName);
    const newContent = buildProductPageTemplate({
      title: safeTitle,
      summary,
      content: body,
      imagePath: image,
    });

    await writeFile(productPath, newContent, 'utf-8');
    await upsertProductLabelInCatalog(safeFileName, safeTitle);
    await removeProductFromAllCategories(safeFileName);
    await appendProductToCategory({ fileName: safeFileName, title: safeTitle, categoryFile });

    res.json({ success: true, message: 'Produto atualizado com sucesso' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/cms/guided/blog', async (req, res) => {
  try {
    const fileName = sanitizeFileName(req.query.file);
    if (!fileName || !fileName.startsWith('blog-')) {
      return res.status(400).json({ success: false, error: 'Arquivo de blog inválido' });
    }

    const filePath = join(__dirname, fileName);
    const content = await readFile(filePath, 'utf-8');
    const extracted = extractBlogData(content, fileName);

    res.json({
      success: true,
      data: {
        fileName,
        ...extracted,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.put('/api/cms/guided/blog', async (req, res) => {
  try {
    const { fileName, title, excerpt, body, image } = req.body;
    const safeFileName = sanitizeFileName(fileName);

    if (!safeFileName || !safeFileName.startsWith('blog-')) {
      return res.status(400).json({ success: false, error: 'Arquivo de blog inválido' });
    }

    const safeTitle = String(title || '').trim();
    if (!safeTitle) {
      return res.status(400).json({ success: false, error: 'Título do artigo é obrigatório' });
    }

    const blogPath = join(__dirname, safeFileName);
    const newContent = buildBlogPageTemplate({
      title: safeTitle,
      excerpt,
      content: body,
      imagePath: image,
    });

    await writeFile(blogPath, newContent, 'utf-8');
    await upsertBlogCard({
      fileName: safeFileName,
      title: safeTitle,
      excerpt: String(excerpt || '').trim() || 'Novo conteúdo publicado pela LightPlast.',
      imagePath: image,
    });

    res.json({ success: true, message: 'Artigo atualizado com sucesso' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.delete('/api/cms/guided/product', async (req, res) => {
  try {
    const safeFileName = sanitizeFileName(req.query.file);
    if (!safeFileName || !safeFileName.startsWith('produto-')) {
      return res.status(400).json({ success: false, error: 'Arquivo de produto inválido' });
    }

    const filePath = join(__dirname, safeFileName);
    const content = await readFile(filePath, 'utf-8');
    const extracted = extractProductData(content, safeFileName);
    const categoryFile = await getProductCategoryFile(safeFileName);

    const trashId = await moveFileToTrash({
      fileName: safeFileName,
      type: 'produto',
      metadata: {
        title: extracted.title,
        categoryFile,
        image: extracted.image,
      },
    });

    await removeProductFromCatalog(safeFileName);
    await removeProductFromAllCategories(safeFileName);

    res.json({
      success: true,
      message: 'Produto enviado para a lixeira com sucesso',
      data: { trashId },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.delete('/api/cms/guided/blog', async (req, res) => {
  try {
    const safeFileName = sanitizeFileName(req.query.file);
    if (!safeFileName || !safeFileName.startsWith('blog-')) {
      return res.status(400).json({ success: false, error: 'Arquivo de blog inválido' });
    }

    const filePath = join(__dirname, safeFileName);
    const content = await readFile(filePath, 'utf-8');
    const extracted = extractBlogData(content, safeFileName);

    const trashId = await moveFileToTrash({
      fileName: safeFileName,
      type: 'blog-artigo',
      metadata: {
        title: extracted.title,
        excerpt: extracted.excerpt,
        image: extracted.image,
      },
    });

    await removeBlogCard(safeFileName);

    res.json({
      success: true,
      message: 'Artigo enviado para a lixeira com sucesso',
      data: { trashId },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/cms/trash', async (req, res) => {
  try {
    const entries = await readTrashEntries();
    res.json({ success: true, data: entries });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/cms/trash/:id/restore', async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ success: false, error: 'ID da lixeira é obrigatório' });
    }

    const restored = await restoreFromTrash(id);
    res.json({
      success: true,
      message: 'Conteúdo restaurado com sucesso',
      data: restored,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.delete('/api/cms/trash/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ success: false, error: 'ID da lixeira é obrigatório' });
    }

    const removed = await deleteTrashEntryPermanently(id);
    res.json({
      success: true,
      message: 'Conteúdo excluído permanentemente',
      data: removed,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/cms/publish/product', async (req, res) => {
  try {
    const { title, slug, summary, body, image, categoryFile } = req.body;
    const safeTitle = String(title || '').trim();
    if (!safeTitle) {
      return res.status(400).json({ success: false, error: 'Título do produto é obrigatório' });
    }

    const slugValue = slugify(slug || safeTitle);
    if (!slugValue) {
      return res.status(400).json({ success: false, error: 'Slug inválido para produto' });
    }

    const fileName = `produto-${slugValue}.html`;
    const filePath = join(__dirname, fileName);

    const existingPages = await getEditableHtmlPages();
    if (existingPages.some((page) => page.fileName === fileName)) {
      return res.status(409).json({ success: false, error: 'Já existe produto com este slug' });
    }

    const productPage = buildProductPageTemplate({
      title: safeTitle,
      summary,
      content: body,
      imagePath: image,
    });

    await writeFile(filePath, productPage, 'utf-8');
    await appendProductToCatalog({ fileName, title: safeTitle });
    await appendProductToCategory({ fileName, title: safeTitle, categoryFile });

    res.json({
      success: true,
      data: { fileName },
      message: 'Produto publicado e listado no catálogo com sucesso',
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/cms/publish/blog', async (req, res) => {
  try {
    const { title, slug, excerpt, body, image } = req.body;
    const safeTitle = String(title || '').trim();
    if (!safeTitle) {
      return res.status(400).json({ success: false, error: 'Título do artigo é obrigatório' });
    }

    const slugValue = slugify(slug || safeTitle);
    if (!slugValue) {
      return res.status(400).json({ success: false, error: 'Slug inválido para artigo' });
    }

    const fileName = `blog-${slugValue}.html`;
    const filePath = join(__dirname, fileName);

    const existingPages = await getEditableHtmlPages();
    if (existingPages.some((page) => page.fileName === fileName)) {
      return res.status(409).json({ success: false, error: 'Já existe artigo com este slug' });
    }

    const blogPage = buildBlogPageTemplate({
      title: safeTitle,
      excerpt,
      content: body,
      imagePath: image,
    });

    await writeFile(filePath, blogPage, 'utf-8');
    await appendBlogToListing({
      fileName,
      title: safeTitle,
      excerpt: String(excerpt || '').trim() || 'Novo conteúdo publicado pela LightPlast.',
      imagePath: image,
    });

    res.json({
      success: true,
      data: { fileName },
      message: 'Artigo publicado e listado no blog com sucesso',
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/cms/page', async (req, res) => {
  try {
    const { pageType, slug, title, description } = req.body;
    const normalizedType = String(pageType || '').trim().toLowerCase();
    const slugValue = slugify(slug || title);

    if (!slugValue) {
      return res.status(400).json({ success: false, error: 'Slug inválido para criar página' });
    }

    let fileName;
    if (normalizedType === 'produto') {
      fileName = `produto-${slugValue}.html`;
    } else if (normalizedType === 'blog-artigo') {
      fileName = `blog-${slugValue}.html`;
    } else if (normalizedType === 'categoria') {
      fileName = `categoria-${slugValue}.html`;
    } else {
      fileName = `${slugValue}.html`;
    }

    if (CMS_EXCLUDED_FILES.has(fileName)) {
      return res.status(400).json({ success: false, error: 'Nome de arquivo reservado' });
    }

    const existingPages = await getEditableHtmlPages();
    if (existingPages.some((page) => page.fileName === fileName)) {
      return res.status(409).json({ success: false, error: 'Já existe uma página com este slug' });
    }

    const filePath = join(__dirname, fileName);
    const content = buildCmsTemplate({ title, description });
    await writeFile(filePath, content, 'utf-8');

    res.json({
      success: true,
      data: { fileName },
      message: 'Página criada com sucesso',
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
