-- ==================== DADOS FICTÍCIOS PARA O CRM ====================
-- Execute este SQL para adicionar dados de exemplo ao TiDB Cloud
-- Acesse: https://tidbcloud.com → SQL Editor
-- Cole TUDO abaixo e clique RUN

USE test;

-- ==================== INSERIR CLIENTES ====================
INSERT INTO customers (name, email, phone, company, status, source, notes, created_at, last_contact) VALUES
('João Silva Santos', 'joao.silva@techsolutions.com.br', '11998765432', 'Tech Solutions Brasil', 'active', 'website', 'Cliente VIP - Contato principal: João. Grande potencial de expansão.', NOW(), NOW()),
('Maria Oliveira Costa', 'maria.costa@digital-marketing.com.br', '21987654321', 'Digital Marketing Agency', 'active', 'referral', 'Excelente relacionamento. Contato mensal obrigatório.', NOW(), DATE_SUB(NOW(), INTERVAL 5 DAY)),
('Carlos Mendes', 'carlos@manufatura.com.br', '31996543210', 'Manufatura Industrial Ltda', 'prospect', 'cold_call', 'Primeira abordagem. Interesse inicial em demonstração.', NOW(), NULL),
('Ana Paula Ferreira', 'ana.ferreira@startupxyz.com.br', '85988776655', 'Startup XYZ', 'active', 'website', 'Startup tecnológica em crescimento. Budget limitado.', NOW(), DATE_SUB(NOW(), INTERVAL 10 DAY)),
('Roberto Gomes', 'roberto@logistica.com.br', '47991234567', 'Logística Express', 'inactive', 'website', 'Não respondeu aos últimos contatos. Marcar follow-up.', NOW(), DATE_SUB(NOW(), INTERVAL 45 DAY)),
('Fernanda Souza', 'fernanda@consultoria.com.br', '61999887766', 'Consultoria Empresarial', 'prospect', 'linkedin', 'Contato via LinkedIn. Agendado apresentação para semana que vem.', NOW(), NULL),
('Lucas Ribeiro', 'lucas@ecommerce.com.br', '75987654321', 'E-Commerce Plus', 'active', 'referral', 'Parceiro de longa data. Renovação de contrato em breve.', NOW(), DATE_SUB(NOW(), INTERVAL 3 DAY));

-- ==================== INSERIR LEADS ====================
INSERT INTO leads (customer_id, title, description, value, status, priority, created_at, updated_at) VALUES
(1, 'Implementação Sistema ERP', 'Cliente solicitou implementação completa do ERP para 5 filiais', 85000.00, 'qualified', 'high', NOW(), NOW()),
(1, 'Treinamento de Usuários', 'Treinamento para 50 usuários em 3 módulos diferentes', 12000.00, 'open', 'medium', DATE_SUB(NOW(), INTERVAL 7 DAY), DATE_SUB(NOW(), INTERVAL 7 DAY)),
(2, 'Consultoria de Marketing Digital', 'Estratégia de marketing para 6 meses', 18000.00, 'contacted', 'high', DATE_SUB(NOW(), INTERVAL 5 DAY), DATE_SUB(NOW(), INTERVAL 2 DAY)),
(3, 'Manutenção Preventiva Anual', 'Contrato de manutenção com 2 visitas mensais', 24000.00, 'open', 'medium', DATE_SUB(NOW(), INTERVAL 10 DAY), DATE_SUB(NOW(), INTERVAL 10 DAY)),
(4, 'Desenvolvimento App Mobile', 'App de gestão de tarefas iOS + Android', 35000.00, 'qualified', 'high', DATE_SUB(NOW(), INTERVAL 12 DAY), DATE_SUB(NOW(), INTERVAL 3 DAY)),
(5, 'Suporte Técnico Premium', 'Suporte 24/7 com atendimento prioritário', 8000.00, 'lost', 'low', DATE_SUB(NOW(), INTERVAL 30 DAY), DATE_SUB(NOW(), INTERVAL 20 DAY)),
(6, 'Auditoria Financeira', 'Auditoria completa de processos financeiros', 22000.00, 'open', 'medium', DATE_SUB(NOW(), INTERVAL 2 DAY), DATE_SUB(NOW(), INTERVAL 2 DAY)),
(7, 'Integração Sistemas Legados', 'Integração plataforma e-commerce com ERP antigo', 45000.00, 'converted', 'high', DATE_SUB(NOW(), INTERVAL 20 DAY), DATE_SUB(NOW(), INTERVAL 5 DAY));

