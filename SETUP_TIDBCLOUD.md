# 📋 Setup do TiDB Cloud

## ✅ Como executar o SQL no TiDB Cloud

### **Passo 1: Acesse o TiDB Cloud Console**
1. Vá para: https://tidbcloud.com
2. Faça login com sua conta
3. Clique no cluster: **Cluster1**

### **Passo 2: Abra o SQL Editor**
1. No painel esquerdo, clique em: **SQL Editor**
2. Você verá "Getting Started" com um editor em branco

### **Passo 3: Execute o script SQL**

**Opção A: Copiar e colar manualmente**
1. Abra o arquivo: `setup.sql` (na raiz do projeto)
2. Copie TODO o conteúdo
3. Cole no SQL Editor do TiDB Cloud
4. Clique em: **Run** (ou pressione Ctrl+Enter)

**Opção B: Executar linha por linha**
Se der erro, execute em blocos:

```sql
-- Primeiro, execute isto:
CREATE TABLE IF NOT EXISTS customers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(20),
    company VARCHAR(255),
    status ENUM('active', 'inactive', 'prospect') DEFAULT 'prospect',
    source VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_contact TIMESTAMP NULL,
    INDEX idx_status (status),
    INDEX idx_email (email),
    INDEX idx_company (company)
);
```

Depois continue com os outros CREATE TABLE...

### **Passo 4: Verificar se funcionou**

Execute isto no SQL Editor:

```sql
SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = 'test';
```

**Resultado esperado:**
```
| TABLE_NAME  |
|-------------|
| customers   |
| leads       |
| budgets     |
| orders      |
| follow_ups  |
```

## 🔑 Credenciais TiDB Cloud

```
Host: gateway01.us-east-1.prod.aws.tidbcloud.com
Port: 4000
Username: wYESZBLpQwYM5hn.root
Password: GJlg4N2UHGauRmG7
Database: test
```

## ✅ Checklist

- [ ] Executei o SQL no TiDB Cloud
- [ ] Todas as 5 tabelas foram criadas
- [ ] Variáveis de ambiente adicionadas no Vercel
- [ ] Verifico se API está respondendo

## 📞 Se der erro

Se receber mensagem de erro:
1. Copie exatamente o mensagem de erro
2. Tente executar cada CREATE TABLE individualmente
3. Verifique se está usando o banco de dados correto (`test`)

---

**Depois disso, o CRM estará 100% funcional!** 🚀
