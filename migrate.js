import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
dotenv.config();

async function migrate() {
  console.log('Iniciando migração do banco...');
  
  try {
    const pool = await mysql.createPool({
      connectionLimit: 1,
      host: process.env.TIDB_HOST,
      port: process.env.TIDB_PORT || 4000,
      user: process.env.TIDB_USER,
      password: process.env.TIDB_PASSWORD,
      database: process.env.TIDB_DATABASE,
      ssl: {
        minVersion: 'TLSv1.2',
        rejectUnauthorized: true
      },
      multipleStatements: true
    });

    const queries = [
      `CREATE TABLE IF NOT EXISTS products (
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
        UNIQUE KEY uq_products_file_name (file_name)
      )`,
      `CREATE TABLE IF NOT EXISTS users (
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
      )`,
      `CREATE TABLE IF NOT EXISTS audit_logs (
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
      )`,
      `ALTER TABLE leads ADD COLUMN name VARCHAR(255)`,
      `ALTER TABLE leads ADD COLUMN email VARCHAR(255)`,
      `ALTER TABLE leads ADD COLUMN phone VARCHAR(20)`,
      `ALTER TABLE leads ADD COLUMN company VARCHAR(255)`,
      `ALTER TABLE budgets ADD COLUMN valid_until DATE`,
      `ALTER TABLE budgets ADD COLUMN items JSON`,
      `ALTER TABLE orders ADD COLUMN description TEXT`,
      `ALTER TABLE customers DROP INDEX idx_email`,
      `ALTER TABLE customers MODIFY email VARCHAR(255) NULL`
    ];

    for (let q of queries) {
      try {
        await pool.query(q);
        console.log(`✅ Sucesso: ${q}`);
      } catch (e) {
        if (e.message.includes('Duplicate column name')) {
          console.log(`⚠️ Ignorado (já existe): ${q}`);
        } else if (e.message.includes('Can\'t drop index')) {
           console.log(`⚠️ Ignorado (index já caiu): ${q}`);
        } else {
          console.error(`❌ Erro em ${q}:`, e.message);
        }
      }
    }
    
    // Criar usuário admin padrão
    try {
      const adminEmail = 'admin@lightplast.com';
      const adminPassword = 'admin123';
      const passwordHash = await bcrypt.hash(adminPassword, 10);
      
      await pool.query(
        `INSERT IGNORE INTO users (email, password_hash, name, role, status, created_at, updated_at) 
         VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
        [adminEmail, passwordHash, 'Administrador', 'admin', 'active']
      );
      console.log(`✅ Usuário padrão criado/verificado: ${adminEmail} / ${adminPassword}`);
    } catch (e) {
      console.warn('⚠️ Erro ao criar usuário padrão:', e.message);
    }
    
    await pool.end();
    console.log('✅ Migração finalizada!');
  } catch (error) {
    console.error('❌ Erro de Conexão:', error.message);
  }
}

migrate();
