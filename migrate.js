import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
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
      `ALTER TABLE leads ADD COLUMN name VARCHAR(255)`,
      `ALTER TABLE leads ADD COLUMN email VARCHAR(255)`,
      `ALTER TABLE leads ADD COLUMN phone VARCHAR(20)`,
      `ALTER TABLE leads ADD COLUMN company VARCHAR(255)`,
      `ALTER TABLE budgets ADD COLUMN valid_until DATE`,
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
    
    // update existing leads data to not be null if we want? Let's fix the schema first.
    await pool.end();
    console.log('✅ Migração finalizada!');
  } catch (error) {
    console.error('❌ Erro de Conexão:', error.message);
  }
}

migrate();
