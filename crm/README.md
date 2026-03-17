# 🚀 LightPlast CRM - Sistema Revolucionário

Um **CRM inteligente e automatizado** para LightPlast, desenvolvido em Node.js + TypeScript rodando no Vercel com banco de dados TiDB Cloud.

## ✨ Características Principais

### 📊 Dashboard Executivo
- **KPIs em Tempo Real**: Clientes, Leads, Retornos Pendentes, Receita
- **Segmentos Imediatos**: Mostra as 5 chamadas mais urgentes
- **Top Clientes**: Os 5 clientes com maior gasto

### 👥 Gestão de Clientes
- Cadastro completo com histórico
- Rastreamento de valor de vida (Lifetime Value)
- Histórico de pedidos e interações
- Status (Ativo, Inativo, Prospect)

### 🎯 Gestão de Leads
- **Sistema de Score Inteligente**: Pontuação automática baseada em engajamento
- Rastreamento de fonte (WhatsApp, Website, Email, etc)
- Conversão automática para cliente
- Qualificação via score

### 📅 Agenda de Retornos (Smart Reminders)
- Agendamento de follow-ups automáticos
- Tipos: Call, Email, WhatsApp, Meeting, Review
- **Alertas em tempo real** para retornos vencidos
- Histórico de completamentos

### 📦 Gestão de Pedidos
- Rastreamento por status (Pendente, Aprovado, Entregue, Cancelado)
- Atualização automática de Lifetime Value
- Integração com clientes
- Data de entrega esperada

### 🤖 Automações Inteligentes
- Criar follow-up automaticamente 30 dias após pedido
- Lembrar contato após X dias sem comunicação
- Escalação de leads por score
- Acionamento de leads qualificados

## 🛠️ Tech Stack

- **Backend**: Node.js + TypeScript + Express
- **Database**: TiDB Cloud (MySQL-compatible, **FREE tier**)
- **Frontend**: HTML5 + CSS3 + Vanilla JS (dashboard)
- **Deployment**: Vercel (serverless, **FREE tier**)
- **Custo Total**: R$ 0,00 (100% gratuito)

## 📋 Instalação & Setup

