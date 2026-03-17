# 🚀 Deploy no Vercel - Guia Rápido

## 1️⃣ Prepare o Git (já feito se clonado)
```bash
git init
git add .
git commit -m "Deploy CRM com TiDB Cloud integrado"
git branch -M main
git remote add origin https://github.com/seu-usuario/seu-repo.git
git push -u origin main
```

## 2️⃣ Crie Projeto no Vercel
1. Acesse https://vercel.com
2. Clique em "New Project"
3. Conecte seu repositório GitHub
4. Selecione o repo (ex: `seu-repo`)
5. Clique em "Import"

## 3️⃣ Configure Environment Variables
No Vercel Dashboard → Project Settings → Environment Variables

**Copie EXATAMENTE essas credenciais:**

```
TIDB_HOST=gateway01us-east1prod.aws.tidbcloud.com
TIDB_PORT=4000
TIDB_USER=wYESZBLpQwYM5hn.root
TIDB_PASSWORD=GJlg4N2UHGauRmG7
TIDB_DATABASE=test
NODE_ENV=production
```

> ⚠️ **IMPORTANTE:** Não commite o `.env` (está em .gitignore). Configure só no Vercel.

## 4️⃣ Deploy Automático
Após configurar as variáveis, clique em "Deploy"
- Build automático com `npm run build`
- Output gerado em `dist/`
- API endpoint: `https://seu-projeto.vercel.app/api/...`

## 5️⃣ Teste a Conexão
```bash
curl https://seu-projeto.vercel.app/api/customers
```

Deve retornar um JSON com clientes do TiDB.

## 📋 Checklist Final
- ✅ `.env` configurado localmente (não será commitado)
- ✅ `.env.example` atualizado (para referência)
- ✅ `vercel.json` pronto (rewrite para API)
- ✅ `package.json` com scripts corretos
- ✅ `tsconfig.json` compilando para `dist/`
- ✅ GitHub conectado ao Vercel

Pronto! Faça commit e deploy acontece automaticamente. 🎉
