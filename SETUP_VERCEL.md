# 🚀 Deploy no Vercel com Node.js + PHP

## ✅ O que foi mudado:

1. **Criado serverless functions Node.js** em `api/`
   - `api/customers.js` → executa `customers.php`
   - `api/leads.js` → executa `leads.php`
   - `api/budgets.js` → executa `budgets.php`
   - `api/orders.js` → executa `orders.php`
   - `api/follow-ups.js` → executa `follow-ups.php`
   - `api/dashboard.js` → executa `dashboard.php`

2. **Criado `package.json`** com Express.js

3. **Configurado `vercel.json`** para reconhecer variáveis de ambiente

---

## 📋 Configurar Variáveis de Ambiente no Vercel

### 1. Acesse o Dashboard do Vercel
- Vá em: https://vercel.com/dashboard
- Selecione o projeto `lightplast`

### 2. Vá em "Settings" → "Environment Variables"

### 3. Adicione as variáveis:

| Nome | Valor |
|------|-------|
| `TIDB_HOST` | `gateway01us-east1prod.aws.tidbcloud.com` |
| `TIDB_PORT` | `4000` |
| `TIDB_USER` | `wYESZBLpQwYM5hn.root` |
| `TIDB_PASSWORD` | `GJlg4N2UHGauRmG7` |
| `TIDB_DATABASE` | `test` |

### 4. Clique "Save" e aguarde o redeploy automático (~2-3 minutos)

---

## ✅ Como o Code Funciona

```
Navegador faz requisição para: https://seu-site.vercel.app/api/customers.php

↓

Vercel intercepta e executa: api/customers.js

↓

JavaScript executa: php api/customers.php

↓

PHP conecta à TiDB Cloud e retorna JSON

↓

JavaScript envia resposta JSON ao Navegador
```

---

## 🔧 Testar Localmente

```bash
# Instalar dependências (já feito)
npm install

# Iniciar servidor local
npm start
# ou desenvolvimento
npm run dev

# Acessar
# Dashboard: http://localhost:8000/crm
# API: http://localhost:8000/api/customers.php
```

---

## 🚨 Se não funcionar na primeira vez:

1. **Vercel está rebuilding?**
   - Aguarde 2-3 minutos. Status deve ir de "Building" → "Ready"

2. **Erros de conexão ao TiDB?**
   - Verifique se variáveis de ambiente foram salvas
   - Tente fazer um redeploy manual clicando em "Redeploy" no Vercel

3. **Retorna "<?php" em vez de JSON?**
   - As functions Node.js não estão sendo executadas
   - Verifique se `package.json` e `vercel.json` estão corretos

4. **Dados não aparecem?**
   - Execute `DADOS_FICTICIOS.sql` no TiDB Cloud SQL Editor
   - Atualize a página do CRM (Ctrl+Shift+Delete para cache)

---

## 📊 Arquitetura Final

```
lightplast/
├── crm.html              ← Frontend SPA
├── style.css             ← Estilos
├── index.html            ← HomePage
├── package.json          ← Dependências Node.js
├── vercel.json           ← Config Vercel
├── .gitignore            ← Ignora node_modules
├── DADOS_FICTICIOS.sql   ← Dados de teste
└── api/                  ← Serverless Functions
    ├── customers.js      ← Wrapper Node.js
    ├── customers.php     ← Lógica PHP
    ├── leads.js
    ├── leads.php
    ├── budgets.js
    ├── budgets.php
    ├── orders.js
    ├── orders.php
    ├── follow-ups.js
    ├── follow-ups.php
    ├── dashboard.js
    ├── dashboard.php
    └── db.php            ← Conexão TiDB
```

---

## 🎯 Próximos Passos

1. ✅ Configure variáveis de ambiente no Vercel
2. ✅ Aguarde o redeploy
3. ✅ Abra https://seu-site.vercel.app/crm
4. ✅ Dados devem aparecer!

Se tudo funcionar, você tem um CRM completo rodando FREE no Vercel + TiDB Cloud! 🚀

---

**Dúvidas?** Verifique os logs do Vercel → Project → Deployments → Click na build com erro → Veja os logs
