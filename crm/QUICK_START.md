# ⚡ Quick Start - Setup em 15 min (R$ 0,00)

## Step 1: TiDB Cloud (2 min)

1. Acesse https://tidbcloud.com
2. Clique "Start Free"
3. Sign up com email
4. Create Serverless Cluster
5. Copie estas credenciais:

```
TIDB_HOST=seu-cluster.tidbcloud.serverless.com
TIDB_PORT=4000
TIDB_USER=root
TIDB_PASSWORD=sua_senha_aqui
TIDB_DATABASE=lightplast_crm (pode criar novo)
```

## Step 2: Clonar & Configurar (5 min)

```bash
# Clone seu repositório
cd Projects
git clone <seu-repo-url>
cd crm

# Instale dependências
npm install

# Crie .env com credenciais TiDB
cat > .env << EOF
TIDB_HOST=seu-cluster.tidbcloud.serverless.com
TIDB_PORT=4000
TIDB_USER=root
TIDB_PASSWORD=sua_senha
TIDB_DATABASE=lightplast_crm
NODE_ENV=development
PORT=3000
EOF

# Teste localmente
vercel dev

# Visite http://localhost:3000/dashboard
```

## Step 3: Deploy no Vercel (5 min)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy (cria automáticamente no Vercel)
vercel --prod

# Responda as perguntas:
# ? Connected to github? Yes
# ? Which scope? <sua-conta>
# ? Link to existing project? No
# ? Project name: lightplast-crm
# ? Directory: ./

# Vercel vai criar:
# - https://lightplast-crm.vercel.app
# - Variáveis de ambiente automáticas
```

## Step 4: Configurar Variáveis no Vercel (2 min)

1. Acesse https://vercel.com > seu projeto
2. Vá em Settings > Environment Variables
3. Adicione:

```
TIDB_HOST = seu-cluster.tidbcloud.serverless.com
TIDB_PORT = 4000
TIDB_USER = root
TIDB_PASSWORD = sua_senha
TIDB_DATABASE = lightplast_crm
```

4. Clique "Deploy" para aplicar

## Step 5: Configurar Automações (GitHub Actions) - 1 min

1. Push do código para GitHub (já está em .github/workflows)
2. Vá em seu repositório
3. Clique em Settings > Secrets > New repository secret
4. Adicione:

```
CRM_API_URL = https://lightplast-crm.vercel.app
```

5. Pronto! Automações rodando todo dia às 8h UTC

## Verificar se Funciona

```bash
# Terminal 1: Local
vercel dev
# Visite http://localhost:3000/dashboard

# Terminal 2: Test API
curl http://localhost:3000/api/health
# Resposta: {"success":true,"message":"CRM API is running"}

# Criar um cliente teste
curl -X POST http://localhost:3000/api/customers \
  -H "Content-Type: application/json" \
  -d '{
    "name": "João Silva",
    "phone": "11999999999",
    "email": "joao@example.com",
    "company": "Silva Comércios"
  }'

# Criar um lead teste
curl -X POST http://localhost:3000/api/leads \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Maria Santos",
    "phone": "11888888888",
    "company": "Santos Ltda",
    "product_interest": "Sacos Coloridos"
  }'

# Ver dashboard
# Abra http://localhost:3000/dashboard
```

## Custo Total

| Item | Custo |
|------|-------|
| TiDB Cloud | R$ 0,00 |
| Vercel | R$ 0,00 |
| GitHub | R$ 0,00 |
| GitHub Actions | R$ 0,00 |
| **TOTAL** | **R$ 0,00** |

## Endpoints Disponíveis

```
# Clientes
GET    /api/customers
POST   /api/customers
GET    /api/customers/:id
PUT    /api/customers/:id

# Leads  
GET    /api/leads
POST   /api/leads
PUT    /api/leads/:id

# Pedidos
GET    /api/orders
POST   /api/orders
PUT    /api/orders/:id

# Retornos
GET    /api/follow-ups
POST   /api/follow-ups
PUT    /api/follow-ups/:id

# Dashboard
GET    /api/dashboard

# Automações (dispara manualmente)
POST   /api/automations/trigger
```

## Disparar Automações Manualmente

```bash
# Review 30 dias
curl -X POST https://lightplast-crm.vercel.app/api/automations/trigger \
  -H "Content-Type: application/json" \
  -d '{"type":"review_30_days"}'

# Resgate leads frios
curl -X POST https://lightplast-crm.vercel.app/api/automations/trigger \
  -H "Content-Type: application/json" \
  -d '{"type":"resgate_leads_frios"}'

# Win-back clientes
curl -X POST https://lightplast-crm.vercel.app/api/automations/trigger \
  -H "Content-Type: application/json" \
  -d '{"type":"win_back_clientes"}'

# Escalação leads
curl -X POST https://lightplast-crm.vercel.app/api/automations/trigger \
  -H "Content-Type: application/json" \
  -d '{"type":"escalacao_leads"}'
```

## Troubleshooting

### "Connection failed to TiDB"
- Verifique credenciais em .env
- TiDB Cloud > Cluster > Connection String
- Copie credenciais exatamente

### "Dashboard branco"
- Abra DevTools (F12)
- Console deve estar limpo
- Teste API: `curl http://localhost:3000/api/health`

### GitHub Actions não roda
- Settings > Secrets > Verifique CRM_API_URL
- Actions > Veja logs da última execução
- Dispare manual: Actions > Run workflow

---

**Pronto! CRM 100% funcionando com R$ 0,00** 🎉
