# 🚀 Deploy no Railway (5 minutos)

## O que foi feito:
✅ Removido package.json (causava conflito Node.js no Vercel)
✅ Adicionado railway.toml (configura PHP)
✅ Adicionado Procfile (inicia servidor)
✅ Adicionado composer.json (reconhece como projeto PHP)

## Passo a Passo:

### 1️⃣ Criar Conta Railway
- Acesse: https://railway.app
- Clique "Log in with GitHub"
- Autorize o acesso ao seu GitHub

### 2️⃣ Criar Novo Projeto
- Dashboard → "New Project"
- Selecione "Deploy from GitHub repo"
- Conecte a conta GitHub

### 3️⃣ Selecionar Repository
- Procure por: `lightplast`
- Selecione: `luisfelipe261099/lightplast`
- Clique: "Deploy Now"

### 4️⃣ Configurar Variáveis de Ambiente
Railway fará deploy automático, mas precisa das credenciais TiDB:

No dashboard do Railway:
1. Clique no projeto `lightplast`
2. Vá em "Variables"
3. Adicione:
   ```
   TIDB_HOST=gateway01us-east1prod.aws.tidbcloud.com
   TIDB_PORT=4000
   TIDB_USER=wYESZBLpQwYM5hn.root
   TIDB_PASSWORD=GJlg4N2UHGauRmG7
   TIDB_DATABASE=test
   ```

### 5️⃣ Aguardar Deploy
- Railway fará rebuild automático
- Status: "Building" → "Deploying" → "Running"
- Leva ~2-3 minutos

### 6️⃣ Acessar Aplicação
Seu site estará em: `https://<seu-projeto>.up.railway.app`

Para acessar o CRM: `https://<seu-projeto>.up.railway.app/crm`

---

## ⚡ Bonus: Deploy Updates

A partir de agora, **qualquer push para GitHub** faz deploy automático no Railway!

```bash
# Local
git add -A
git commit -m "Nova feature"
git push origin main

# Railway vê a mudança e faz rebuild automático! 🚀
```

---

## ❓ Problemas?

Se o CRM ainda mostrar "Carregando..." depois do deploy:

### Verificar Status do Vercel
- Cancele o deployment no Vercel (Project Settings → Delete Project)
  ou remova a integração

### Dados Aparecem?
- Abra DevTools (F12 → Network)
- Verifique se as requisições em `/api/customers.php` retornam JSON
- Se retornar HTML: Railway está funcionando mas dados não foram inseridos

---

## 📝 Inserir Dados de Teste

Se não há dados na sua conta TiDB ainda:

1. Acesse: https://tidbcloud.com
2. Vá em SQL Editor
3. Cole o conteúdo de `DADOS_FICTICIOS.sql`
4. Clique "Run"
5. Atualize o CRM no browser

---

## 🎯 Próximos Passos

Depois do deploy no Railway:
1. Teste o CRM em produção
2. Atualize o domínio se necessário
3. Configure SSL/HTTPS (Railway faz automático)
4. Compartilhe com clientes! 🎉

---

**Dúvidas? Railway tem suporte 24/7 no Discord deles.**
