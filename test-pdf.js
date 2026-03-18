import 'dotenv/config';
import mysql from 'mysql2/promise';

async function testPDFData() {
  const connection = await mysql.createConnection({
    host: process.env.TIDB_HOST,
    port: parseInt(process.env.TIDB_PORT),
    user: process.env.TIDB_USER,
    password: process.env.TIDB_PASSWORD,
    database: process.env.TIDB_DATABASE,
    ssl: { minVersion: 'TLSv1.2', rejectUnauthorized: true }
  });

  console.log('🔄 Testando dados do Orçamento...');
  try {
    const [budgets] = await connection.execute('SELECT id FROM budgets LIMIT 1');
    if (budgets.length > 0) {
        const bid = budgets[0].id;
        const [rows] = await connection.execute(
          'SELECT b.*, c.name as customer_name, c.company as customer_company FROM budgets b JOIN customers c ON b.customer_id = c.id WHERE b.id = ?',
          [bid]
        );
        if (rows.length > 0) {
            console.log('✅ Orçamento #' + bid + ' encontrado com sucesso!');
            console.log('📦 Título:', rows[0].title);
            console.log('👤 Cliente:', rows[0].customer_name);
            console.log('🏢 Empresa:', rows[0].customer_company);
            console.log('💰 Valor:', rows[0].total_value);
        } else {
            console.log('⚠️ Orçament ID ' + bid + ' encontrado, mas a junção com Cliente falhou. O customer_id do orçamento (' + budgets[0].customer_id + ') existe no banco?');
        }
    } else {
        console.log('❌ Nenhum orçamento cadastrado no banco para teste.');
    }
  } catch (err) {
    console.error('❌ Erro na consulta SQL:', err.message);
  } finally {
    await connection.end();
  }
}

testPDFData();
