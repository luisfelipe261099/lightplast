import fs from 'fs';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

dotenv.config();

const __dirname = dirname(fileURLToPath(import.meta.url));

async function runSetup() {
  console.log('Criando tabelas no TiDB Cloud...');
  
  try {
    const connection = await mysql.createConnection({
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

    const sqlFile = fs.readFileSync(join(__dirname, 'setup.sql'), 'utf8');
    
    await connection.query(sqlFile);
    console.log('✅ Tabelas criadas com sucesso!');
    
    const sqlMockData = fs.readFileSync(join(__dirname, 'DADOS_FICTICIOS.sql'), 'utf8');
    await connection.query(sqlMockData);
    console.log('✅ Dados fictícios inseridos com sucesso!');

    await connection.end();
  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

runSetup();
