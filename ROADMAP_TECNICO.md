# 🎯 ROADMAP TÉCNICO - Agenda 360° (SaaS Profissional)

## Visão Geral

**Agenda 360°** é uma plataforma SaaS multi-tenant para gestão empresarial completa, inspirada em **ContaAzul**.

**Dois ambientes principais:**
1. **app.agenda360.com** - Aplicação para usuários finais (empresas clientes)
2. **admin.agenda360.com** - Painel de administração (você - dono da plataforma)

---

## 📊 ARQUITETURA GERAL

```
┌─────────────────────────────────────────────────────────────┐
│                    LANDING PAGE                              │
│              agenda360.com (Marketing)                       │
│  - Features, Preços, Blog, Cadastro, Login                 │
└─────────────────────────────────────────────────────────────┘
                            ↓
        ┌───────────────────┴───────────────────┐
        ↓                                       ↓
┌──────────────────────┐            ┌──────────────────────┐
│  app.agenda360.com   │            │ admin.agenda360.com  │
│  (Usuários Finais)   │            │  (Administrador)     │
│                      │            │                      │
│ - Agenda 360°        │            │ - Dashboard Global   │
│ - Todas as          │            │ - Empresas           │
│   ferramentas        │            │ - Usuários           │
│                      │            │ - Planos             │
│                      │            │ - Faturamento        │
└──────────────────────┘            └──────────────────────┘
        ↓                                    ↓
    ┌───────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────────────────────────┐
│              BANCO DE DADOS ÚNICO (Multi-tenant)             │
│  - Empresas (tenants)                                        │
│  - Usuários (com permissões por empresa)                    │
│  - Times, Tarefas, Clientes, Produtos, etc.                │
│  - Assinaturas e Faturamento                               │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔐 SEGURANÇA & ISOLAMENTO (Multi-tenant)

### Princípios:
- **Isolamento de Dados:** Cada empresa vê APENAS seus dados
- **Permissões por Role:** Admin, Gerente, Funcionário, Viewer
- **Auditoria:** Logs de todas as ações
- **Autenticação:** OAuth + JWT
- **Criptografia:** Senhas com bcrypt, dados sensíveis encriptados

### Tabelas de Segurança:
```sql
- users (id, email, password, role_global, created_at)
- companies (id, name, owner_id, plan_id, status, created_at)
- company_users (user_id, company_id, role, permissions, created_at)
- audit_logs (id, company_id, user_id, action, resource, timestamp)
```

---

## 📱 GRUPO 1: APP.AGENDA360.COM (Usuários Finais)

### Estrutura de Dados (por empresa):
```
Company (Tenant)
├── Users (Membros da empresa)
├── Teams (Times de trabalho)
│   ├── Tasks (Tarefas do time)
│   └── Chat (Mensagens do time)
├── Clients (CRM de clientes)
├── Products (Catálogo de produtos)
├── Sales (Registro de vendas)
├── Financial Records (Controle financeiro)
├── Calendar Events (Eventos e compromissos)
└── Reports (Relatórios e analytics)
```

### Menu Lateral - Ferramentas:
| Ferramenta | Descrição | Status |
|-----------|-----------|--------|
| 🏠 **Home** | Dashboard da empresa com KPIs | ✅ Existe |
| 📅 **Calendário** | Agenda de eventos e compromissos | ⏳ Criar |
| 👥 **Times** | Gerenciar times e tarefas (Kanban) | ✅ Existe (bugado) |
| 👤 **Clientes** | CRM com lista de clientes | ✅ Existe |
| 📦 **Produtos** | Catálogo de produtos | ⏳ Criar |
| 💰 **Vendas** | Registro e acompanhamento de vendas | ⏳ Criar |
| 💳 **Financeiro** | Controle de receitas, despesas, fluxo de caixa | ⏳ Criar |
| 📊 **Dashboard** | Relatórios, gráficos, exportação PDF | ✅ Existe |

### Funcionalidades por Ferramenta:

#### **Home Dashboard**
- KPIs: Total de clientes, produtos, vendas, faturamento
- Gráficos de performance
- Últimas atividades
- Atalhos para ações rápidas

#### **Calendário**
- Visualizar eventos (dia, semana, mês)
- Criar/editar eventos
- Sincronizar com Google Calendar (opcional)
- Notificações de eventos próximos

#### **Times** (Corrigir bugs)
- Criar/editar/deletar times
- Adicionar membros ao time
- Kanban com 3 colunas: Pendente, Em Andamento, Concluído
- Criar/editar/deletar tarefas
- Atribuir tarefas a membros
- Chat por time
- Filtros e busca

#### **Clientes (CRM)**
- Lista de clientes com filtros
- Criar/editar/deletar clientes
- Campos: Nome, Email, Telefone, Endereço, CPF/CNPJ
- Histórico de interações
- Vincular clientes a vendas

#### **Produtos**
- Catálogo de produtos
- Criar/editar/deletar produtos
- Campos: Nome, Descrição, Preço, Estoque, SKU
- Categorias de produtos
- Importar/exportar produtos (CSV)

#### **Vendas**
- Registro de vendas
- Criar/editar/deletar vendas
- Campos: Cliente, Produto, Quantidade, Valor, Data, Status
- Status: Pendente, Confirmada, Entregue, Cancelada
- Relatório de vendas por período
- Integração com Financeiro (registra entrada)

#### **Financeiro**
- Controle de receitas e despesas
- Criar/editar/deletar registros financeiros
- Campos: Tipo (receita/despesa), Categoria, Valor, Data, Descrição
- Fluxo de caixa (saldo diário)
- Relatórios por período
- Alertas de anomalias (despesas altas, etc.)

#### **Dashboard (Relatórios)**
- Gráficos de produtividade (tarefas por semana)
- Análise de performance por membro
- Fluxo de caixa integrado
- Comparativo de períodos (semana, mês, trimestre, ano)
- Alertas automáticos (tarefas vencidas, anomalias)
- Exportação em PDF, Excel, CSV

---

## 👨‍💼 GRUPO 2: ADMIN.AGENDA360.COM (Administrador)

### Menu do Painel Admin:
| Seção | Descrição | Status |
|-------|-----------|--------|
| 📊 **Dashboard** | Métricas globais de todas as empresas | ⏳ Criar |
| 🏢 **Empresas** | CRUD de empresas clientes | ⏳ Criar |
| 👥 **Usuários** | Gerenciar usuários de todas as empresas | ⏳ Criar |
| 💳 **Planos** | Configurar planos e preços | ⏳ Criar |
| 💰 **Faturamento** | Cobranças, assinaturas, invoices | ⏳ Criar |
| 📈 **Relatórios** | Analytics globais do sistema | ⏳ Criar |
| ⚙️ **Configurações** | Settings do sistema | ⏳ Criar |
| 🔐 **Segurança** | Backups, logs, auditoria | ⏳ Criar |

### Funcionalidades por Seção:

#### **Dashboard Admin**
- Total de empresas ativas
- Receita mensal/anual
- Usuários ativos
- Taxa de churn
- Gráficos de crescimento
- Últimas atividades no sistema

#### **Empresas**
- Lista de todas as empresas
- Criar nova empresa
- Editar dados da empresa
- Deletar empresa
- Status: Ativa, Suspensa, Cancelada
- Ver dados de uso (storage, API calls)

#### **Usuários**
- Lista de usuários de todas as empresas
- Criar/editar/deletar usuários
- Atribuir a empresas
- Definir roles (Admin, Gerente, Funcionário)
- Resetar senha
- Desativar usuário

#### **Planos**
- Criar/editar/deletar planos
- Campos: Nome, Preço, Features, Limite de usuários
- Planos: Starter, Professional, Enterprise
- Ativar/desativar planos

#### **Faturamento**
- Integração com Stripe/Mercado Pago
- Listar assinaturas ativas
- Processar cobranças
- Gerar invoices
- Histórico de pagamentos
- Reembolsos

#### **Relatórios**
- Receita por período
- Usuários por empresa
- Atividades mais usadas
- Taxa de retenção
- Exportar relatórios

#### **Configurações**
- Dados da empresa (nome, logo, email suporte)
- Configurações de email
- Configurações de API
- Webhooks

#### **Segurança**
- Logs de auditoria
- Backups automáticos
- Histórico de logins
- Atividades suspeitas

---

## 🌐 LANDING PAGE (agenda360.com)

### Páginas:
1. **Home** - Apresentação, features, CTA "Começar Agora"
2. **Preços** - Planos e preços
3. **Features** - Detalhes das funcionalidades
4. **Blog** - Artigos e dicas
5. **Contato** - Formulário de contato
6. **Login** - Acesso para usuários existentes
7. **Cadastro** - Novo usuário → Seleciona plano → Paga → Acesso

### Fluxo de Novo Cliente:
```
1. Acessa agenda360.com
2. Clica "Começar Agora"
3. Preenche cadastro (nome, email, empresa)
4. Escolhe plano (Starter, Professional, Enterprise)
5. Insere dados de pagamento (Stripe/Mercado Pago)
6. Pagamento confirmado
7. Recebe email de confirmação
8. Acesso liberado em app.agenda360.com
9. Cria primeiro time/projeto
```

---

## 🗄️ BANCO DE DADOS - Tabelas Principais

### Autenticação & Usuários:
```sql
- users (id, email, password_hash, name, avatar, created_at)
- companies (id, name, owner_id, plan_id, status, created_at)
- company_users (user_id, company_id, role, permissions)
```

### Agenda 360 (por empresa):
```sql
- teams (id, company_id, name, description, created_at)
- tasks (id, team_id, title, description, status, assigned_to, due_date)
- team_messages (id, team_id, user_id, message, created_at)
- clients (id, company_id, name, email, phone, address)
- products (id, company_id, name, price, stock, sku)
- sales (id, company_id, client_id, product_id, quantity, value, date)
- financial_records (id, company_id, type, category, value, date)
- calendar_events (id, company_id, title, date, description)
- reports (id, company_id, type, data, created_at)
```

### Faturamento:
```sql
- plans (id, name, price, features, max_users)
- subscriptions (id, company_id, plan_id, status, start_date, end_date)
- invoices (id, subscription_id, amount, due_date, status)
- payments (id, invoice_id, amount, method, status, date)
```

### Auditoria:
```sql
- audit_logs (id, company_id, user_id, action, resource, timestamp)
```

---

## 🔄 INTEGRAÇÕES ENTRE FERRAMENTAS

### Fluxos Automáticos:
1. **Vendas → Financeiro:** Venda criada = Registra entrada no financeiro
2. **Vendas → Calendário:** Venda criada = Cria evento no calendário
3. **Times → Calendário:** Tarefa criada = Cria evento com data de vencimento
4. **Tarefas Vencidas → Alertas:** Tarefa vencida = Notificação ao responsável
5. **Anomalias Financeiras → Alertas:** Despesa alta = Notificação ao admin

---

## 📋 FASES DE DESENVOLVIMENTO

### **FASE 1: MVP (Mínimo Viável) - 4-6 semanas**
- ✅ Autenticação OAuth
- ✅ Estrutura multi-tenant
- ✅ Home Dashboard
- ✅ Times + Tarefas (Kanban)
- ✅ Clientes (CRM básico)
- ✅ Financeiro (básico)
- ✅ Landing Page simples

### **FASE 2: Expansão - 4-6 semanas**
- Calendário
- Produtos
- Vendas
- Relatórios avançados
- Painel Admin básico

### **FASE 3: Profissionalização - 4-6 semanas**
- Faturamento com Stripe/Mercado Pago
- Painel Admin completo
- Segurança e auditoria
- Notificações em tempo real
- Integrações avançadas

### **FASE 4: Escalabilidade - Contínuo**
- Performance e otimização
- Backup e disaster recovery
- Suporte multi-idioma
- Mobile app (iOS/Android)

---

## 🛠️ STACK TÉCNICO

### Frontend:
- React 19 + Vite
- Tailwind CSS 4
- tRPC (type-safe API)
- Shadcn/ui (componentes)

### Backend:
- Node.js + Express
- tRPC (RPC type-safe)
- Drizzle ORM
- MySQL/TiDB

### Infraestrutura:
- Manus (hosting + deployment)
- Stripe/Mercado Pago (pagamentos)
- SendGrid (emails)
- Cloudinary (imagens)

---

## ✅ PRÓXIMAS AÇÕES

1. **Confirmar roadmap** - Você aprova essa estrutura?
2. **Priorizar features** - Qual fazer primeiro?
3. **Começar Fase 1** - MVP com as features essenciais
4. **Criar tarefas específicas** - Quebrar em tasks menores

---

**Está bom assim? Quer que eu refine algo?** 🚀
