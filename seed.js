import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

const dbConfig = {
  host: process.env.TIDB_HOST,
  port: process.env.TIDB_PORT,
  user: process.env.TIDB_USER,
  password: process.env.TIDB_PASSWORD,
  database: process.env.TIDB_DATABASE,
  ssl: {
    minVersion: 'TLSv1.2',
    rejectUnauthorized: true,
  },
};

async function seed() {
  try {
    const connection = await mysql.createConnection(dbConfig);
    console.log('Connected to TiDB...');

    try {
      console.log('Cleaning existing data...');
      await connection.query('DELETE FROM audit_logs');
      await connection.query('DELETE FROM scheduling');
      await connection.query('DELETE FROM follow_ups');
      await connection.query('DELETE FROM orders');
      await connection.query('DELETE FROM budgets');
      await connection.query('DELETE FROM leads');
      await connection.query('DELETE FROM products');
      await connection.query('DELETE FROM customers');

      console.log('Inserting customers...');
      await connection.query(`
        INSERT INTO customers (id, name, email, phone, company, status, source, notes) VALUES
        (1, 'Ricardo Santos', 'ricardo@matarazzo.com.br', '(11) 98765-4321', 'Indústrias Matarazzo', 'active', 'Indicação', 'Cliente VIP do setor industrial'),
        (2, 'Fernanda Lima', 'fernanda@silvaplasticos.com', '(21) 97654-3210', 'Comércio de Plásticos Silva', 'active', 'Google Ads', 'Interesse em embalagens sustentáveis'),
        (3, 'Marcos Oliveira', 'marcos@logex.com.br', '(31) 96543-2109', 'Logística Expressa Ltda', 'prospect', 'LinkedIn', 'Potencial para contrato de longo prazo'),
        (4, 'Julia Pereira', 'julia@alvorada.eng.br', '(41) 95432-1098', 'Construtora Alvorada', 'prospect', 'Website', 'Precisa de orçamento para novo empreendimento'),
        (5, 'Bruno Souza', 'bruno@precobom.com.br', '(51) 94321-0987', 'Supermercados Preço Bom', 'inactive', 'Cold Call', 'Ex-cliente, tentar reativação em breve')
      `);

      console.log('Inserting products...');
      await connection.query(`
        INSERT INTO products (title, slug, file_name, summary, base_price, active) VALUES
        ('Garrafa PET 500ml', 'garrafa-pet-500ml', 'garrafa_pet.html', 'Garrafa plástica de alta densidade', 1.20, 1),
        ('Pote Hermético 1L', 'pote-hermetico-1l', 'pote_hermetico.html', 'Pote com vedação em silicone', 4.50, 1),
        ('Caixa Organizadora 20L', 'caixa-organizadora-20l', 'caixa_organiza.html', 'Caixa empilhável transparente', 15.90, 1),
        ('Balde Industrial 10L', 'balde-industrial-10l', 'balde_industrial.html', 'Balde reforçado para químicos', 8.75, 1)
      `);

      console.log('Inserting leads...');
      await connection.query(`
        INSERT INTO leads (customer_id, title, description, value, status, priority) VALUES
        (1, 'Fornecimento de Garrafas PET', 'Demanda mensal de 10.000 unidades', 12000.00, 'qualified', 'high'),
        (2, 'Implementação de Potes Herméticos', 'Teste de prateleira em 5 lojas', 2500.00, 'contacted', 'medium'),
        (3, 'Renovação de Caixas para Logística', 'Substituição da frota antiga', 45000.00, 'new', 'low')
      `);

      console.log('Inserting budgets...');
      const itemsJson = JSON.stringify([{ description: 'Garrafa PET 500ml', quantity: 1000, unitPrice: 1.20, total: 1200 }]);
      await connection.query(`
        INSERT INTO budgets (customer_id, title, description, items, total_value, status, valid_until) VALUES
        (1, 'Orçamento Lote Inicial', 'Lote de teste para validação', ?, 1200.00, 'sent', DATE_ADD(NOW(), INTERVAL 15 DAY)),
        (4, 'Orçamento Equipamento Industrial', 'Upgrade de linha de produção', '[]', 5500.00, 'approved', DATE_ADD(NOW(), INTERVAL 30 DAY))
      `, [itemsJson]);

      console.log('Inserting orders...');
      await connection.query(`
        INSERT INTO orders (customer_id, description, value, status) VALUES
        (1, 'Pedido mensal referente contrato #456', 8500.00, 'confirmed'),
        (2, 'Compra emergencial de baldes', 1250.00, 'delivered')
      `);

      console.log('Inserting follow-ups...');
      await connection.query(`
        INSERT INTO follow_ups (customer_id, type, description, scheduled_date, completed) VALUES
        (1, 'WhatsApp', 'Cobrar resposta sobre o orçamento enviado na segunda', DATE_ADD(NOW(), INTERVAL 2 DAY), 0),
        (2, 'Ligação', 'Confirmar se recebeu as amostras do balde industrial', DATE_ADD(NOW(), INTERVAL 1 DAY), 0),
        (3, 'Email', 'Enviar apresentação comercial atualizada', DATE_SUB(NOW(), INTERVAL 1 DAY), 1)
      `);

      console.log('Inserting scheduling...');
      await connection.query(`
        INSERT INTO scheduling (customer_id, type, description, scheduled_at, status) VALUES
        (4, 'Visita Técnica', 'Vistoria da linha de produção para novos potes', DATE_ADD(NOW(), INTERVAL 5 DAY), 'pending'),
        (1, 'Videoconferência', 'Reunião de fechamento de contrato', DATE_ADD(NOW(), INTERVAL 3 DAY), 'confirmed'),
        (2, 'Entrega de Amostras', 'Deixar catálogo novo na recepção', DATE_ADD(NOW(), INTERVAL 2 DAY), 'pending')
      `);

      console.log('Seed completed successfully!');
    } catch (sqlError) {
      console.error('SQL Error:', sqlError.message);
      console.error('Stack:', sqlError.stack);
    } finally {
      await connection.end();
    }
  } catch (connError) {
    console.error('Connection Error:', connError.message);
    console.error('Stack:', connError.stack);
  }
}

seed();
