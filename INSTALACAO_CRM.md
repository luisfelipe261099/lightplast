# 🚀 LightPlast CRM PRO - Guia de Instalação e Execução

## 📋 PRÉ-REQUISITOS

```
✓ Node.js v14+ instalado
✓ npm ou pnpm instalado
✓ MySQL/TiDB Cloud (banco de dados)
✓ Arquivo .env com credenciais (opcional, já incluídas)
```

---

## 🔧 INSTALAÇÃO RÁPIDA

### 1. Verificar dependências instaladas

```bash
node --version    # Deve mostrar v14.x ou superior
npm --version     # Deve mostrar 6.x ou superior
```

### 2. Instalar dependências

```bash
cd c:\xampp\htdocs\1
npm install
```

**Ou com pnpm (mais rápido):**
```bash
pnpm install
```

---

## ▶️ EXECUTAR O CRM

### Opção 1: Desenvolvimento (com reload automático)

```bash
npm run dev
```

Ou se tiver pnpm:
```bash
pnpm dev
```

### Opção 2: Produção

```bash
npm start
```

---

## 📍 ACESSAR

Após iniciar, abra no navegador:

```
http://localhost:3000/crm
```

Ou acesse outro arquivo:

```
http://localhost:3000/blog.html
http://localhost:3000/index.html
```

---

## 🗄️ BANCO DE DADOS

### Verificar Conexão

O CRM está pré-configurado para usar **TiDB Cloud** (MySQL compatível).

Credenciais (já no código):
```
Host: gateway01us-east1prod.aws.tidbcloud.com
User: wYESZBLpQwYM5hn.root
Password: GJlg4N2UHGauRmG7
Database: test
Port: 4000
```

### Se Precisar Mudar Credenciais

1. Crie arquivo `.env` na raiz:

```bash
# .env
TIDB_HOST=seu-host.tidbcloud.com
TIDB_PORT=4000
TIDB_USER=seu-usuario
TIDB_PASSWORD=sua-senha
TIDB_DATABASE=seu-database
PORT=3000
```

2. Reinicie o servidor

---

## ✅ TESTAR FUNCIONALIDADES

### 1. Dashboard
- [ ] Abra http://localhost:3000/crm
- [ ] Veja gráficos e KPIs carregarem
- [ ] Verifique cores e layout

### 2. Criar Cliente
```
1. Clique em "Novo Cliente"
2. Preencha: João Silva, 11987654321, joao@email.com, Empresa XYZ
3. Clique "Salvar Cliente"
4. Veja aparecer na lista
```

### 3. Criar Lead
```
1. Clique em "Novo Lead"
2. Preencha: Maria Santos, 11988776655, maria@email.com
3. Status: "new"
4. Valor: 5000
5. Clique "Salvar Lead"
```

### 4. Criar Orçamento
```
1. Clique em "Novo Orçamento"
2. Selecione cliente (ex: João Silva)
3. Título: "Consultoria Q1 2026"
4. Valor: 15000
5. Clique "Gerar Orçamento"
```

### 5. Criar Pedido
```
1. Clique em "Novo Pedido"
2. Selecione cliente
3. Descrição: "Serviço de consultoria"
4. Valor: 5000
5. Clique "Criar Pedido"
```

### 6. Testar Busca
```
1. Vá para "Clientes"
2. Busque "João"
3. Veja filtrar em tempo real
4. Busque "email.com"
5. Veja resultados aparecerem
```

### 7. Exportar CSV
```
1. Vá para "Clientes"
2. Clique "Exportar"
3. Arquivo clientes.csv será baixado
4. Abra no Excel e veja dados

1. Vá para "Pedidos"
2. Clique "Exportar"
3. Arquivo pedidos.csv será baixado
```

### 8. Deletar Cliente
```
1. Vá para "Clientes"
2. Clique ícone 🗑️ em qualquer cliente
3. Confirme
4. Veja desaparecer da lista
```

---

## 🐛 TROUBLESHOOTING

### Erro: "Cannot find module 'express'"

**Solução:**
```bash
npm install
```

### Erro: "ECONNREFUSED - Database connection failed"

**Solução:**
- Verifique credenciais do .env
- Verifique internet (TiDB Cloud precisa de conectividade)
- Teste ping do servidor TiDB

### Modais não abrindo

**Solução:**
- Limpe cache do navegador (Ctrl+Shift+Del)
- Recarregue a página (F5)
- Verifique console (F12) para erros

### Dados não aparecem

**Solução:**
1. Abra console (F12)
2. Vá em "Network"
3. Veja se `/api/customers` retorna dados
4. Se não, erro vem do backend

### Gráficos vazios

**Solução:**
- Dados precisam estar no banco
- Crie alguns clientes/leads/pedidos primeiro
- Gráficos carregam automaticamente

---

## 📊 ESTRUTURA DO PROJETO

```
c:\xampp\htdocs\1\
├── index.js                  # Backend (Express + Node)
├── crm-pro.html             # Frontend novo (UI premium)
├── crm.html                 # Frontend antigo
├── package.json             # Dependências
├── .env                     # Variáveis de ambiente
│
├── assets/                  # Imagens/media
├── api/                     # Antigos endpoints (legacy)
│
├── MELHORIAS_CRM_PRO.md     # O que foi melhorado
├── GUIA_USUARIO_CRM.md      # Como usar o CRM
├── PROPOSTA_PRECOS_CRM.md   # Tabela de preços
├── INSTALACAO_CRM.md        # Este arquivo
│
├── setup.sql                # Setup banco dados
└── [outros arquivos HTML/CSS]
```

