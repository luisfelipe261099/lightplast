<?php
/**
 * CRM Database Manager
 * SQLite database for LightPlast CRM
 */

class Database {
    private $db;
    private $dbPath = __DIR__ . '/../data/crm.db';

    public function __construct() {
        $this->initDatabase();
    }

    private function initDatabase() {
        if (!is_dir(__DIR__ . '/../data')) {
            mkdir(__DIR__ . '/../data', 0755, true);
        }

        $this->db = new PDO('sqlite:' . $this->dbPath);
        $this->db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

        if (!file_exists($this->dbPath)) {
            $this->createTables();
        }
    }

    private function createTables() {
        $tables = [
            // Clientes (Customers)
            "CREATE TABLE IF NOT EXISTS customers (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT UNIQUE,
                phone TEXT NOT NULL,
                company TEXT,
                document TEXT UNIQUE,
                address TEXT,
                city TEXT,
                state TEXT,
                zip TEXT,
                status TEXT DEFAULT 'active',
                lifetime_value REAL DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                last_contact DATETIME
            )",

            // Pedidos (Orders)
            "CREATE TABLE IF NOT EXISTS orders (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                customer_id INTEGER NOT NULL,
                order_number TEXT UNIQUE NOT NULL,
                product_type TEXT,
                quantity REAL,
                unit TEXT,
                value REAL NOT NULL,
                status TEXT DEFAULT 'pending',
                description TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                delivery_date DATETIME,
                paid_at DATETIME,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
            )",

            // Leads
            "CREATE TABLE IF NOT EXISTS leads (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT,
                phone TEXT NOT NULL,
                company TEXT,
                product_interest TEXT,
                source TEXT,
                score INTEGER DEFAULT 0,
                status TEXT DEFAULT 'new',
                notes TEXT,
                converted_to_customer INTEGER,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                last_contact DATETIME,
                FOREIGN KEY (converted_to_customer) REFERENCES customers(id)
            )",

            // Agenda de Retorno (Follow-up Schedule)
            "CREATE TABLE IF NOT EXISTS follow_ups (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                customer_id INTEGER,
                lead_id INTEGER,
                title TEXT NOT NULL,
                description TEXT,
                scheduled_date DATETIME NOT NULL,
                follow_up_type TEXT,
                status TEXT DEFAULT 'pending',
                completed_at DATETIME,
                notes TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                created_by TEXT DEFAULT 'system',
                FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
                FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE
            )",

            // Histórico de Interações (Interaction Log)
            "CREATE TABLE IF NOT EXISTS interactions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                customer_id INTEGER,
                lead_id INTEGER,
                type TEXT,
                description TEXT,
                channel TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                created_by TEXT,
                FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
                FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE
            )",

            // Automações (Smart Reminders)
            "CREATE TABLE IF NOT EXISTS automations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                trigger_type TEXT,
                trigger_value TEXT,
                action_type TEXT,
                action_data TEXT,
                is_active INTEGER DEFAULT 1,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )",

            // Histórico de Automações (Automation Log)
            "CREATE TABLE IF NOT EXISTS automation_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                automation_id INTEGER,
                customer_id INTEGER,
                lead_id INTEGER,
                action TEXT,
                status TEXT,
                executed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (automation_id) REFERENCES automations(id)
            )"
        ];

        foreach ($tables as $sql) {
            $this->db->exec($sql);
        }

        // Create indices for performance
        $this->db->exec("CREATE INDEX IF NOT EXISTS idx_customers_status ON customers(status)");
        $this->db->exec("CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id)");
        $this->db->exec("CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status)");
        $this->db->exec("CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status)");
        $this->db->exec("CREATE INDEX IF NOT EXISTS idx_follow_ups_scheduled ON follow_ups(scheduled_date)");
        $this->db->exec("CREATE INDEX IF NOT EXISTS idx_follow_ups_status ON follow_ups(status)");
    }

    public function getConnection() {
        return $this->db;
    }

    public function query($sql, $params = []) {
        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        return $stmt;
    }

    public function lastInsertId() {
        return $this->db->lastInsertId();
    }
}

// Initialize database connection
$db = new Database();
