# 🤖 Instruções para Claude - Análise do Agenda 360°

## 📌 Contexto Rápido

Este é o repositório **Agenda 360°**, uma plataforma de gestão empresarial completa. 

**Stack Tecnológico:**
- **Frontend:** React 19 + Tailwind CSS 4 + tRPC
- **Backend:** Express 4 + tRPC 11 + MySQL/TiDB
- **Banco de Dados:** Drizzle ORM com migrations
- **Autenticação:** Manus OAuth
- **Testes:** Vitest

**Versão Atual:** 88e8d571

---

## 🎯 Tarefas Principais para Claude

### 1. **Análise de Arquitetura** 
Revisar:
- Estrutura de pastas (server, client, drizzle, shared)
- Padrões de código (tRPC procedures, React hooks)
- Separação de responsabilidades
- Identificar código duplicado

### 2. **Análise de Performance**
Revisar:
- Queries em `server/db.ts` (N+1 queries?)
- Índices de banco de dados em `drizzle/schema.ts`
- Memoização e cache no frontend
- Tamanho de bundles

### 3. **Análise de Segurança**
Revisar:
- Validação de inputs em procedures
- Autenticação e autorização (`protectedProcedure`, `adminProcedure`)
- Proteção contra CSRF, XSS, SQL Injection
- Gestão de secrets em `.env`

### 4. **Análise de Testes**
Revisar:
- Cobertura de testes em `server/*.test.ts`
- Qualidade dos testes existentes
- Testes críticos que faltam
- Estratégia de testes para novas features

### 5. **Análise de UX/UI**
Revisar:
- Componentes em `client/src/pages/` e `client/src/components/`
- Acessibilidade (WCAG 2.1)
- Responsividade mobile
- Consistência de design

### 6. **Análise de Funcionalidades**
Revisar:
- Fluxo de empréstimos (criar, pagamento, parcelas)
- Integração calendário ↔ empréstimos
- Lógica de cálculo de juros e saldos
- Sugerir novas features

### 7. **Análise de Documentação**
Revisar:
- README.md e docs técnicas
- Documentação de API
- Clareza do código (comentários, nomes)
- Setup e deployment

---

## 📂 Estrutura do Projeto

```
agenda360/
├── client/                 # Frontend React
│   ├── src/
│   │   ├── pages/         # Páginas principais
│   │   ├── components/    # Componentes reutilizáveis
│   │   ├── lib/trpc.ts    # Configuração tRPC
│   │   └── index.css      # Estilos globais
│   └── public/            # Assets estáticos
├── server/                # Backend Express
│   ├── db.ts              # Query helpers
│   ├── routers.ts         # tRPC procedures
│   ├── storage.ts         # S3 helpers
│   ├── *.test.ts          # Testes
│   └── _core/             # Framework plumbing
├── drizzle/               # Schema e migrations
│   ├── schema.ts          # Definição de tabelas
│   └── *.sql              # Migrations
├── shared/                # Código compartilhado
├── package.json           # Dependências
├── vitest.config.ts       # Configuração de testes
└── vite.config.ts         # Configuração Vite
```

---

## 🔑 Arquivos Críticos para Revisar

| Arquivo | Prioridade | Razão |
|---------|-----------|-------|
| `server/routers.ts` | 🔴 CRÍTICA | Lógica de negócio principal |
| `server/db.ts` | 🔴 CRÍTICA | Queries do banco de dados |
| `drizzle/schema.ts` | 🔴 CRÍTICA | Modelo de dados |
| `client/src/pages/Loans.tsx` | 🟠 ALTA | Feature principal (empréstimos) |
| `server/*.test.ts` | 🟠 ALTA | Cobertura de testes |
| `client/src/components/` | 🟡 MÉDIA | Componentes reutilizáveis |
| `README.md` | 🟡 MÉDIA | Documentação |

---

## 💡 Formato de Resposta Esperado

Para cada análise, fornecer:

```markdown
## [Seção]

### ✅ Pontos Positivos
- [Ponto 1]
- [Ponto 2]

### ⚠️ Problemas Identificados
- **[Arquivo]:** [Descrição]
- **[Arquivo]:** [Descrição]

### 💡 Recomendações
1. [Recomendação 1]
2. [Recomendação 2]

### 🔧 Exemplo de Código
[Antes] → [Depois]
```

---

## 🚀 Próximos Passos Após Análise

1. **Claude fornece relatório estruturado**
2. **Usuário revisa e aprova recomendações**
3. **Manus (AI implementadora) executa mudanças aprovadas**
4. **Ciclo se repete para melhorias contínuas**

---

## 📞 Contato

- **Desenvolvedor:** TradeTech
- **Plataforma:** Manus
- **Última Atualização:** 13/03/2026

---

**Obrigado por revisar o Agenda 360°! 🙏**