---

## 🔌 ENDPOINTS DA API

```
GET  /api/customers              - Listar clientes
POST /api/customers              - Criar cliente
PUT  /api/customers/:id          - Editar cliente
DEL  /api/customers/:id          - Deletar cliente

GET  /api/leads                  - Listar leads
POST /api/leads                  - Criar lead
PUT  /api/leads/:id              - Editar lead

GET  /api/budgets                - Listar orçamentos
POST /api/budgets                - Criar orçamento

GET  /api/orders                 - Listar pedidos
POST /api/orders                 - Criar pedido

GET  /api/dashboard              - Stats dashboard
GET  /api/export/customers       - Exportar CSV clientes
GET  /api/export/orders          - Exportar CSV pedidos

GET  /crm                        - CRM Pro UI
```

---

## 🎯 PERFORMANCE DICAS

1. **Minimize requisições**
   - Dados carregam ao clicar na aba
   - Evita reloads desnecessários

2. **Busca eficiente**
   - Filtra em tempo real no backend
   - Índices no PostgreSQL/MySQL já otimizados

3. **Cache do navegador**
   - Limpe cache se tiver problemas
   - Browser cache JS/CSS automático

4. **Banco de dados**
   - TiDB Cloud é rápido
   - Backup automático
   - Replicação em 3+ datacenters

---

## 🔐 SEGURANÇA

### Credenciais Sensíveis

Altere no `.env`:

```env
# ANTES (padrão demo)
TIDB_USER=wYESZBLpQwYM5hn.root
TIDB_PASSWORD=GJlg4N2UHGauRmG7

# DEPOIS (suas credenciais reais)
TIDB_USER=seu_usuario
TIDB_PASSWORD=sua_senha_segura
```

### Validações

```
Frontend:
✓ Email validation
✓ Required fields
✓ Type checking

Backend:
✓ SQL injection prevention (prepared statements)
✓ Validation de dados obrigatórios
✓ Error handling robusto
```

### HTTPS em Produção

Quando colocar online:
```
- Use HTTPS (SSL/TLS)
- Configure CORS corretamente
- Use variáveis de ambiente
- Não exponha credenciais
```

---

## 📱 TESTAR EM MOBILE

### Opção 1: No Mesmo PC
```
http://localhost:3000/crm
```

### Opção 2: Outro Dispositivo na Rede
```
Descubra seu IP:
Windows: ipconfig

Então acesse:
http://seu.ip.aqui:3000/crm
```

### Opção 3: Tunneling (Acessar de fora)
```
Use ngrok:
ngrok http 3000

Acesse URL fornecida por qualquer lugar
```

---

## 🚀 DEPLOYMENT (Colocar Online)

### Opção 1: Vercel (Recomendado)

1. Crie conta em vercel.com
2. Conecte seu Git (GitHub)
3. Deploy automático

Arquivo incluído: `vercel.json`

### Opção 2: Deploy seu próprio servidor

1. Vps/Servidor Linux
2. Instale Node.js
3. Clone projeto
4. `npm install`
5. `npm start`
6. Configure nginx como proxy reverso

Arquivo incluído: `SETUP_VERCEL.md`

### Opção 3: Docker

```dockerfile
# Dockerfile já incluído
docker build -t lightplast-crm .
docker run -p 3000:3000 lightplast-crm
```

---

## 📞 SUPORTE TÉCNICO

Se algo não funcionar:

1. **Verifique conectividade**
   ```bash
   ping gateway01us-east1prod.aws.tidbcloud.com
   ```

2. **Veja console do navegador** (F12)
   - Procure por erros em vermelho

3. **Veja logs do terminal**
   - Terminal mostra erros do servidor

4. **Teste API manualmente**
   ```bash
   curl http://localhost:3000/api/customers
   ```

5. **Entre em contato**
   - Email: suporte@lightplast.com
   - Chat: WhatsApp +55 11 XXXX-XXXX

---

## ✅ CHECKLIST FINAL

- [ ] Node.js instalado
- [ ] `npm install` executado
- [ ] `npm start` ou `npm run dev`
- [ ] Browser abre em http://localhost:3000/crm
- [ ] Dashboard carrega com gráficos
- [ ] Pode criar cliente
- [ ] Pode criar lead
- [ ] Busca funciona em tempo real
- [ ] Exportação CSV funciona
- [ ] Modal fecha ao clicar X
- [ ] Confirmação antes de deletar
- [ ] Alertas aparecem ao salvar

---

## 🎉 SUCESSO!

Você agora tem um CRM profissional rodando localmente!

**Próximas etapas:**
1. Teste todas as funcionalidades
2. Crie alguns dados de teste
3. Explore a interface
4. Leia documentação adicional
5. Se tiver bugs, reporte!

---

**Versão**: 2.0  
**Data**: Março 2026  
**Status**: ✅ Pronto para Produção

Qualquer dúvida, estamos aqui! 🚀
