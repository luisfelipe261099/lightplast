# Sistema de Autenticação Real - LightPlast CRM

## 📋 Implementado

Este documento descreve o novo sistema de autenticação real com gerenciamento de usuários e logs de auditoria.

### ✅ Funcionalidades Implementadas

#### 1. **Autenticação Segura com JWT**
- Login com e-mail e senha (bcrypt hashing)
- Tokens JWT de 24 horas
- Logout com registro em auditoria
- Validação de token em todas as requisições autenticadas

#### 2. **Gerenciamento de Usuários**
- CRUD de usuários (criar, ler, editar, deletar)
- Roles: `admin`, `manager`, `user`
- Status: `active`, `inactive`
- Controle de acesso por role
- Apenas admins podem gerenciar usuários

#### 3. **Sistema de Auditoria**
- Registro automático de todas as ações
- Informações capturadas:
  - Usuário responsável
  - Ação realizada (LOGIN, LOGOUT, CREATE, UPDATE, DELETE)
  - Tabela e ID do registro afetado
  - IP de origem
  - User Agent do navegador
  - Timestamp

#### 4. **Tabelas de Banco de Dados**

**users**
```sql
- id (INT, PK)
- email (VARCHAR, UNIQUE)
- password_hash (VARCHAR)
- name (VARCHAR)
- role (ENUM: admin, manager, user)
- status (ENUM: active, inactive)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
- last_login (TIMESTAMP)
```

**audit_logs**
```sql
- id (INT, PK)
- user_id (INT, FK)
- action (VARCHAR)
- table_name (VARCHAR)
- record_id (INT)
- old_values (JSON)
- new_values (JSON)
- ip_address (VARCHAR)
- user_agent (TEXT)
- created_at (TIMESTAMP)
```

## 🔐 Credenciais Padrão

**Usuário Admin Criado na Migração:**
- E-mail: `admin@lightplast.com`
- Senha: `admin123`

⚠️ **IMPORTANTE**: Altere a senha admin após o primeiro login!

## 🚀 Como Usar

### 1. Executar Migração do Banco de Dados

```bash
node migrate.js
```

Isto irá:
- Criar tabelas `users` e `audit_logs`
- Criar usuário admin padrão
- Alterar estrutura de outras tabelas conforme necessário

### 2. Iniciar o Servidor

```bash
npm start
# ou
node index.js
```

### 3. Acessar o CRM

1. Acesse `http://localhost:3000/crm-login.html`
2. Faça login com as credenciais padrão
3. Acesse a aba "Acessos & Logs" para gerenciar usuários

## 📡 API Endpoints

### Autenticação

**POST /api/auth/login**
```json
{
  "email": "admin@lightplast.com",
  "password": "admin123"
}
```
Retorna: `{ token, user: { id, email, name, role } }`

**POST /api/auth/register** (apenas admin)
```json
{
  "email": "novo@user.com",
  "password": "senha",
  "name": "Nome do Usuário",
  "role": "user"
}
```

**POST /api/auth/logout** (autenticado)

### Gerenciamento de Usuários (admin)

**GET /api/users**
Lista todos os usuários

**PUT /api/users/:id**
Atualiza usuário

**DELETE /api/users/:id**
Deleta usuário (não pode deletar própria conta)

### Auditoria (admin)

**GET /api/audit-logs**
Parâmetros query:
- `action`: Filtrar por ação
- `userId`: Filtrar por usuário
- `limit`: Limite de resultados (padrão: 100)
- `offset`: Página (padrão: 0)

Retorna lista de logs com todas as ações do sistema

## 🔑 Segurança

- ✅ Senhas hasheadas com bcrypt (10 rounds)
- ✅ JWT com secret configurável via `.env`
- ✅ Tokens expiram em 24 horas
- ✅ Middleware de autenticação em todas as rotas sensíveis
- ✅ Validação de role/permissões
- ✅ Auditoria completa de ações

## 📝 Variáveis de Ambiente

Adicione ao `.env`:

```env
JWT_SECRET=sua-chave-secreta-aqui-mude-em-producao
```

Se não configurado, usa padrão (⚠️ não recomendado para produção)

## 🎯 Fluxo de Login

```
1. Usuário acessa /crm-login.html
2. Submete e-mail e senha
3. Backend valida em /api/auth/login
4. Se válido, retorna JWT token
5. JavaScript armazena token no localStorage
6. Requisições subsequentes incluem header: Authorization: Bearer {token}
7. Middleware valida token antes de processar
8. Ações são registradas em audit_logs
```

## 🛠️ Próximos Passos Recomendados

1. **Importar em Produção:**
   - Altere `JWT_SECRET` em `.env`
   - Altere senha do admin
   - Considere usar HTTPS/TLS
   - Ative logs de segurança

2. **Controle de Acesso Granular:**
   - Implementar permissões por feature
   - Restringir CRUD por role

3. **Backup de Logs:**
   - Exportar logs regularmente
   - Configurar retenção de dados

4. **Notificações:**
   - E-mail ao criar novo usuário
   - Alerta de login suspeito

## 📞 Suporte

- Logs de erro em console do Node
- Auditoria completa em `audit_logs` table
- Verificar `last_login` para rastrear atividades

---

**Última atualização:** Março 19, 2026
