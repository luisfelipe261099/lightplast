# 🆓 Automações 100% Gratuitas - Guia Completo

## O Problema com Node-Cron em Vercel

Vercel é **serverless**, o que significa:
- ✅ Código roda quando precisa (só quando há requisição)
- ❌ Não há "processo contínuo rodando" no background
- ❌ Node-cron não funciona em serverless (precisa de processo ativo)

## Solução: Automações Via Webhooks + IFTTT/Zapier (FREE)

### Opção 1: IFTTT (Completamente Gratuito)

**IFTTT = If This Then That**
- Free forever
- 2 ações por applet
- Suporta 100+ integrações

#### Exemplo: Follow-up 30 Dias Após Pedido

**Setup IFTTT:**
1. Acesse https://ifttt.com (crie conta)
2. Clique "+" > "Create"
3. Configure:

```
IF: Webhook recebe (service IFTTT)
THEN: POST para seu CRM API

IF (Trigger):
  - Service: Webhooks
  - Event: "check_orders_30_days"
  - Run every day às 8h

THEN (Action):
  - Service: Webhooks
  - Method: POST
  - URL: https://seu-site.vercel.app/api/trigger-automation
  - Body: { "type": "review_30_days" }
```

### Opção 2: Zapier Free (Recomendado)

**Zapier = IFTTT turbinado**
- Free forever com limite
- 5 Zaps ativos gratuitos
- Interface melhor

#### Setup Automação: Review 30 Dias

```
ZAP NAME: "Review Cliente 30 Dias"

TRIGGER (IF THIS):
  Service: Schedule
  When: Daily at 08:00 AM
  
ACTION (DO THIS):  
  Service: Webhooks
  Method: POST
  URL: https://seu-site.vercel.app/api/automations/trigger
  Body:
  {
    "type": "review_30_days",
    "timestamp": "{{ now }}"
  }

ACTION 2 (THEN):
  Service: Email by Zapier
  To: seu_email@gmail.com
  Subject: Automação Executada
  Body: Retornos de 30 dias criados
```

### Opção 3: Endpoint de Trigger Manual (100% Free)

Você mesmo dispara as automações sem nenhuma service:

```bash
# Diariamente (você configura no seu PC com Task Scheduler):
curl -X POST https://seu-site.vercel.app/api/automations/trigger \
  -H "Content-Type: application/json" \
  -d '{
    "type": "review_30_days", 
    "type": "resgate_leads_frios",
    "type": "win_back_clientes"
  }'
```

## API de Automações (Implementar no api/index.ts)

```typescript
// POST /api/automations/trigger
app.post('/api/automations/trigger', async (req: Request, res: Response) => {
  try {
    const { type } = req.body;

    switch (type) {
      case 'review_30_days':
        await automationReview30Days();
        break;
      case 'resgate_leads_frios':
        await automationResgateLedsFrios();
        break;
      case 'win_back_clientes':
        await automationWinBackClientes();
        break;
    }

    res.json({ success: true, message: `Automação ${type} executada` });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Automação: Review 30 Dias
async function automationReview30Days() {
  const conn = await getConnection();
  
  // Buscar pedidos com 30 dias
  const sql = `
    SELECT o.*, c.name, c.phone, c.email
    FROM orders o
    JOIN customers c ON o.customer_id = c.id
    WHERE o.status = 'delivered'
    AND DATE(o.delivery_date) = DATE_SUB(CURDATE(), INTERVAL 30 DAY)
    AND NOT EXISTS (
      SELECT 1 FROM follow_ups
      WHERE customer_id = c.id
      AND created_at > DATE_SUB(NOW(), INTERVAL 25 DAY)
    )
  `;

  const [orders] = await conn.execute(sql);

  // Para cada pedido, criar follow-up
  for (const order of orders as any[]) {
    await execute(
      `INSERT INTO follow_ups (customer_id, title, description, scheduled_date, follow_up_type, status)
       VALUES (?, ?, ?, NOW(), 'whatsapp', 'pending')`,
      [
        order.customer_id,
        `Review - ${order.name}`,
        `Revisar satisfação com pedido de 30 dias. Oferecer próxima venda.`
      ]
    );
  }

  conn.release();
}

// Automação: Resgate Leads Frios (7 dias sem contato)
async function automationResgateLedsFrios() {
  const conn = await getConnection();

  const sql = `
    SELECT l.*, COUNT(i.id) as interaction_count
    FROM leads l
    LEFT JOIN interactions i ON l.id = i.lead_id
    WHERE l.status = 'contacted'
    AND (l.last_contact IS NULL OR l.last_contact < DATE_SUB(NOW(), INTERVAL 7 DAY))
    GROUP BY l.id
    HAVING interaction_count > 0
  `;

  const [leads] = await conn.execute(sql);

  for (const lead of leads as any[]) {
    await execute(
      `INSERT INTO follow_ups (lead_id, title, description, scheduled_date, follow_up_type, status)
       VALUES (?, ?, ?, NOW(), 'call', 'pending')`,
      [
        lead.id,
        `🔥 ÚLTIMA CHANCE - ${lead.name}`,
        `7 dias sem contato. Essa é a última tentativa antes de marcar como rejeitado.`
      ]
    );

    // Marcar como urgente
    await execute(
      `UPDATE leads SET score = LEAST(score + 10, 100) WHERE id = ?`,
      [lead.id]
    );
  }

  conn.release();
}

// Automação: Win-back Clientes Inativos (45 dias sem compra)
async function automationWinBackClientes() {
  const conn = await getConnection();

  const sql = `
    SELECT c.id, c.name, c.phone, c.email, MAX(o.created_at) as last_order
    FROM customers c
    LEFT JOIN orders o ON c.id = o.customer_id
    WHERE c.status = 'active'
    AND c.lifetime_value > 0
    GROUP BY c.id
    HAVING (last_order IS NULL OR last_order < DATE_SUB(NOW(), INTERVAL 45 DAY))
  `;

  const [customers] = await conn.execute(sql);

  for (const customer of customers as any[]) {
    await execute(
      `INSERT INTO follow_ups (customer_id, title, description, scheduled_date, follow_up_type, status)
       VALUES (?, ?, ?, NOW(), 'email', 'pending')`,
      [
        customer.id,
        `Re-engagement - ${customer.name}`,
        `Cliente não compra há 45 dias. Oferecer desconto 10% em próxima compra.`
      ]
    );
  }

  conn.release();
}

// Automação: Escalação de Leads Qualificados (score > 50)
async function automationEscalacaoLeads() {
  const conn = await getConnection();

  const sql = `
    SELECT * FROM leads
    WHERE status = 'new'
    AND score >= 50
    AND NOT EXISTS (
      SELECT 1 FROM follow_ups
      WHERE lead_id = leads.id
      AND follow_up_type = 'call'
      AND created_at > DATE_SUB(NOW(), INTERVAL 1 DAY)
    )
  `;

  const [leads] = await conn.execute(sql);

  for (const lead of leads as any[]) {
    await execute(
      `INSERT INTO follow_ups (lead_id, title, description, scheduled_date, follow_up_type, status)
       VALUES (?, ?, ?, NOW(), 'call', 'pending')`,
      [
        lead.id,
        `CHAMAR AGORA - ${lead.name}`,
        `Lead tem score ${lead.score}. Muito qualificado. Chamar HOJE!`
      ]
    );

    await execute(
      `UPDATE leads SET status = 'qualified' WHERE id = ?`,
      [lead.id]
    );
  }

  conn.release();
}
```

