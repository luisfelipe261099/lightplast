"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = handler;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const body_parser_1 = __importDefault(require("body-parser"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const pdfkit_1 = __importDefault(require("pdfkit"));
const database_1 = require("./database");
dotenv_1.default.config();
const app = (0, express_1.default)();
// Middleware
app.use((0, cors_1.default)());
app.use(body_parser_1.default.json({ limit: '50mb' }));
app.use(body_parser_1.default.urlencoded({ limit: '50mb', extended: true }));
// Serve dashboard (static files)
app.use('/dashboard', express_1.default.static(path_1.default.join(__dirname, '../dashboard')));
app.get('/', (req, res) => {
    res.sendFile(path_1.default.join(__dirname, '../dashboard/index.html'));
});
// Error handler middleware
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
});
// ==================== CUSTOMERS ENDPOINTS ====================
app.get('/api/customers', async (req, res) => {
    try {
        const status = req.query.status;
        let sql = `
      SELECT c.*,
        COUNT(DISTINCT o.id) as total_orders,
        COALESCE(SUM(o.value), 0) as total_spent,
        MAX(o.created_at) as last_order_date
      FROM customers c
      LEFT JOIN orders o ON c.id = o.customer_id
    `;
        const params = [];
        if (status) {
            sql += ` WHERE c.status = ?`;
            params.push(status);
        }
        sql += ` GROUP BY c.id ORDER BY c.last_contact DESC LIMIT 100`;
        const customers = await (0, database_1.query)(sql, params);
        res.json({ success: true, data: customers, count: customers.length });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
app.get('/api/customers/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const customers = await (0, database_1.query)(`SELECT c.*,
        COUNT(DISTINCT o.id) as total_orders,
        COALESCE(SUM(o.value), 0) as total_spent
      FROM customers c
      LEFT JOIN orders o ON c.id = o.customer_id
      WHERE c.id = ?
      GROUP BY c.id`, [id]);
        if (!customers.length) {
            return res.status(404).json({ success: false, error: 'Customer not found' });
        }
        const customer = customers[0];
        const [orders, followUps, interactions] = await Promise.all([
            (0, database_1.query)(`SELECT * FROM orders WHERE customer_id = ? ORDER BY created_at DESC`, [id]),
            (0, database_1.query)(`SELECT * FROM follow_ups WHERE customer_id = ? ORDER BY scheduled_date DESC`, [id]),
            (0, database_1.query)(`SELECT * FROM interactions WHERE customer_id = ? ORDER BY created_at DESC LIMIT 50`, [id]),
        ]);
        res.json({
            success: true,
            data: {
                ...customer,
                orders,
                follow_ups: followUps,
                interactions,
            },
        });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
app.post('/api/customers', async (req, res) => {
    try {
        const { name, email, phone, company, document, address, city, state, zip } = req.body;
        const result = await (0, database_1.execute)(`INSERT INTO customers (name, email, phone, company, document, address, city, state, zip, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')`, [name, email || null, phone, company || null, document || null, address || null, city || null, state || null, zip || null]);
        res.status(201).json({
            success: true,
            id: result.insertId,
            message: 'Customer created successfully',
        });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
app.put('/api/customers/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, phone, company, document, address, city, state, zip, status } = req.body;
        await (0, database_1.execute)(`UPDATE customers
       SET name = ?, email = ?, phone = ?, company = ?, document = ?, address = ?, city = ?, state = ?, zip = ?, status = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`, [name, email || null, phone, company || null, document || null, address || null, city || null, state || null, zip || null, status || 'active', id]);
        res.json({ success: true, message: 'Customer updated' });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
// ==================== ORDERS ENDPOINTS ====================
app.get('/api/orders', async (req, res) => {
    try {
        const { customer_id, status } = req.query;
        let sql = `SELECT * FROM orders WHERE 1=1`;
        const params = [];
        if (customer_id) {
            sql += ` AND customer_id = ?`;
            params.push(customer_id);
        }
        if (status) {
            sql += ` AND status = ?`;
            params.push(status);
        }
        sql += ` ORDER BY created_at DESC LIMIT 100`;
        const orders = await (0, database_1.query)(sql, params);
        res.json({ success: true, data: orders, count: orders.length });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
app.post('/api/orders', async (req, res) => {
    try {
        const { customer_id, order_number, product_type, quantity, unit, value, description, delivery_date } = req.body;
        // Update customer lifetime value
        await (0, database_1.execute)(`UPDATE customers SET lifetime_value = lifetime_value + ? WHERE id = ?`, [value, customer_id]);
        const result = await (0, database_1.execute)(`INSERT INTO orders (customer_id, order_number, product_type, quantity, unit, value, status, description, delivery_date)
       VALUES (?, ?, ?, ?, ?, ?, 'pending', ?, ?)`, [
            customer_id,
            order_number || `ORD-${Date.now()}`,
            product_type || null,
            quantity || null,
            unit || null,
            value,
            description || null,
            delivery_date || null,
        ]);
        res.status(201).json({
            success: true,
            id: result.insertId,
            message: 'Order created',
        });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
app.put('/api/orders/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { status, product_type, quantity, unit, value, description, delivery_date } = req.body;
        await (0, database_1.execute)(`UPDATE orders
       SET status = ?, product_type = ?, quantity = ?, unit = ?, value = ?, description = ?, delivery_date = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`, [status || 'pending', product_type || null, quantity || null, unit || null, value || 0, description || null, delivery_date || null, id]);
        res.json({ success: true, message: 'Order updated' });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
// ==================== LEADS ENDPOINTS ====================
app.get('/api/leads', async (req, res) => {
    try {
        const { status } = req.query;
        let sql = `SELECT * FROM leads WHERE 1=1`;
        const params = [];
        if (status) {
            sql += ` AND status = ?`;
            params.push(status);
        }
        sql += ` ORDER BY score DESC, created_at DESC LIMIT 100`;
        const leads = await (0, database_1.query)(sql, params);
        res.json({ success: true, data: leads, count: leads.length });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
app.post('/api/leads', async (req, res) => {
    try {
        const { name, email, phone, company, product_interest, source, notes } = req.body;
        // Calculate lead score
        let score = 0;
        if (['whatsapp', 'direct'].includes(source))
            score += 30;
        if (company)
            score += 20;
        if (email)
            score += 10;
        const result = await (0, database_1.execute)(`INSERT INTO leads (name, email, phone, company, product_interest, source, score, status, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'new', ?)`, [name, email || null, phone, company || null, product_interest || null, source || 'website', score, notes || null]);
        res.status(201).json({
            success: true,
            id: result.insertId,
            score,
            message: 'Lead created',
        });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
app.put('/api/leads/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { status, score, product_interest, notes } = req.body;
        await (0, database_1.execute)(`UPDATE leads
       SET status = ?, score = ?, product_interest = ?, notes = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`, [status || 'new', score || 0, product_interest || null, notes || null, id]);
        res.json({ success: true, message: 'Lead updated' });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
// ==================== FOLLOW-UPS ENDPOINTS ====================
app.get('/api/follow-ups', async (req, res) => {
    try {
        const { pending } = req.query;
        let sql = `
      SELECT f.*,
        COALESCE(c.name, l.name) as contact_name,
        CASE WHEN f.customer_id IS NOT NULL THEN 'customer' ELSE 'lead' END as contact_type,
        COALESCE(c.phone, l.phone) as phone,
        COALESCE(c.email, l.email) as email
      FROM follow_ups f
      LEFT JOIN customers c ON f.customer_id = c.id
      LEFT JOIN leads l ON f.lead_id = l.id
      WHERE 1=1
    `;
        const params = [];
        if (pending) {
            sql += ` AND f.status = 'pending' AND f.scheduled_date <= NOW()`;
        }
        sql += ` ORDER BY f.scheduled_date ASC LIMIT 100`;
        const followUps = await (0, database_1.query)(sql, params);
        res.json({ success: true, data: followUps, count: followUps.length });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
app.post('/api/follow-ups', async (req, res) => {
    try {
        const { customer_id, lead_id, title, description, scheduled_date, follow_up_type } = req.body;
        const result = await (0, database_1.execute)(`INSERT INTO follow_ups (customer_id, lead_id, title, description, scheduled_date, follow_up_type, status)
       VALUES (?, ?, ?, ?, ?, ?, 'pending')`, [customer_id || null, lead_id || null, title, description || null, scheduled_date, follow_up_type || 'call']);
        res.status(201).json({
            success: true,
            id: result.insertId,
            message: 'Follow-up scheduled',
        });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
app.put('/api/follow-ups/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { status, title, description, scheduled_date, notes } = req.body;
        await (0, database_1.execute)(`UPDATE follow_ups
       SET status = ?, title = ?, description = ?, scheduled_date = ?, notes = ?, 
           completed_at = CASE WHEN ? = 'completed' THEN CURRENT_TIMESTAMP ELSE completed_at END
       WHERE id = ?`, [status || 'pending', title || null, description || null, scheduled_date || null, notes || null, status || 'pending', id]);
        res.json({ success: true, message: 'Follow-up updated' });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
// ==================== BUDGETS ENDPOINTS ====================
app.get('/api/budgets', async (req, res) => {
    try {
        const { customer_id, status } = req.query;
        let sql = `
      SELECT b.*, c.name as customer_name, c.email as customer_email, c.phone as customer_phone
      FROM budgets b
      LEFT JOIN customers c ON b.customer_id = c.id
      WHERE 1=1
    `;
        const params = [];
        if (customer_id) {
            sql += ` AND b.customer_id = ?`;
            params.push(customer_id);
        }
        if (status) {
            sql += ` AND b.status = ?`;
            params.push(status);
        }
        sql += ` ORDER BY b.created_at DESC LIMIT 100`;
        const budgets = await (0, database_1.query)(sql, params);
        res.json({ success: true, data: budgets, count: budgets.length });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
app.get('/api/budgets/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const budgets = await (0, database_1.query)(`SELECT b.*, c.name as customer_name, c.email as customer_email, c.phone as customer_phone
       FROM budgets b
       LEFT JOIN customers c ON b.customer_id = c.id
       WHERE b.id = ?`, [id]);
        if (!budgets.length) {
            return res.status(404).json({ success: false, error: 'Budget not found' });
        }
        const budget = budgets[0];
        budget.items = JSON.parse(budget.items || '[]');
        res.json({ success: true, data: budget });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
app.post('/api/budgets', async (req, res) => {
    try {
        const { customer_id, lead_id, title, description, items, tax_percent, notes, valid_days } = req.body;
        // Calculate totals
        const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
        const tax_value = (subtotal * (tax_percent || 0)) / 100;
        const total = subtotal + tax_value;
        // Generate budget number
        const budgetNumber = `ORC-${Date.now()}`;
        // Set valid until date
        const validUntil = new Date();
        validUntil.setDate(validUntil.getDate() + (valid_days || 7));
        const result = await (0, database_1.execute)(`INSERT INTO budgets (customer_id, lead_id, budget_number, title, description, items, subtotal, tax_percent, tax_value, total, valid_until, notes, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'draft')`, [
            customer_id || null,
            lead_id || null,
            budgetNumber,
            title,
            description || null,
            JSON.stringify(items),
            subtotal,
            tax_percent || 0,
            tax_value,
            total,
            validUntil.toISOString(),
            notes || null,
        ]);
        res.status(201).json({
            success: true,
            id: result.insertId,
            budget_number: budgetNumber,
            message: 'Budget created successfully',
        });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
app.put('/api/budgets/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, status, notes } = req.body;
        // If status changed to approved, record approval
        const approvedAt = status === 'approved' ? 'CURRENT_TIMESTAMP' : 'approved_at';
        const sentAt = status === 'sent' ? 'CURRENT_TIMESTAMP' : 'sent_at';
        await (0, database_1.execute)(`UPDATE budgets
       SET title = ?, description = ?, status = ?, notes = ?, 
           sent_at = IF(status = 'sent', CURRENT_TIMESTAMP, sent_at),
           approved_at = IF(status = 'approved', CURRENT_TIMESTAMP, approved_at),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`, [title || null, description || null, status || 'draft', notes || null, id]);
        res.json({ success: true, message: 'Budget updated' });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
app.get('/api/budgets/:id/pdf', async (req, res) => {
    try {
        const { id } = req.params;
        const budgets = await (0, database_1.query)(`SELECT b.*, c.name as customer_name, c.email as customer_email, 
              c.phone as customer_phone, c.address, c.city, c.state, c.zip
       FROM budgets b
       LEFT JOIN customers c ON b.customer_id = c.id
       WHERE b.id = ?`, [id]);
        if (!budgets.length) {
            return res.status(404).json({ success: false, error: 'Budget not found' });
        }
        const budget = budgets[0];
        budget.items = JSON.parse(budget.items || '[]');
        // Generate PDF
        const doc = new pdfkit_1.default({ margin: 50 });
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `inline; filename="Orcamento_${budget.budget_number}.pdf"`);
        doc.pipe(res);
        // Header
        doc.fontSize(24).font('Helvetica-Bold').text('LIGHTPLAST', 50, 50);
        doc.fontSize(10).font('Helvetica').text('Fábrica de Embalagens Plásticas', 50, 80);
        doc.fontSize(9).text('Rua Graça Aranha, 946 - Pinhais, PR');
        doc.text('gerencia@lightplast.com.br | (41) 3557-6013');
        // Title
        doc.fontSize(16).font('Helvetica-Bold').text(`ORÇAMENTO #${budget.budget_number}`, 50, 150);
        doc.fontSize(10).font('Helvetica').text(`Status: ${budget.status.toUpperCase()}`, 50, 175);
        // Customer info
        doc.fontSize(12).font('Helvetica-Bold').text('Cliente:', 50, 210);
        doc.fontSize(10).font('Helvetica')
            .text(budget.customer_name || 'N/A', 50, 230)
            .text(`Email: ${budget.customer_email || '-'}`, 50, 245)
            .text(`Telefone: ${budget.customer_phone || '-'}`, 50, 260)
            .text(`Endereço: ${budget.address || '-'}, ${budget.city || '-'} - ${budget.state || '-'}`, 50, 275);
        // Items table
        const tableTop = 320;
        doc.fontSize(11).font('Helvetica-Bold');
        doc.text('Descrição', 50, tableTop);
        doc.text('Qtde', 300, tableTop);
        doc.text('Valor Unit.', 380, tableTop);
        doc.text('Total', 470, tableTop);
        doc.moveTo(50, tableTop + 15).lineTo(530, tableTop + 15).stroke();
        let y = tableTop + 30;
        doc.fontSize(10).font('Helvetica');
        for (const item of budget.items) {
            doc.text(item.description.substring(0, 30), 50, y);
            doc.text(item.quantity.toString(), 300, y);
            doc.text(`R$ ${item.unit_price.toFixed(2)}`, 380, y);
            doc.text(`R$ ${(item.quantity * item.unit_price).toFixed(2)}`, 470, y);
            y += 20;
        }
        doc.moveTo(50, y).lineTo(530, y).stroke();
        // Totals
        y += 15;
        doc.fontSize(11).font('Helvetica-Bold');
        doc.text('Subtotal:', 380, y);
        doc.text(`R$ ${budget.subtotal.toFixed(2)}`, 470, y);
        y += 20;
        if (budget.tax_percent > 0) {
            doc.text(`Imposto (${budget.tax_percent}%):`, 380, y);
            doc.text(`R$ ${budget.tax_value.toFixed(2)}`, 470, y);
            y += 20;
        }
        doc.fontSize(12).font('Helvetica-Bold');
        doc.text('TOTAL:', 380, y);
        doc.text(`R$ ${budget.total.toFixed(2)}`, 470, y);
        // Footer
        y += 40;
        doc.fontSize(9).font('Helvetica')
            .text(`Válido até: ${new Date(budget.valid_until).toLocaleDateString('pt-BR')}`, 50, y);
        if (budget.notes) {
            y += 20;
            doc.fontSize(10).font('Helvetica-Bold').text('Observações:', 50, y);
            y += 15;
            doc.fontSize(9).font('Helvetica').text(budget.notes, 50, y, { width: 480 });
        }
        // End document
        doc.end();
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
// ==================== DASHBOARD ENDPOINTS ====================
app.get('/api/dashboard', async (req, res) => {
    try {
        const [stats, recentFollowUps, topCustomers] = await Promise.all([
            Promise.all([
                (0, database_1.query)(`SELECT COUNT(*) as count FROM customers WHERE status = 'active'`),
                (0, database_1.query)(`SELECT COUNT(*) as count FROM leads WHERE status IN ('new', 'qualified')`),
                (0, database_1.query)(`SELECT COUNT(*) as count FROM follow_ups WHERE status = 'pending' AND scheduled_date <= NOW()`),
                (0, database_1.query)(`SELECT COALESCE(SUM(value), 0) as total FROM orders WHERE status != 'cancelled'`),
                (0, database_1.query)(`SELECT COALESCE(SUM(value), 0) as total FROM orders WHERE status != 'cancelled' AND DATE(created_at) >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)`),
                (0, database_1.query)(`SELECT ROUND(COUNT(CASE WHEN converted_to_customer IS NOT NULL THEN 1 END) * 100.0 / NULLIF(COUNT(*), 0), 2) as rate FROM leads`),
            ]),
            (0, database_1.query)(`SELECT f.*, COALESCE(c.name, l.name) as contact_name, COALESCE(c.phone, l.phone) as phone
         FROM follow_ups f
         LEFT JOIN customers c ON f.customer_id = c.id
         LEFT JOIN leads l ON f.lead_id = l.id
         WHERE f.status = 'pending' AND f.scheduled_date <= NOW()
         ORDER BY f.scheduled_date ASC LIMIT 5`),
            (0, database_1.query)(`SELECT c.id, c.name, c.phone, c.company, COALESCE(SUM(o.value), 0) as total_spent
         FROM customers c
         LEFT JOIN orders o ON c.id = o.customer_id
         GROUP BY c.id
         ORDER BY total_spent DESC LIMIT 5`),
        ]);
        const statsArray = stats;
        res.json({
            success: true,
            stats: {
                total_customers: statsArray[0][0]?.count || 0,
                total_leads: statsArray[1][0]?.count || 0,
                pending_follow_ups: statsArray[2][0]?.count || 0,
                total_revenue: statsArray[3][0]?.total || 0,
                monthly_revenue: statsArray[4][0]?.total || 0,
                conversion_rate: statsArray[5][0]?.rate || 0,
            },
            recent_follow_ups: recentFollowUps,
            top_customers: topCustomers,
        });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
// ==================== AUTOMATIONS ENDPOINTS (100% Free) ====================
// Trigger via GitHub Actions, IFTTT, Zapier, ou manual
app.post('/api/automations/trigger', async (req, res) => {
    try {
        const { type } = req.body;
        if (type === 'review_30_days') {
            await automationReview30Days();
        }
        else if (type === 'resgate_leads_frios') {
            await automationResgateLedsFrios();
        }
        else if (type === 'win_back_clientes') {
            await automationWinBackClientes();
        }
        else if (type === 'escalacao_leads') {
            await automationEscalacaoLeads();
        }
        res.json({ success: true, message: `Automação ${type} executada com sucesso` });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
// Automação: Review 30 Dias Após Pedido
async function automationReview30Days() {
    const results = await (0, database_1.query)(`SELECT o.id, o.customer_id, c.name, o.delivery_date
     FROM orders o
     JOIN customers c ON o.customer_id = c.id
     WHERE o.status = 'delivered'
     AND DATE(o.delivery_date) = DATE_SUB(CURDATE(), INTERVAL 30 DAY)
     AND NOT EXISTS (
       SELECT 1 FROM follow_ups
       WHERE customer_id = c.id
       AND DATE(created_at) >= DATE_SUB(CURDATE(), INTERVAL 25 DAY)
     )`);
    for (const order of results) {
        await (0, database_1.execute)(`INSERT INTO follow_ups (customer_id, title, description, scheduled_date, follow_up_type, status)
       VALUES (?, ?, ?, NOW(), 'whatsapp', 'pending')`, [
            order.customer_id,
            `Review - ${order.name}`,
            `Revisar satisfacao com pedido de 30 dias. Oferecer proxima venda.`
        ]);
    }
    console.log(`✅ Review 30 dias: ${results.length} follow-ups criados`);
}
// Automação: Resgate de Leads Frios
async function automationResgateLedsFrios() {
    const results = await (0, database_1.query)(`SELECT l.id, l.name, l.phone, l.score
     FROM leads l
     WHERE l.status = 'contacted'
     AND (l.last_contact IS NULL OR l.last_contact < DATE_SUB(NOW(), INTERVAL 7 DAY))`);
    for (const lead of results) {
        await (0, database_1.execute)(`INSERT INTO follow_ups (lead_id, title, description, scheduled_date, follow_up_type, status)
       VALUES (?, ?, ?, NOW(), 'call', 'pending')`, [
            lead.id,
            `🔥 ÚLTIMA CHANCE - ${lead.name}`,
            `7 dias sem contato. Essa é a última tentativa antes de marcar como rejeitado.`
        ]);
    }
    console.log(`✅ Resgate leads frios: ${results.length} follow-ups criados`);
}
// Automação: Win-back de Clientes Inativos
async function automationWinBackClientes() {
    const results = await (0, database_1.query)(`SELECT c.id, c.name, c.phone, MAX(o.created_at) as last_order
     FROM customers c
     LEFT JOIN orders o ON c.id = o.customer_id
     WHERE c.status = 'active'
     AND c.lifetime_value > 0
     GROUP BY c.id
     HAVING (last_order IS NULL OR last_order < DATE_SUB(NOW(), INTERVAL 45 DAY))`);
    for (const customer of results) {
        await (0, database_1.execute)(`INSERT INTO follow_ups (customer_id, title, description, scheduled_date, follow_up_type, status)
       VALUES (?, ?, ?, NOW(), 'email', 'pending')`, [
            customer.id,
            `Re-engagement - ${customer.name}`,
            `Cliente não compra há 45 dias. Oferecer desconto 10% em próxima compra.`
        ]);
    }
    console.log(`✅ Win-back clientes: ${results.length} follow-ups criados`);
}
// Automação: Escalação de Leads Qualificados
async function automationEscalacaoLeads() {
    const results = await (0, database_1.query)(`SELECT l.id, l.name, l.score
     FROM leads l
     WHERE l.status = 'new'
     AND l.score >= 50
     AND NOT EXISTS (
       SELECT 1 FROM follow_ups
       WHERE lead_id = l.id
       AND follow_up_type = 'call'
       AND DATE(created_at) = CURDATE()
     )`);
    for (const lead of results) {
        await (0, database_1.execute)(`INSERT INTO follow_ups (lead_id, title, description, scheduled_date, follow_up_type, status)
       VALUES (?, ?, ?, NOW(), 'call', 'pending')`, [
            lead.id,
            `CHAMAR AGORA - ${lead.name}`,
            `Lead tem score ${lead.score}. Muito qualificado. Chamar HOJE!`
        ]);
        await (0, database_1.execute)(`UPDATE leads SET status = 'qualified' WHERE id = ?`, [lead.id]);
    }
    console.log(`✅ Escalacao leads: ${results.length} leads qualificados`);
}
// ==================== HEALTH CHECK ====================
app.get('/api/health', (req, res) => {
    res.json({ success: true, message: 'CRM API is running' });
});
// ==================== SERVER STARTUP ====================
async function startServer() {
    try {
        await (0, database_1.initializeDatabase)();
        const PORT = process.env.PORT || 3000;
        app.listen(PORT, () => {
            console.log(`🚀 CRM API running on port ${PORT}`);
            console.log(`📊 Dashboard: http://localhost:${PORT}/dashboard`);
            console.log(`🤖 Automações: POST /api/automations/trigger`);
        });
        // Graceful shutdown
        process.on('SIGINT', async () => {
            console.log('\n📛 Shutting down...');
            await (0, database_1.closeDatabase)();
            process.exit(0);
        });
    }
    catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}
exports.default = app;
// For Vercel serverless
async function handler(req, res) {
    return app(req, res);
}
// Start if running locally
if (process.env.NODE_ENV !== 'production') {
    startServer();
}
//# sourceMappingURL=index.js.map