-- ==================== INSERIR ORÇAMENTOS ====================
INSERT INTO budgets (customer_id, title, description, items, total_value, status, tax, discount, created_at, updated_at) VALUES
(1, 'Orçamento ERP - Proposta 2026', 'ERP completo + implementação + suporte 12 meses',
'[
  {"description":"Licença ERP - 5 usuários","quantity":5,"unitPrice":5000,"total":25000},
  {"description":"Implementação e configuração","quantity":1,"unitPrice":40000,"total":40000},
  {"description":"Treinamento de usuários","quantity":50,"unitPrice":200,"total":10000},
  {"description":"Suporte técnico 12 meses","quantity":12,"unitPrice":2000,"total":24000}
]',
99000.00, 'sent', 3000.00, 5000.00, DATE_SUB(NOW(), INTERVAL 8 DAY), DATE_SUB(NOW(), INTERVAL 8 DAY)),

(2, 'Pacote Marketing Digital Q1', 'Consultoria + gerenciamento de campanhas para Q1 2026',
'[
  {"description":"Consultoria estratégica","quantity":1,"unitPrice":5000,"total":5000},
  {"description":"Gerenciamento Google Ads","quantity":3,"unitPrice":2000,"total":6000},
  {"description":"Gestão redes sociais","quantity":3,"unitPrice":2500,"total":7500}
]',
18500.00, 'approved', 900.00, 900.00, DATE_SUB(NOW(), INTERVAL 6 DAY), DATE_SUB(NOW(), INTERVAL 1 DAY)),

(4, 'App Mobile - Fase 1', 'Desenvolvimento iOS + Android com 15 telas',
'[
  {"description":"Design UI/UX - 15 telas","quantity":15,"unitPrice":800,"total":12000},
  {"description":"Desenvolvimento iOS","quantity":1,"unitPrice":15000,"total":15000},
  {"description":"Desenvolvimento Android","quantity":1,"unitPrice":15000,"total":15000},
  {"description":"Testes e QA","quantity":1,"unitPrice":3000,"total":3000}
]',
45000.00, 'draft', 2700.00, 2000.00, DATE_SUB(NOW(), INTERVAL 15 DAY), DATE_SUB(NOW(), INTERVAL 15 DAY));

-- ==================== INSERIR PEDIDOS ====================
INSERT INTO orders (customer_id, budget_id, value, status, created_at, updated_at) VALUES
(1, 1, 99000.00, 'confirmed', DATE_SUB(NOW(), INTERVAL 5 DAY), DATE_SUB(NOW(), INTERVAL 5 DAY)),
(2, 2, 18500.00, 'confirmed', DATE_SUB(NOW(), INTERVAL 2 DAY), DATE_SUB(NOW(), INTERVAL 2 DAY)),
(7, NULL, 45000.00, 'shipped', DATE_SUB(NOW(), INTERVAL 10 DAY), DATE_SUB(NOW(), INTERVAL 3 DAY)),
(1, NULL, 15000.00, 'pending', DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_SUB(NOW(), INTERVAL 1 DAY));

-- ==================== INSERIR FOLLOW-UPS ====================
INSERT INTO follow_ups (customer_id, type, description, scheduled_date, completed, created_at) VALUES
(1, 'call', 'Confirmar aprovação do orçamento de ERP', DATE_ADD(NOW(), INTERVAL 2 DAY), 0, NOW()),
(2, 'meeting', 'Reunião para apresentar resultados de campanhas Q1', DATE_ADD(NOW(), INTERVAL 5 DAY), 0, NOW()),
(3, 'email', 'Enviar proposta técnica com detalhes da solução', DATE_ADD(NOW(), INTERVAL 1 DAY), 0, NOW()),
(4, 'call', 'Discussão sobre timeline e milestones do app', DATE_ADD(NOW(), INTERVAL 3 DAY), 0, NOW()),
(5, 'email', 'Verificar status e interesse em retomada de negociações', DATE_ADD(NOW(), INTERVAL 7 DAY), 0, NOW()),
(6, 'meeting', 'Apresentação de proposta de auditoria', DATE_ADD(NOW(), INTERVAL 4 DAY), 0, NOW()),
(7, 'call', 'Follow-up pós-venda - satisfação com implementação', DATE_ADD(NOW(), INTERVAL 10 DAY), 0, NOW());

-- ==================== RESULTADO FINAL ====================
-- ✅ PRONTO! Dados fictícios inseridos com sucesso!

-- Verifique executando estas consultas:
-- SELECT COUNT(*) as total_clientes FROM customers;
-- SELECT COUNT(*) as total_leads FROM leads;
-- SELECT COUNT(*) as total_orcamentos FROM budgets;
-- SELECT COUNT(*) as total_pedidos FROM orders;
-- SELECT COUNT(*) as total_followups FROM follow_ups;
