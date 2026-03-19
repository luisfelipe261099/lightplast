-- ========================================================
-- SCRIPT UNIFICADO: CRIAÇÃO DE TABELAS + POVOAMENTO DE DADOS
-- Execute este script no console SQL do TiDB Cloud
-- ========================================================

-- 1. SELECIONAR BANCO
USE test;

-- 2. CRIAÇÃO DE TABELAS (Caso ainda não existam)

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

CREATE TABLE IF NOT EXISTS scheduling (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT NOT NULL,
    type VARCHAR(100),
    description TEXT,
    scheduled_at DATETIME,
    status ENUM('pending', 'confirmed', 'completed', 'cancelled') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id),
    INDEX idx_customer_id (customer_id),
    INDEX idx_scheduled_at (scheduled_at),
    INDEX idx_status (status)
);

-- 3. POVOAMENTO DE DADOS (DADOS REAIS E COMPLETOS)

-- Tenta limpar se já houver lixo (Opcional, comente se não quiser perder o que já tem)
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE scheduling; TRUNCATE TABLE follow_ups; TRUNCATE TABLE orders; 
TRUNCATE TABLE budgets; TRUNCATE TABLE leads; TRUNCATE TABLE products; TRUNCATE TABLE customers;
SET FOREIGN_KEY_CHECKS = 1;

-- CLIENTES
INSERT INTO customers (id, name, email, phone, company, status, source, notes) VALUES
(1, 'Ricardo Santos', 'ricardo@matarazzo.com.br', '(11) 98765-4321', 'Indústrias Matarazzo', 'active', 'Indicação', 'Cliente VIP do setor industrial'),
(2, 'Fernanda Lima', 'fernanda@silvaplasticos.com', '(21) 97654-3210', 'Comércio de Plásticos Silva', 'active', 'Google Ads', 'Interesse em embalagens sustentáveis'),
(3, 'Marcos Oliveira', 'marcos@logex.com.br', '(31) 96543-2109', 'Logística Expressa Ltda', 'prospect', 'LinkedIn', 'Potencial para contrato de longo prazo'),
(4, 'Julia Pereira', 'julia@alvorada.eng.br', '(41) 95432-1098', 'Construtora Alvorada', 'prospect', 'Website', 'Precisa de orçamento para novo empreendimento'),
(5, 'Bruno Souza', 'bruno@precobom.com.br', '(51) 94321-0987', 'Supermercados Preço Bom', 'inactive', 'Cold Call', 'Ex-cliente, tentar reativação em breve');

-- PRODUTOS
INSERT INTO products (id, title, slug, file_name, summary, base_price, active) VALUES
(1, 'Garrafa PET 500ml', 'garrafa-pet-500ml', 'garrafa_pet.html', 'Garrafa plástica de alta densidade', 1.20, 1),
(2, 'Pote Hermético 1L', 'pote-hermetico-1l', 'pote_hermetico.html', 'Pote com vedação em silicone', 4.50, 1),
(3, 'Caixa Organizadora 20L', 'caixa-organiza-20l', 'caixa_organiza.html', 'Caixa empilhável transparente', 15.90, 1),
(4, 'Balde Industrial 10L', 'balde-industrial-10l', 'balde_industrial.html', 'Balde reforçado para químicos', 8.75, 1);

-- LEADS
INSERT INTO leads (id, customer_id, title, description, value, status, priority) VALUES
(1, 1, 'Fornecimento de Garrafas PET', 'Demanda mensal de 10.000 unidades', 12000.00, 'qualified', 'high'),
(2, 2, 'Implementação de Potes Herméticos', 'Teste de prateleira em 5 lojas', 2500.00, 'contacted', 'medium'),
(3, 3, 'Renovação de Caixas para Logística', 'Substituição da frota antiga', 45000.00, 'new', 'low');

-- ORÇAMENTOS
INSERT INTO budgets (id, customer_id, title, description, items, total_value, status, valid_until) VALUES
(1, 1, 'Orçamento Lote Inicial', 'Lote de teste para validação', '[{"description":"Garrafa PET 500ml","quantity":1000,"unitPrice":1.2,"total":1200}]', 1200.00, 'sent', DATE_ADD(NOW(), INTERVAL 15 DAY)),
(2, 4, 'Orçamento Equipamento Industrial', 'Upgrade de linha de produção', '[]', 5500.00, 'approved', DATE_ADD(NOW(), INTERVAL 30 DAY));

-- PEDIDOS
INSERT INTO orders (id, customer_id, budget_id, description, value, status) VALUES
(1, 1, 1, 'Pedido mensal referente contrato #456', 8500.00, 'confirmed'),
(2, 2, NULL, 'Compra emergencial de baldes', 1250.00, 'delivered');

-- ACOMPANHAMENTOS (FOLLOW-UPS)
INSERT INTO follow_ups (id, customer_id, type, description, scheduled_date, completed) VALUES
(1, 1, 'WhatsApp', 'Cobrar resposta sobre o orçamento enviado na segunda', DATE_ADD(NOW(), INTERVAL 2 DAY), 0),
(2, 2, 'Ligação', 'Confirmar se recebeu as amostras do balde industrial', DATE_ADD(NOW(), INTERVAL 1 DAY), 0),
(3, 3, 'Email', 'Enviar apresentação comercial atualizada', DATE_SUB(NOW(), INTERVAL 1 DAY), 1);

-- AGENDAMENTOS (SCHEDULING)
INSERT INTO scheduling (id, customer_id, type, description, scheduled_at, status) VALUES
(1, 4, 'Visita Técnica', 'Vistoria da linha de produção para novos potes', DATE_ADD(NOW(), INTERVAL 5 DAY), 'pending'),
(2, 1, 'Videoconferência', 'Reunião de fechamento de contrato', DATE_ADD(NOW(), INTERVAL 3 DAY), 'confirmed'),
(3, 2, 'Entrega de Amostras', 'Deixar catálogo novo na recepção', DATE_ADD(NOW(), INTERVAL 2 DAY), 'pending');

-- 4. USUÁRIO ADMIN (Se não existir) - Senha: admin123
INSERT IGNORE INTO users (email, password_hash, name, role, status) VALUES
('admin@lightplast.com', '$2b$10$U1n0.f4v.TshVskD6kXGleIDm6fSgCO2L84U5Yre5Zp6G/x5aW5T6', 'Administrador', 'admin', 'active');
