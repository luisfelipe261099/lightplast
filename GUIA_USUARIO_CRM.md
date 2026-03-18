# 📖 Guia Rápido - LightPlast CRM Pro

## 🎯 Como Usar

### 1. Acessar o CRM
```
URL: http://localhost:3000/crm
```

---

## 📊 DASHBOARD

**Primeira tela ao entrar** - Resumo executivo com:

```
📌 Clientes Ativos
📌 Leads Qualificados  
📌 Receita Total
📌 Pedidos em Aberto
```

**Gráficos interativos** mostrando:
- Receita mês a mês
- Distribuição de leads
- Performance por canal

---

## 👥 CLIENTES

### Adicionar novo cliente
```
1. Clique em "+ Novo Cliente"
2. Preencha: Nome*, Telefone*, Email, Empresa, Notas
3. Clique em "Salvar Cliente"
```

### Buscar cliente
```
1. Digite o nome, email ou telefone na barra de busca
2. Resultados aparecem instantaneamente
```

### Exportar clientes para Excel
```
1. Clique em "Exportar"
2. Arquivo CSV será baixado automaticamente
3. Abra no Excel ou Google Sheets
```

### Deletar cliente
```
1. Clique no ícone 🗑️ (lixo) do cliente
2. Confirme a ação
3. Cliente será deletado permanentemente
```

---

## 🎯 LEADS

### Criar novo lead
```
1. Clique em "+ Novo Lead"
2. Preencha os dados
3. Escolha status: Novo, Contatado, Qualificado, Perdido
4. Defina valor estimado (se houver)
5. Adicione notas
6. Clique em "Salvar Lead"
```

### Acompanhar leads
```
✓ Coluna "Status" mostra posição no funil
✓ Coluna "Valor Est." mostra potencial de receita
✓ Busca funciona em tempo real
```

---

## 📋 ORÇAMENTOS

### Criar orçamento
```
1. Clique em "+ Novo Orçamento"
2. Selecione o cliente
3. Digite título e descrição
4. Defina valor total
5. Escolha status (Draft, Enviado, Aprovado)
6. Defina data de validade (ex: 30 dias)
7. Clique em "Gerar Orçamento"
```

### Visualizar orçamentos
```
✓ Tabela com cliente, valor e status
✓ Ícone 📄 PDF (em desenvolvimento)
✓ Status colorido para fácil visualização
```

---

## 📦 PEDIDOS

### Registrar novo pedido
```
1. Clique em "+ Novo Pedido"
2. Selecione o cliente
3. Descreva o produto/serviço
4. Defina o valor
5. Escolha status (Pendente, Em Processamento, Completo)
6. Defina data de entrega esperada
7. Clique em "Criar Pedido"
```

### Acompanhar pedidos
```
✓ Visualize todos os pedidos em uma tabela
✓ Filtre por status
✓ Veja valores totais
✓ Exporte para análise
```

---

## 🔍 BUSCAS & FILTROS

### Busca em Tempo Real
Todas as seções têm barra de busca:

```
Clientes    → busca por nome, email, telefone, empresa
Leads       → busca por nome, contato, empresa
Orçamentos  → busca por título, cliente
Pedidos     → busca por cliente, ID
```

**Como funciona**: Digite e veja resultados instantaneamente!

---

## 💾 EXPORTAR DADOS

### Opção 1: Clientes para CSV
```
1. Vá em "Clientes"
2. Clique em "Exportar"
3. Arquivo "clientes.csv" será baixado
```

### Opção 2: Pedidos para CSV  
```
1. Vá em "Pedidos"
2. Clique em "Exportar"
3. Arquivo "pedidos.csv" será baixado
```

**O que vem no arquivo CSV?**
```
- ID
- Nome/Cliente
- Contato/Valor
- Status
- Data de criação
- (Pronto para Excel ou análise)
```

---

## ⚙️ DICAS PRO

### 1. Organize Leads por Status
```
Novo         → Contatos recentes que precisa ligar
Contatado    → Já falou, aguardando resposta
Qualificado  → Pronto para orçamento
Perdido      → Descartado (pode arquivar)
```

### 2. Use Valores em Leads
```
Defina valor estimado de cada oportunidade
Veja receita potencial no dashboard
Priorize leads valiosos
```

### 3. Validade de Orçamentos
```
Defina data de validade (ex: 30 dias)
Acompanhe na lista quais expiram
Relembre cliente antes de expirar
```

### 4. Notas são Ouro
```
Adicione notas em clientes
Registre histórico de contatos
Facilita continuidade com cliente novo
```

---

## 🎨 INTERFACE - O QUE SIGNIFICA?

```
🟢 Verde (Badges)  = Status aprovado/completo
🟠 Laranja         = Status pendente/em andamento
🔵 Azul            = Informações/Status novo
🔴 Vermelho        = Ação destrutiva (deletar)
```

### Botões Principais
```
🔵 Botões Azuis     = Ações principais, Salve aqui!
⚪ Botões Brancos   = Ações secundárias
🔴 Botões Vermelhos = Deletar/Cancelar
📥 Iconografia      = Font Awesome (ícones profissionais)
```

---

## 🚀 ATALHOS ÚTEIS

```
Ctrl+F ou Cmd+F     → Busca na página
Enter na busca      → Pesquisa
ESC                 → Fecha modais
F12                 → Abre console (dev)
```

---

## ❓ PERGUNTAS FREQUENTES

### P: Meus dados são salvos?
**R**: Sim! Tudo é salvo no banco de dados TiDB Cloud automaticamente.

### P: Posso deletar dados por acidente?
**R**: Não, há confirmação antes de deletar.

### P: Funciona no celular?
**R**: Sim! Interface responsiva funciona em desktop, tablet e mobile.

### P: Como faço backup?
**R**: Exporte para CSV regularmente. Banco também faz backup automático.

### P: Preciso de internet?
**R**: Sim, o CRM está na nuvem (TiDB Cloud).

### P: Quantos clientes/leads posso adicionar?
**R**: Ilimitado! O sistema escala conforme sua base cresce.

---

## 📞 SUPORTE

```
Email: suporte[AT]lightplast.com
WhatsApp: +55 11 9XXXX-XXXX
Hora: Segunda a Sexta, 9h às 18h
```

---

## 🎓 TREINAMENTO

Oferecemos:
```
✓ Vídeo tutorial (5 min)
✓ Webinar ao vivo
✓ Documentação por email
✓ Suporte via chat
```

---

## ✅ CHECKLIST INICIAL

- [ ] Acessei http://localhost:3000/crm
- [ ] Criei 1 cliente de teste
- [ ] Criei 1 lead de teste  
- [ ] Criei 1 orçamento de teste
- [ ] Criei 1 pedido de teste
- [ ] Testei busca clientes
- [ ] Exportei clientes para CSV
- [ ] Entendi status de leads
- [ ] Abri no mobile (celular)
- [ ] Lido todos os campos

---

**Bem-vindo ao LightPlast CRM Pro!** 🎉

Seu negócio agora tem a ferramenta profissional que merece.

Qualquer dúvida, você sabe onde nos encontrar!