## Cronograma Recomendado (100% Gratuito)

### Via Task Scheduler (Windows)
```powershell
# 1. Criar arquivo trigger.ps1
$uri = "https://seu-site.vercel.app/api/automations/trigger"
$body = @{
    type = @("review_30_days", "resgate_leads_frios", "win_back_clientes", "escalacao_leads")
} | ConvertTo-Json

Invoke-WebRequest -Uri $uri -Method POST -Body $body -ContentType "application/json"
```

### Via Cron (Linux/Mac)
```bash
# Adicione ao crontab
0 8 * * * curl -X POST https://seu-site.vercel.app/api/automations/trigger \
  -H "Content-Type: application/json" \
  -d '{"type":"review_30_days","type":"resgate_leads_frios"}'
```

### Via GitHub Actions (100% Free)
```yaml
# .github/workflows/automations.yml
name: CRM Automations

on:
  schedule:
    - cron: '0 8 * * *'  # Daily at 8 AM UTC
  workflow_dispatch:

jobs:
  trigger:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger Automations
        run: |
          curl -X POST ${{ secrets.CRM_API_URL }}/api/automations/trigger \
            -H "Content-Type: application/json" \
            -d '{
              "type": "review_30_days",
              "type": "resgate_leads_frios",
              "type": "win_back_clientes"
            }'
```

## Comparativo de Soluções Free

| Solução | Custo | Facilidade | Confiabilidade | Recomendação |
|---------|-------|-----------|----------------|--------------|
| **GitHub Actions** | R$ 0 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | 🥇 MELHOR |
| **IFTTT** | R$ 0 | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | 👍 Bom |
| **Zapier** | R$ 0 | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | 👍 Bom |
| **Task Scheduler** | R$ 0 | ⭐⭐⭐ | ⭐⭐⭐ | ⚠️ Precisa PC ligado |
| **Cron Linux** | R$ 0 | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | 🥇 MELHOR (servidor) |

## Recomendação Final: Use GitHub Actions ✅

**Por quê?**
1. ✅ Completamente gratuito
2. ✅ Confiável (Google Cloud)
3. ✅ Sem dependências
4. ✅ Integrado com seu código
5. ✅ Roda mesmo que seu PC esteja desligado

**Setup (5 min):**
1. Copie o YAML acima para `.github/workflows/automations.yml`
2. Faça push para GitHub
3. Vá em Settings > Secrets > New
4. Adicione `CRM_API_URL = "https://seu-site.vercel.app"`
5. Pronto! Roda todo dia às 8h

## Custo Total

```
TiDB Cloud Free Tier:     R$ 0,00 (25GB storage)
Vercel Free Tier:         R$ 0,00 (100GB bandwidth)
GitHub Actions:           R$ 0,00 (10,000 min/mês)
IFTTT/Zapier:             R$ 0,00
SendGrid (email):         R$ 0,00 (100 emails/dia)
Twillio (WhatsApp test):  R$ 0,00
───────────────────────────────────────
TOTAL MENSAL:             R$ 0,00
```

---

**Sistema CRM profissional, mas com custo zero** 🚀