### Pre-requisitos (TUDO GRATUITO)
- Node.js 18+ (free)
- Conta TiDB Cloud (https://tidbcloud.com) - **FREE tier: 25GB storage**
- Conta Vercel (https://vercel.com) - **FREE tier: 100GB bandwidth**
- GitHub (para versionamento e auto-deploy)

### 1. Setup TiDB Cloud

1. Acesse https://tidbcloud.com
2. Crie uma conta (free tier disponível)
3. Crie um cluster Serverless
4. Copie as credenciais:
   - Host
   - Port (4000)
   - Username
   - Password
   - Database name

### 2. Clone e Configure

```bash
# Clone o repositório
git clone <seu-repo>
cd crm

# Instale dependências
npm install

# Crie arquivo .env
cp .env.example .env

# Edite .env com suas credenciais TiDB
# TIDB_HOST=seu-cluster.tidbcloud.serverless.com
# TIDB_USER=root
# TIDB_PASSWORD=sua_senha
# TIDB_DATABASE=lightplast_crm
```

### 3. Desenvolvimento Local

```bash
# Instale Vercel CLI
npm i -g vercel

# Execute em modo dev (com hot reload)
vercel dev

# Acesse http://localhost:3000
# Dashboard: http://localhost:3000/dashboard
```

### 4. Deploy no Vercel

```bash
# Deploy direto da CLI
vercel --prod

# Ou conecte seu Git do GitHub/GitLab
# 1. Push código para GitHub
# 2. Conecte com Vercel
# 3. Configure variáveis de ambiente no Vercel Console
# 4. Deploy automático em cada push
```

## 📡 API Endpoints

### Customers
```
GET    /api/customers              # Listar clientes
POST   /api/customers              # Criar cliente
GET    /api/customers/:id          # Detalhes do cliente
PUT    /api/customers/:id          # Atualizar cliente
```

### Leads
```
GET    /api/leads                  # Listar leads
POST   /api/leads                  # Criar lead
GET    /api/leads/:id              # Detalhes do lead
PUT    /api/leads/:id              # Atualizar lead
```

### Orders
```
GET    /api/orders                 # Listar pedidos
POST   /api/orders                 # Criar pedido
GET    /api/orders/:id             # Detalhes do pedido
PUT    /api/orders/:id             # Atualizar pedido
```

### Follow-ups
```
GET    /api/follow-ups             # Listar retornos
POST   /api/follow-ups             # Agendar retorno
PUT    /api/follow-ups/:id         # Marcar como completo
```

### Dashboard
```
GET    /api/dashboard              # KPIs + dados executivos
GET    /api/health                 # Health check
```

## 🎯 Casos de Uso (Use Cases)

### 1. Cliente Fez Compra há 30 Dias
**Automação**: Criar follow-up automático para revisar satisfação
```
Trigger: "30 dias após pedido"
Action: "Criar follow-up de review"
Type: "Call ou WhatsApp"
```

### 2. Lead Não Contatado há 7 Dias
**Automação**: Lembrança de retorno urgente
```
Trigger: "7 dias sem contato"
Action: "Criar follow-up com prioridade alta"
```

### 3. Lead com Score > 50
**Automação**: Notificação para vendedor ligar
```
Trigger: "Lead score > 50"
Action: "Criar follow-up 'Chamar agora'"
```

### 4. Integração WhatsApp
**Automação**: Lead via WhatsApp ganha score extra
```
Source: "whatsapp" 
Score: +30 (cliente interessado)
```

## 🎨 Como Customizar

### Adicionar Novo Campo no Customer
1. Edite `api/database.ts` (tabela `customers`)
2. Edite `api/index.ts` (endpoints POST/PUT)
3. Execute migration:
```bash
ALTER TABLE customers ADD COLUMN seu_campo VARCHAR(255);
```

### Criar Nova Automação
1. Adicione em `automations` table
2. Crie handler em `api/automations.ts`
3. Configure trigger + action

## 📱 Integração WhatsApp (Futuro)

```javascript
// Adicionar webhook do WhatsApp
POST /api/webhooks/whatsapp
{
  name: "João Silva",
  phone: "554135576013",
  message: "Olá, quero um orçamento",
  source: "whatsapp"
}

// Sistema automaticamente:
// 1. Cria lead
// 2. Atribui score +30 (muito engajado)
// 3. Cria follow-up automático
// 4. Notifica vendedor
```

## 🔐 Segurança

- ✅ Autenticação via JWT (add no futuro)
- ✅ Rate limiting (Vercel built-in)
- ✅ CORS habilitado
- ✅ Variáveis de ambiente protegidas
- ✅ Prepared statements contra SQL injection

## 📊 Estrutura de Dados

### Customers (Clientes)
```sql
- id, name, email, phone, company
- document (CNPJ/CPF)
- address, city, state, zip
- status (active/inactive/prospect)
- lifetime_value (total gasto)
- last_contact (último contato)
```

### Leads (Prospects)
```sql
- id, name, email, phone, company
- product_interest, source
- score (0-100)
- status (new/qualified/contacted/converted/rejected)
- converted_to_customer (quando vira cliente)
```

### Follow-ups (Retornos)
```sql
- id, customer_id/lead_id
- title, description
- scheduled_date, follow_up_type
- status (pending/completed/cancelled)
- completed_at, notes
```

## 🚨 Troubleshooting

### "Connection to TiDB failed"
- Verifique credentials no .env
- Confirme que IP está whitelisted no TiDB
- TODO: Whitelist IPs do Vercel (12.34.56.78)

### "Dashboard não carrega"
- Abra DevTools (F12) > Console
- Verifique se `/api/dashboard` retorna 200
- Teste com: `curl http://localhost:3000/api/dashboard`

### Deploy no Vercel falha
- Confirme que `package.json` está correto
- Rode `vercel env ls` para ver variáveis
- Verifique logs: `vercel logs`

## 📝 Roadmap (100% Free)

- [ ] Autenticação + Login (free)
- [ ] Automações via Zapier Free Tier (free)
- [ ] Email via SendGrid Free (free 100 emails/dia)
- [ ] WhatsApp via Twilio Sandbox (free testing)
- [ ] Notificações via IFTTT (free)
- [ ] Relatórios PDF (free com pdfkit)
- [ ] Integração com Slack (free)
- [ ] IA para previsão (future - usando APIs free)

## 📞 Suporte

Para dúvidas, abra uma issue no GitHub ou contate: dev@lightplast.com.br

---

**Desenvolvido com 💚 para LightPlast**
