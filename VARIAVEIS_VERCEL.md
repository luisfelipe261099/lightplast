# ⚙️ CONFIGURAR VARIÁVEIS DE AMBIENTE NO VERCEL

## 🚀 Passo 1: Entrar no Vercel Dashboard

1. Acesse: https://vercel.com/dashboard
2. Localize seu projeto **lightplast**
3. Clique em **Settings** (engrenagem)

## 🔑 Passo 2: Ir para Environment Variables

1. No menu esquerdo, clique em **Environment Variables**
2. Você verá um formulário para adicionar variáveis

## ➕ Passo 3: Adicionar as 5 Variáveis

Adicione **exatamente essas 5 variáveis** (substitua pelos seus dados do TiDB):

### Variável 1: TIDB_HOST
```
Name: TIDB_HOST
Value: seu_host.tidbcloud.com
```
(Mude `seu_host` pelo seu host real do TiDB Cloud)

### Variável 2: TIDB_PORT
```
Name: TIDB_PORT
Value: 4000
```

### Variável 3: TIDB_USER
```
Name: TIDB_USER
Value: seu_usuario
```
(Mude `seu_usuario` pelo seu usuário TiDB - ex: `wYESZBLpQwYM5hn.root`)

### Variável 4: TIDB_PASSWORD
```
Name: TIDB_PASSWORD
Value: sua_senha
```
(Mude `sua_senha` pela sua senha TiDB)

### Variável 5: TIDB_DATABASE
```
Name: TIDB_DATABASE
Value: test
```
(Mude `test` pelo nome do seu banco de dados)

## ✅ Passo 4: Salvar

1. Clique em **Save** ou **Add** para cada variável
2. Aguarde a confirmação (deve aparecer "Added" em verde)

## 🔄 Passo 5: Redeploy

1. Volte para **Deployments** no menu
2. Clique em **Redeploy** no último deployment
3. Selecione **Use existing Build Cache** (mais rápido)
4. Aguarde o build completar

## ✨ Pronto!

Quando o build terminar e mostrar **Ready** (verde), sua app estará online com banco de dados funcionando!

---

## 🆘 Se Ainda der Erro

### Erro: "Cannot GET /api/customers"
- Significa as variáveis estão corretas, mas talvez o banco não tenha tabelas
- Execute o `setup.sql` no seu TiDB Cloud

### Erro: "Connection refused"
- Verifique se as credenciais estão **exatamente iguais** ao seu TiDB
- Teste a conexão localmente primeiro (npm start)

### Erro: "Deploy failed"
- Veja o Build Log no Vercel
- Procure por erros na seção "Build Output"
- Verifique se o `package.json` tem as dependências corretas

---

## 📝 Ordem Correta:

1. ✅ Deletar variáveis antigas do Vercel
2. ✅ Adicionar as 5 novas (TIDB_HOST, TIDB_PORT, TIDB_USER, TIDB_PASSWORD, TIDB_DATABASE)
3. ✅ Clicar Save em cada uma
4. ✅ Fazer Redeploy
5. ✅ Aguardar "Ready" (verde)
6. ✅ Testar URL

**Tudo pronto para ir ao ar! 🚀**
