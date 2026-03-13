# 📊 Análise de Queries - Performance do Banco de Dados

## Problemas Identificados

### 1. **N+1 Problem em Loans**

**Problema:** Ao listar empréstimos, cada empréstimo faz uma query separada para:

- Cliente (name, email)

- Parcelas (count, sum)

- Saldo pago

**Impacto:** 10 empréstimos = 1 + 10 + 10 + 10 = 31 queries!

**Solução:**

```typescript
// ❌ ANTES - N+1 Problem
const loans = await db.select().from(loansTable);
const loansWithDetails = loans.map(loan => ({
  ...loan,
  client: await db.select().from(clientsTable).where(eq(clientsTable.id, loan.clientId)),
  installments: await db.select().from(installmentsTable).where(eq(installmentsTable.loanId, loan.id)),
}));

// ✅ DEPOIS - Join único
const loans = await db
  .select()
  .from(loansTable)
  .leftJoin(clientsTable, eq(loansTable.clientId, clientsTable.id))
  .leftJoin(installmentsTable, eq(loansTable.id, installmentsTable.loanId));
```

### 2. **Falta de Índices**

**Queries lentas:**

- `SELECT * FROM loans WHERE clientId = ?` - Sem índice

- `SELECT * FROM installments WHERE loanId = ?` - Sem índice

- `SELECT * FROM transactions WHERE bankAccountId = ?` - Sem índice

**Solução:** Adicionar índices:

```sql
CREATE INDEX idx_loans_clientId ON loans(clientId);
CREATE INDEX idx_installments_loanId ON installments(loanId);
CREATE INDEX idx_transactions_bankAccountId ON transactions(bankAccountId);
CREATE INDEX idx_transactions_date ON transactions(transactionDate);
```

### 3. **Agregações Sem Índice**

**Problema:** Calcular saldo total faz full table scan

```sql
-- ❌ LENTO
SELECT SUM(amount) FROM transactions WHERE transactionType = 'income';

-- ✅ RÁPIDO - Com índice
CREATE INDEX idx_transactions_type_date ON transactions(transactionType, transactionDate);
```

### 4. **Queries Síncronas no Backend**

**Problema:** Operações de cálculo são síncronas e bloqueiam a thread

```typescript
// ❌ LENTO - Bloqueia
const totalBalance = calculateBalance(); // Operação pesada
const transactions = await db.select().from(transactionsTable);

// ✅ RÁPIDO - Paralelo
const [totalBalance, transactions] = await Promise.all([
  calculateBalance(),
  db.select().from(transactionsTable),
]);
```

### 5. **Calendar - Refetch Total**

**Problema:** Ao criar evento, recarrega TODOS os eventos do mês

```typescript
// ❌ ANTES
const createEvent = trpc.calendar.create.useMutation({
  onSuccess: () => {
    utils.calendar.getEvents.invalidate(); // Recarrega tudo!
  },
});

// ✅ DEPOIS - Otimistic update + invalidate parcial
const createEvent = trpc.calendar.create.useMutation({
  onMutate: async (newEvent) => {
    await utils.calendar.getEvents.cancel();
    const previous = utils.calendar.getEvents.getData();
    utils.calendar.getEvents.setData(undefined, (old) => [...(old || []), newEvent]);
    return { previous };
  },
  onSuccess: (result) => {
    // Apenas invalidar se necessário
    utils.calendar.getEvents.invalidate();
  },
  onError: (err, newEvent, context) => {
    if (context?.previous) {
      utils.calendar.getEvents.setData(undefined, context.previous);
    }
  },
});
```

## Endpoints Críticos para Otimizar

| Endpoint | Tempo Atual | Alvo | Problema |
| --- | --- | --- | --- |
| loans.list | ~500ms | <200ms | N+1, sem índice |
| loans.getInstallments | ~300ms | <100ms | Join ineficiente |
| financial.totalBalance | ~400ms | <100ms | Agregação pesada |
| calendar.getEvents | ~600ms | <200ms | Sem índice em date |
| sales.list | ~450ms | <150ms | N+1 em produtos |

## Plano de Otimização

### Fase 1: Índices (5 min)

```sql
CREATE INDEX idx_loans_clientId ON loans(clientId);
CREATE INDEX idx_installments_loanId ON installments(loanId);
CREATE INDEX idx_transactions_bankAccountId ON transactions(bankAccountId);
CREATE INDEX idx_transactions_type_date ON transactions(transactionType, transactionDate);
CREATE INDEX idx_calendar_events_date ON calendar_events(eventDate);
CREATE INDEX idx_sales_clientId ON sales(clientId);
CREATE INDEX idx_sales_productId ON sales(productId);
```

### Fase 2: Queries (30 min)

- Refatorar loans.list com joins

- Refatorar financial.totalBalance com agregação otimizada

- Refatorar calendar.getEvents com índice de data

### Fase 3: Frontend (20 min)

- Implementar optimistic updates reais

- Usar cache local + invalidate parcial

- Remover refetch desnecessários

### Fase 4: Validação (15 min)

- Medir tempos pós-otimização

- Confirmar <200ms em endpoints críticos

- Testar cascatas de requisições

## Resultado Esperado

**Antes:**

- Criar empréstimo: 1.2s (criar + refetch lista)

- Pagar empréstimo: 800ms (pagar + refetch lista + refetch financeiro)

- Criar evento: 900ms (criar + refetch todos eventos)

**Depois:**

- Criar empréstimo: 200ms (criar + otimistic update)

- Pagar empréstimo: 150ms (pagar + otimistic update)

- Criar evento: 100ms (criar + otimistic update)

**Melhoria: 80-90% mais rápido!**

