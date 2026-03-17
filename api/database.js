"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeDatabase = initializeDatabase;
exports.getConnection = getConnection;
exports.query = query;
exports.execute = execute;
exports.closeDatabase = closeDatabase;
const promise_1 = __importDefault(require("mysql2/promise"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
let pool = null;
async function initializeDatabase() {
    try {
        pool = promise_1.default.createPool({
            host: process.env.TIDB_HOST,
            port: parseInt(process.env.TIDB_PORT || '4000'),
            user: process.env.TIDB_USER,
            password: process.env.TIDB_PASSWORD,
            database: process.env.TIDB_DATABASE,
            connectionLimit: 5,
            waitForConnections: true,
            enableKeepAlive: true,
            keepAliveInitialDelay: 0,
        });
        await createTables();
        console.log('✅ Database initialized successfully');
    }
    catch (error) {
        console.error('❌ Database initialization failed:', error);
        throw error;
    }
}
async function createTables() {
    const conn = await getConnection();
    const tables = [
        // Customers table
        `CREATE TABLE IF NOT EXISTS customers (
      id BIGINT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE,
      phone VARCHAR(20) NOT NULL,
      company VARCHAR(255),
      document VARCHAR(20) UNIQUE,
      address VARCHAR(255),
      city VARCHAR(100),
      state VARCHAR(2),
      zip VARCHAR(10),
      status ENUM('active', 'inactive', 'prospect') DEFAULT 'active',
      lifetime_value DECIMAL(15, 2) DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      last_contact TIMESTAMP NULL,
      INDEX idx_status (status),
      INDEX idx_created_at (created_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
        // Orders table
        `CREATE TABLE IF NOT EXISTS orders (
      id BIGINT AUTO_INCREMENT PRIMARY KEY,
      customer_id BIGINT NOT NULL,
      order_number VARCHAR(50) UNIQUE NOT NULL,
      product_type VARCHAR(100),
      quantity DECIMAL(10, 2),
      unit VARCHAR(20),
      value DECIMAL(15, 2) NOT NULL,
      status ENUM('pending', 'approved', 'delivered', 'cancelled') DEFAULT 'pending',
      description TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      delivery_date TIMESTAMP NULL,
      paid_at TIMESTAMP NULL,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
      INDEX idx_customer_id (customer_id),
      INDEX idx_status (status),
      INDEX idx_created_at (created_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
        // Leads table
        `CREATE TABLE IF NOT EXISTS leads (
      id BIGINT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255),
      phone VARCHAR(20) NOT NULL,
      company VARCHAR(255),
      product_interest VARCHAR(255),
      source ENUM('whatsapp', 'website', 'email', 'referral', 'direct') DEFAULT 'website',
      score INT DEFAULT 0,
      status ENUM('new', 'qualified', 'contacted', 'converted', 'rejected') DEFAULT 'new',
      notes LONGTEXT,
      converted_to_customer BIGINT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      last_contact TIMESTAMP NULL,
      FOREIGN KEY (converted_to_customer) REFERENCES customers(id) ON DELETE SET NULL,
      INDEX idx_status (status),
      INDEX idx_score (score),
      INDEX idx_created_at (created_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
        // Follow-ups table
        `CREATE TABLE IF NOT EXISTS follow_ups (
      id BIGINT AUTO_INCREMENT PRIMARY KEY,
      customer_id BIGINT,
      lead_id BIGINT,
      title VARCHAR(255) NOT NULL,
      description LONGTEXT,
      scheduled_date TIMESTAMP NOT NULL,
      follow_up_type ENUM('call', 'email', 'whatsapp', 'meeting', 'review', 'reminder') DEFAULT 'call',
      status ENUM('pending', 'completed', 'cancelled') DEFAULT 'pending',
      completed_at TIMESTAMP NULL,
      notes LONGTEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      created_by VARCHAR(100) DEFAULT 'system',
      FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
      FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE,
      INDEX idx_status (status),
      INDEX idx_scheduled_date (scheduled_date),
      INDEX idx_customer_id (customer_id),
      INDEX idx_lead_id (lead_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
        // Interactions table
        `CREATE TABLE IF NOT EXISTS interactions (
      id BIGINT AUTO_INCREMENT PRIMARY KEY,
      customer_id BIGINT,
      lead_id BIGINT,
      type ENUM('call', 'email', 'whatsapp', 'meeting', 'note') DEFAULT 'note',
      description LONGTEXT,
      channel VARCHAR(50),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      created_by VARCHAR(100),
      FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
      FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE,
      INDEX idx_created_at (created_at),
      INDEX idx_customer_id (customer_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
        // Automations table
        `CREATE TABLE IF NOT EXISTS automations (
      id BIGINT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      trigger_type ENUM('order_received', 'days_since_order', 'days_since_contact', 'lead_score', 'custom') DEFAULT 'custom',
      trigger_value VARCHAR(255),
      action_type ENUM('create_follow_up', 'send_email', 'send_whatsapp', 'update_status') DEFAULT 'create_follow_up',
      action_data JSON,
      is_active BOOLEAN DEFAULT true,
      last_run TIMESTAMP NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_is_active (is_active)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
        // Automation logs table
        `CREATE TABLE IF NOT EXISTS automation_logs (
      id BIGINT AUTO_INCREMENT PRIMARY KEY,
      automation_id BIGINT,
      customer_id BIGINT,
      lead_id BIGINT,
      action VARCHAR(255),
      status ENUM('success', 'failed', 'pending') DEFAULT 'pending',
      executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (automation_id) REFERENCES automations(id) ON DELETE SET NULL,
      INDEX idx_executed_at (executed_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
        // Budgets/Orçamentos table
        `CREATE TABLE IF NOT EXISTS budgets (
      id BIGINT AUTO_INCREMENT PRIMARY KEY,
      customer_id BIGINT NOT NULL,
      lead_id BIGINT,
      budget_number VARCHAR(50) UNIQUE NOT NULL,
      title VARCHAR(255) NOT NULL,
      description LONGTEXT,
      items JSON,
      subtotal DECIMAL(15, 2),
      tax_percent DECIMAL(5, 2) DEFAULT 0,
      tax_value DECIMAL(15, 2),
      total DECIMAL(15, 2) NOT NULL,
      status ENUM('draft', 'sent', 'approved', 'expired', 'converted') DEFAULT 'draft',
      valid_until TIMESTAMP,
      notes LONGTEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      sent_at TIMESTAMP NULL,
      approved_at TIMESTAMP NULL,
      FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
      FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE SET NULL,
      INDEX idx_customer_id (customer_id),
      INDEX idx_status (status),
      INDEX idx_created_at (created_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
    ];
    for (const table of tables) {
        try {
            await conn.execute(table);
        }
        catch (error) {
            if (error.code !== 'ER_TABLE_EXISTS_ERROR') {
                throw error;
            }
        }
    }
    conn.release();
}
async function getConnection() {
    if (!pool) {
        throw new Error('Database not initialized');
    }
    return pool.getConnection();
}
async function query(sql, values) {
    const conn = await getConnection();
    try {
        const [rows] = await conn.execute(sql, values);
        return rows;
    }
    finally {
        conn.release();
    }
}
async function execute(sql, values) {
    const conn = await getConnection();
    try {
        const [result] = await conn.execute(sql, values);
        return result;
    }
    finally {
        conn.release();
    }
}
async function closeDatabase() {
    if (pool) {
        await pool.end();
    }
}
//# sourceMappingURL=database.js.map