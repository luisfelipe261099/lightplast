import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

async function migrateEnums() {
  console.log('Removendo travas ENUM do TiDB Cloud...');
  
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
      `ALTER TABLE leads MODIFY COLUMN status VARCHAR(50) DEFAULT 'new'`,
      `ALTER TABLE leads MODIFY COLUMN priority VARCHAR(50) DEFAULT 'medium'`,
      `ALTER TABLE orders MODIFY COLUMN status VARCHAR(50) DEFAULT 'pending'`,
      `ALTER TABLE budgets MODIFY COLUMN status VARCHAR(50) DEFAULT 'draft'`,
      `ALTER TABLE customers MODIFY COLUMN status VARCHAR(50) DEFAULT 'prospect'`
    ];

    for (let q of queries) {
      try {
        await pool.query(q);
        console.log(`✅ Sucesso: ${q}`);
      } catch (e) {
        console.error(`❌ Erro em ${q}:`, e.message);
      }
    }
    
    await pool.end();
    console.log('✅ Migração de ENUM finalizada!');
  } catch (error) {
    console.error('❌ Erro de Conexão:', error.message);
  }
}

migrateEnums();
