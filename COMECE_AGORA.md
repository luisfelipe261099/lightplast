# ⚡ COMECE AGORA - GUIA PRÁTICO (5 MINUTOS)

## 🎯 SEU CRM ESTÁ 100% PRONTO

Este guia vai você do zero a rodando em **5 minutos**.

---

## ✅ PRÉ-REQUISITOS

### Verifique se tem instalado:

```powershell
# Abra PowerShell/CMD e execute:

node --version
# Resultado esperado: v18+ (ex: v18.15.0)

npm --version
# Resultado esperado: npm 9+ (ex: npm 9.5.0)
```

**Se não tiver Node.js:**
- Baixe em: https://nodejs.org/ (LTS)
- Instale e reinicie o PC

---

## 🚀 PASSO 1: Iniciar o Servidor (1 minuto)

### No PowerShell ou CMD:

```powershell
# Abra terminal em c:\xampp\htdocs\1

cd c:\xampp\htdocs\1

npm install

```

**Resultado esperado:**
```
added 50 packages in 3s
npm notice
npm notice New major version of npm available...
```

Depois:

```powershell
npm start
```

**Resultado esperado:**
```
Server is running on http://localhost:3000
```

☑️ Se vir isso, **o servidor está rodando!** ✅

---

## 🌐 PASSO 2: Abrir no Navegador (30 segundos)

Abra qualquer navegador (Chrome, Edge, Firefox):

```
http://localhost:3000
```

**Você verá uma página como essa:**

```
┌─────────────────────────────────┐
│  LightPlast CRM PRO             │
│  Dashboard | Clientes | Leads   │
│  Orçamentos | Pedidos | Relatórios
│                                 │
│ ┌──────────────────────────┐   │
│ │ Clientes Totais: 42      │   │
│ │ Orçamentos: 12           │   │
│ │ Pedidos: 28              │   │
│ │ Receita: R$ 125.000      │   │
│ └──────────────────────────┘   │
│                                 │
│ [3 Gráficos interativos...]    │
└─────────────────────────────────┘
```

---

## 📱 PASSO 3: Testar Cada Módulo (3 minutos)

### Teste 1: Dashboard (30 segundos)
```
1. Você entrou e vê o Dashboard
2. Vê 4 cards azuis com números
3. Vê 3 gráficos com linhas/barras
✅ Dashboard funcionando
```

### Teste 2: Clientes (30 segundos)
```
1. Clique em "Clientes" (aba superior)
2. Vê uma lista de clientes
3. Tem botão "Adicionar Cliente"
4. Tem campo para buscar
✅ Módulo Clientes funcionando
```

### Teste 3: Adicionar um Cliente
```
1. Clique em "Adicionar Cliente"
2. Preencha:
   Nome: "João da Silva"
   Email: "joao@email.com"
   Telefone: "11999999999"
3. Clique em "Salvar"
4. Cliente aparece na lista
✅ CRUD funcionando
```

### Teste 4: Leads
```
1. Clique em "Leads"
2. Vê lista de leads
3. Vê filtros (Status, Prioridade)
4. Teste busca
✅ Módulo Leads OK
```

### Teste 5: Orçamentos
```
1. Clique em "Orçamentos"
2. Gere um novo orçamento
3. Vincule ao cliente criado
4. Adicione itens
✅ Módulo Orçamentos OK
```

### Teste 6: Pedidos
```
1. Clique em "Pedidos"
2. Crie um novo pedido
3. Veja faturamento sendo atualizado
✅ Módulo Pedidos OK
```

### Teste 7: Relatórios Financeiros ⭐
```
1. Clique em "Relatórios"
2. Vê 4 KPIs coloridos no topo
3. Vê 4 gráficos diferentes
4. Vê tabela de "Top Clientes"
5. Vê "Insights Automáticos" com recomendações
✅ Relatórios 100% funcionando
```

---

## ✅ TUDO PASSOU? Parabéns! 🎉

Seu CRM está **100% funcional e pronto para usar**.

---

## 📊 DADOS DE TESTE

Já tem dados fictícios no sistema:
- 50+ clientes
- 100+ leads
- 30+ orçamentos
- 45+ pedidos

**Tudo pronto para testar!**

---

## 🔧 BANCO DE DADOS

### Se ainda não configurou:

**Passo 1: Criar conta TiDB Cloud**
- Acesse: https://tidbcloud.com
- Crie cluster gratuito
- Copie credenciais

**Passo 2: Criar arquivo .env**
```
TIDB_HOST=seu_host.tidbcloud.com
TIDB_PORT=4000
TIDB_USER=seu_usuario
TIDB_PASSWORD=sua_senha
TIDB_DATABASE=seu_database
```

**Passo 3: Executar setup.sql**
```
Abra MySQL client e execute o arquivo setup.sql
Isso cria as tabelas automaticamente
```

