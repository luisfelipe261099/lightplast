# ✅ LightPlast CRM - Express.js + TiDB Cloud

## 🚀 100% FUNCIONAL NO VERCEL

Reescrito **totalmente em Express.js/Node.js** - ZERO problemas no Vercel!

---

## 📋 Arquitetura Final

```
Frontend: crm.html (SPA)
     ↓
     └→ /api/customers → Node.js routes
     └→ /api/leads     → MySQL Query
     └→ /api/budgets   → TiDB Cloud
     └→ /api/orders
     └→ /api/follow-ups
     └→ /api/dashboard
```

---

## 🔧 Tecnologias

- **Frontend**: HTML5, CSS3, Vanilla JavaScript (sem mudanças)
- **Backend**: Express.js (Node.js) - 100% em JavaScript
- **Database**: TiDB Cloud (MySQL-compatible)
- **Hosting**: Vercel (nativo Node.js)
- **Cost**: R$0/mês

---

## ⚙️ Configurar Vercel

### 1️⃣ Dashboard do Vercel
https://vercel.com/dashboard → Projeto `lightplast`

### 2️⃣ Settings → Environment Variables

Adicione **exatamente estas 5 variáveis**:

```
TIDB_HOST = gateway01us-east1prod.aws.tidbcloud.com
TIDB_PORT = 4000
TIDB_USER = wYESZBLpQwYM5hn.root
TIDB_PASSWORD = GJlg4N2UHGauRmG7
TIDB_DATABASE = test
```

### 3️⃣ Salve e aguarde

Vercel fará rebuild automático (~2-3 minutos).

---

## ✅ Testar Localmente

```bash
# Instalar (já feito)
npm install

# Iniciar
npm start

# Acessar
# Dashboard: http://localhost:3000/crm
# API: http://localhost:3000/api/customers
```

---

## 🎯 Diferença com Versão Anterior

| Aspecto | Antes (PHP) | Agora (Express) |
|---------|------------|-----------------|
| Linguagem | PHP | Node.js/JavaScript |
| Framework | Serverless PHP | Express.js |
| Build no Vercel | ❌ Erro | ✅ Funciona |
| Cold starts | Lento | Rápido |
| Compatibilidade | Problemática | 100% garantida |

---

## 📊 Rotas Disponíveis

### Customers
- `GET /api/customers` - Listar
- `POST /api/customers` - Criar
- `PUT /api/customers` - Atualizar
- `DELETE /api/customers/:id` - Deletar

### Leads
- `GET /api/leads`
- `POST /api/leads`

### Budgets
- `GET /api/budgets`
- `POST /api/budgets`
- `PUT /api/budgets`

### Orders
- `GET /api/orders`
- `POST /api/orders`

### Follow-ups
- `GET /api/follow-ups`
- `POST /api/follow-ups`

### Dashboard
- `GET /api/dashboard` - Estatísticas

---

## 🔐 Segurança

- Variáveis de ambiente protegidas no Vercel
- `.env` local com credenciais TiDB
- CI CD automático via GitHub

---

## 🚨 Se não funcionar

1. **Vercel está fazendo rebuild?**
   - Status deve virar "Ready" em ~3 minutos

2. **Erro 500 na API?**
   - Verifique se variáveis de ambiente foram salvas
   - Teste a conexão com TiDB no SQL Editor

3. **Frontend carregando mas sem dados?**
   - Execute `/DADOS_FICTICIOS.sql` no TiDB Cloud
   - Atualize a página (Ctrl+F5)

4. **Dúvida?**
   - Logs do Vercel: Deployments → Click build → "View Logs"

---

## ✨ Status

✅ Backend 100% Express.js
✅ Frontend 100% HTML/CSS/JS
✅ Database TiDB Cloud conectando
✅ Vercel build passando
✅ Pronto para produção!

---

**Seu CRM está 100% funcional. Boa sorte!** 🚀
