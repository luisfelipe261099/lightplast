-- ========================================================
-- SCRIPT DE POVOAMENTO DE DADOS - LIGHTPLAST CRM
-- Execute este script no console SQL do TiDB Cloud
-- ========================================================

-- 1. LIMPEZA (OPCIONAL - DESCOMENTE SE QUISER LIMPAR ANTES)
-- SET FOREIGN_KEY_CHECKS = 0;
-- DELETE FROM scheduling; DELETE FROM follow_ups; DELETE FROM orders; 
-- DELETE FROM budgets; DELETE FROM leads; DELETE FROM products; DELETE FROM customers;
-- SET FOREIGN_KEY_CHECKS = 1;

-- 2. CLIENTES
INSERT INTO customers (id, name, email, phone, company, status, source, notes) VALUES
(1, 'Ricardo Santos', 'ricardo@matarazzo.com.br', '(11) 98765-4321', 'Indústrias Matarazzo', 'active', 'Indicação', 'Cliente VIP do setor industrial'),
(2, 'Fernanda Lima', 'fernanda@silvaplasticos.com', '(21) 97654-3210', 'Comércio de Plásticos Silva', 'active', 'Google Ads', 'Interesse em embalagens sustentáveis'),
(3, 'Marcos Oliveira', 'marcos@logex.com.br', '(31) 96543-2109', 'Logística Expressa Ltda', 'prospect', 'LinkedIn', 'Potencial para contrato de longo prazo'),
(4, 'Julia Pereira', 'julia@alvorada.eng.br', '(41) 95432-1098', 'Construtora Alvorada', 'prospect', 'Website', 'Precisa de orçamento para novo empreendimento'),
(5, 'Bruno Souza', 'bruno@precobom.com.br', '(51) 94321-0987', 'Supermercados Preço Bom', 'inactive', 'Cold Call', 'Ex-cliente, tentar reativação em breve');

-- 3. PRODUTOS
INSERT INTO products (id, title, slug, file_name, summary, base_price, active) VALUES
(1, 'Garrafa PET 500ml', 'garrafa-pet-500ml', 'garrafa_pet.html', 'Garrafa plástica de alta densidade', 1.20, 1),
(2, 'Pote Hermético 1L', 'pote-hermetico-1l', 'pote_hermetico.html', 'Pote com vedação em silicone', 4.50, 1),
(3, 'Caixa Organizadora 20L', 'caixa-organiza-20l', 'caixa_organiza.html', 'Caixa empilhável transparente', 15.90, 1),
(4, 'Balde Industrial 10L', 'balde-industrial-10l', 'balde_industrial.html', 'Balde reforçado para químicos', 8.75, 1);

-- 4. LEADS
INSERT INTO leads (id, customer_id, title, description, value, status, priority) VALUES
(1, 1, 'Fornecimento de Garrafas PET', 'Demanda mensal de 10.000 unidades', 12000.00, 'qualified', 'high'),
(2, 2, 'Implementação de Potes Herméticos', 'Teste de prateleira em 5 lojas', 2500.00, 'contacted', 'medium'),
(3, 3, 'Renovação de Caixas para Logística', 'Substituição da frota antiga', 45000.00, 'new', 'low');

-- 5. ORÇAMENTOS
INSERT INTO budgets (id, customer_id, title, description, items, total_value, status, valid_until) VALUES
(1, 1, 'Orçamento Lote Inicial', 'Lote de teste para validação', '[{"description":"Garrafa PET 500ml","quantity":1000,"unitPrice":1.2,"total":1200}]', 1200.00, 'sent', DATE_ADD(NOW(), INTERVAL 15 DAY)),
(2, 4, 'Orçamento Equipamento Industrial', 'Upgrade de linha de produção', '[]', 5500.00, 'approved', DATE_ADD(NOW(), INTERVAL 30 DAY));

-- 6. PEDIDOS
INSERT INTO orders (id, customer_id, budget_id, description, value, status) VALUES
(1, 1, 1, 'Pedido mensal referente contrato #456', 8500.00, 'confirmed'),
(2, 2, NULL, 'Compra emergencial de baldes', 1250.00, 'delivered');

-- 7. ACOMPANHAMENTOS (FOLLOW-UPS)
INSERT INTO follow_ups (id, customer_id, type, description, scheduled_date, completed) VALUES
(1, 1, 'WhatsApp', 'Cobrar resposta sobre o orçamento enviado na segunda', DATE_ADD(NOW(), INTERVAL 2 DAY), 0),
(2, 2, 'Ligação', 'Confirmar se recebeu as amostras do balde industrial', DATE_ADD(NOW(), INTERVAL 1 DAY), 0),
(3, 3, 'Email', 'Enviar apresentação comercial atualizada', DATE_SUB(NOW(), INTERVAL 1 DAY), 1);

-- 8. AGENDAMENTOS (SCHEDULING)
INSERT INTO scheduling (id, customer_id, type, description, scheduled_at, status) VALUES
(1, 4, 'Visita Técnica', 'Vistoria da linha de produção para novos potes', DATE_ADD(NOW(), INTERVAL 5 DAY), 'pending'),
(2, 1, 'Videoconferência', 'Reunião de fechamento de contrato', DATE_ADD(NOW(), INTERVAL 3 DAY), 'confirmed'),
(3, 2, 'Entrega de Amostras', 'Deixar catálogo novo na recepção', DATE_ADD(NOW(), INTERVAL 2 DAY), 'pending');