**Passo 4: (Opcional) Importar dados de teste**
```
Execute DADOS_FICTICIOS.sql para popular dados
```

---

## 📚 DOCUMENTAÇÃO DISPONÍVEL

Se precisar de mais detalhes:

```
- LEIA_PRIMEIRO.md              ← Comece aqui
- GUIA_USUARIO_CRM.md           ← Manual completo
- INSTALACAO_CRM.md             ← Setup detalhado
- RELATORIOS_FINANCEIROS_GUIA.md ← Como usar relatórios
- STATUS_COMPLETO_SISTEMA.md    ← Tudo que tem
```

---

## 🆘 PROBLEMAS?

### Erro: "Cannot GET /api/customers"
```
Solução: Banco de dados não configurado
Abra .env e adicione credenciais TiDB
Restart: Ctrl+C no terminal, depois npm start
```

### Erro: "Port 3000 already in use"
```
Solução: Já tem algo usando port 3000
Opção 1: Feche outro servidor
Opção 2: Mude PORT em index.js (mudar para 3001)
```

### Página branca / Nada aparece
```
Solução: Pressione F5 para recarregar
Abra Console (F12) e veja erro
Se houver erro, reporte em README_EXPRESS.md
```

### Gráficos não aparecem
```
Solução: Dados ainda carregando
Aguarde 2-3 segundos
Abra Console (F12) → Network
Verifique se /api/dashboard retorna 200 OK
```

---

## 🎯 PRÓXIMOS PASSOS

### Para Usar Diariamente
```
1. npm start
2. http://localhost:3000
3. Adicione seus dados reais
4. Use para gerir seu negócio!
```

### Para Apresentar ao Cliente
```
1. npm start
2. Mostrar Dashboard
3. Demonstrar cada módulo
4. Mostrar Relatórios Financeiros
5. Oferecer upgrade
```

### Para Deploy (Colocar Online)
```
Leia arquivo: SETUP_VERCEL.md
Tem instruções para:
- Deploy em Vercel (gratuito)
- Deploy em Heroku
- Deploy em servidor próprio
```

---

## 💡 DICAS PRO

### 1. Salve seus clientes reais
```
Módulo Clientes → Adicionar Cliente
Comece a registrar seus clients
```

### 2. Use relatórios semanalmente
```
Toda segunda-feira:
1. Abra Relatórios
2. Analise crescimento
3. Tome decisões
```

### 3. Customize para seu negócio
```
Arquivo: crm-pro.html
Procure por "CUSTOMIZE_AQUI" (linhas comentadas)
Mude cores, nomes, campos conforme precisa
```

### 4. Exporte dados regularmente
```
Clientes:
- Clique "Exportar CSV" em Clientes

Pedidos:
- Clique "Exportar CSV" em Pedidos
```

---

## 📊 EXEMPLO DE FLUXO COMPLETO

```
1ª SEMANA
├─ Segunda: Registra 3 novos clientes
├─ Quarta: Cria 5 leads qualificados
└─ Sexta: Gera 2 orçamentos

2ª SEMANA
├─ Segunda: Revisa relatórios de receita (+15%!)
├─ Quarta: Convert 1 orçamento em pedido
└─ Sexta: Adiciona mais 4 pedidos

3ª SEMANA
├─ Segunda: Analisa top clientes
├─ Quarta: Foca em leads pendentes
└─ Sexta: Projeta receita para o mês
   Result: +↑ Crescimento claro!
```

---

## 🚨 IMPORTANTE

### Fazer Backup
```
Seu banco de dados é cloud (TiDB)
Está sempre sincronizado
Você pode acessar de qualquer lugar!
```

### Segurança
```
Arquivo .env: NUNCA comita no GitHub
Mantenha credenciais privadas
Nunca compartilhe senha database
```

---

## ✨ RESUMO

```
✅ CRM instalado
✅ Servidor rodando
✅ Dashboard funcionando
✅ Todos módulos testados
✅ Relatórios prontos
✅ Documentação disponível
✅ Dados fictícios carregados
✅ Pronto para usar!
```

**Você está pronto para começar a usar o CRM agora!**

---

## 🎁 BÔNUS: Comandos Úteis

```powershell
# Iniciar servidor
npm start

# Instalar dependências
npm install

# Verificar versão Node
node --version

# Matar servidor (Ctrl+C)
# Depois reiniciar com npm start

# Para nuvem (deploy)
# Leia: SETUP_VERCEL.md
```

---

## 📞 SUPORTE

Se tiver dúvidas:
1. Leia LEIA_PRIMEIRO.md
2. Consulte GUIA_USUARIO_CRM.md
3. Verifique INSTALACAO_CRM.md
4. Veja troubleshooting nos arquivos MD

---

**Hora de começar! ⏱️ Abra seu terminal e execute: npm start**

**Bem-vindo ao CRM PRO! 🎉**
