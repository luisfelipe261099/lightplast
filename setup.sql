-- ==================== DATABASE INITIALIZATION ====================
-- Execute este arquivo SQL no TiDB Cloud SQL Editor
-- Cria todas as tabelas necessárias para o CRM

-- ==================== CUSTOMERS TABLE ====================
CREATE TABLE IF NOT EXISTS customers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(20),
    company VARCHAR(255),
    status ENUM('active', 'inactive', 'prospect') DEFAULT 'prospect',
    source VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_contact TIMESTAMP NULL,
    INDEX idx_status (status),
    INDEX idx_email (email),
    INDEX idx_company (company)
);

-- ==================== LEADS TABLE ====================
CREATE TABLE IF NOT EXISTS leads (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT,
    title VARCHAR(255),
    description TEXT,
    value DECIMAL(10,2),
    status ENUM('new', 'open', 'contacted', 'qualified', 'converted', 'lost') DEFAULT 'new',
    priority ENUM('low', 'medium', 'high') DEFAULT 'medium',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id),
    INDEX idx_status (status),
    INDEX idx_customer_id (customer_id),
    INDEX idx_priority (priority)
);

-- ==================== PRODUCTS TABLE ====================
CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    summary TEXT,
    image VARCHAR(500),
    category_file VARCHAR(255),
    base_price DECIMAL(10,2) DEFAULT 0,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_products_slug (slug),
    UNIQUE KEY uq_products_file_name (file_name),
    INDEX idx_products_active (active),
    INDEX idx_products_title (title)
);

-- ==================== BUDGETS TABLE ====================
CREATE TABLE IF NOT EXISTS budgets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT NOT NULL,
    title VARCHAR(255),
    description TEXT,
    items JSON,
    total_value DECIMAL(10,2),
    status ENUM('draft', 'sent', 'approved', 'rejected', 'expired', 'converted') DEFAULT 'draft',
    tax DECIMAL(10,2) DEFAULT 0,
    discount DECIMAL(10,2) DEFAULT 0,
    valid_until DATE NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id),
    INDEX idx_status (status),
    INDEX idx_customer_id (customer_id),
    INDEX idx_created_at (created_at)
);

-- ==================== ORDERS TABLE ====================
CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT NOT NULL,
    budget_id INT,
    description TEXT,
    value DECIMAL(10,2),
    status ENUM('pending', 'confirmed', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id),
    FOREIGN KEY (budget_id) REFERENCES budgets(id),
    INDEX idx_status (status),
    INDEX idx_customer_id (customer_id),
    INDEX idx_budget_id (budget_id)
);

-- ==================== FOLLOW_UPS TABLE ====================
CREATE TABLE IF NOT EXISTS follow_ups (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT NOT NULL,
    type VARCHAR(50),
    description TEXT,
    scheduled_date DATETIME,
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id),
    INDEX idx_customer_id (customer_id),
    INDEX idx_scheduled_date (scheduled_date),
    INDEX idx_completed (completed)
);

-- ==================== USERS TABLE ====================
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role ENUM('admin', 'manager', 'user') DEFAULT 'user',
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL,
    INDEX idx_email (email),
    INDEX idx_status (status),
    INDEX idx_role (role)
);

-- ==================== AUDIT_LOGS TABLE ====================
CREATE TABLE IF NOT EXISTS audit_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    action VARCHAR(100) NOT NULL,
    table_name VARCHAR(100),
    record_id INT,
    old_values JSON,
    new_values JSON,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    INDEX idx_user_id (user_id),
    INDEX idx_created_at (created_at),
    INDEX idx_action (action),
    INDEX idx_table_name (table_name)
);

-- ==================== SAMPLE DATA (OPCIONAL) ====================
-- Descomente as linhas abaixo para inserir dados de exemplo

-- Usuário padrão (senha: admin123 - hash gerado pelo backend)
-- INSERT INTO users (email, password_hash, name, role, status) VALUES
-- ('admin@lightplast.com', '$2b$10$...', 'Administrador', 'admin', 'active');

-- INSERT INTO customers (name, email, phone, company, status, source) VALUES
-- ('João Silva', 'joao@example.com', '11999999999', 'Tech Solutions', 'active', 'website'),
-- ('Maria Santos', 'maria@example.com', '21988888888', 'Digital Marketing', 'prospect', 'referral'),
-- ('Carlos Oliveira', 'carlos@example.com', '31987777777', 'Manufacturing Inc', 'inactive', 'cold_call');

-- INSERT INTO leads (customer_id, title, description, value, status, priority) VALUES
-- (1, 'Implementation Project', 'Complete system implementation', 25000.00, 'qualified', 'high'),
-- (2, 'Consulting Services', 'Marketing strategy consulting', 5000.00, 'contacted', 'medium'),
-- (3, 'Product Upgrade', 'Hardware upgrade project', 15000.00, 'open', 'low');

-- INSERT INTO budgets (customer_id, title, items, total_value, status) VALUES
-- (1, 'Software License Budget', '[{"description":"License Year 1","quantity":1,"unitPrice":10000,"total":10000}]', 10000.00, 'sent');

-- ==================== VERIFICATION ====================
-- Execute isto para verificar se as tabelas foram criadas:
-- SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = 'test';
