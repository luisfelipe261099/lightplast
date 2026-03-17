# 🎨 LightPlast CRM

Sistema de CRM completo com PHP (Backend) + HTML5/CSS3/JavaScript (Frontend)

## 🚀 Deploy no Railway

1. Acesse: https://railway.app
2. Faça login com GitHub
3. Clique em "Create New Project" → "Deploy from GitHub repo"
4. Selecione `luisfelipe261099/lightplast`
5. Adicione as variáveis de ambiente:
   - `TIDB_HOST=gateway01us-east1prod.aws.tidbcloud.com`
   - `TIDB_PORT=4000`
   - `TIDB_USER=wYESZBLpQwYM5hn.root`
   - `TIDB_PASSWORD=GJlg4N2UHGauRmG7`
   - `TIDB_DATABASE=test`

6. Railway fará o deploy automático!

## 📁 Estrutura

```
├── crm.html              # Dashboard SPA
├── api/                  # Backend PHP
│   ├── db.php           # Database connection
│   ├── customers.php    # Clientes CRUD
│   ├── leads.php        # Leads CRUD
│   ├── budgets.php      # Orçamentos CRUD
│   ├── orders.php       # Pedidos CRUD
│   ├── follow-ups.php   # Retornos CRUD
│   └── dashboard.php    # Estatísticas
├── style.css            # Estilos
├── index.html           # Homepage
└── composer.json        # Dependências PHP
```

## 🗄️ Database

**TiDB Cloud** (MySQL-compatible) com 5 tabelas:
- `customers` - Clientes
- `leads` - Oportunidades de venda
- `budgets` - Orçamentos
- `orders` - Pedidos confirmados
- `follow_ups` - Retornos agendados

## 🔧 Desenvolvimento Local

```bash
# Iniciar servidor PHP
php -S localhost:8000 -t .

# Acessar
# Dashboard: http://localhost:8000/crm
# API: http://localhost:8000/api/customers.php
```

## ⚙️ Stack Tecnológico

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Backend**: PHP 8.0+
- **Database**: TiDB Cloud (MySQL 5.7 compatible)
- **Hosting**: Railway (Free Tier)
- **Cost**: R$0/mês

## 🎯 Funcionalidades

✅ Dashboard com estatísticas
✅ CRUD de Clientes
✅ Gestão de Leads/Oportunidades
✅ Geração de Orçamentos
✅ Controle de Pedidos
✅ Agendamento de Retornos
✅ PDF de Orçamentos
✅ Responsivo Mobile-First

---

**Desenvolvido com ❤️ para LightPlast**
