import { eq, and, desc, count } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, clients, products, suppliers, sales, financialRecords, tasks, teams, subscriptions, supplierPurchases, productOutputHistory, bankAccounts, creditCards, digitalWallets, financialTransactions, installmentPlans, loans, loanInstallments, loanPayments, teamMembers, teamTasks, teamMessages, notifications, salesOrders, salesOrderItems, productFavorites, cashBox, expenseCategories } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ============ Clients ============
export async function getClientsByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(clients).where(eq(clients.userId, userId));
}

export async function createClient(data: typeof clients.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(clients).values(data);
  return result;
}

export async function updateClient(id: number, data: Partial<typeof clients.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(clients).set(data).where(eq(clients.id, id));
}

export async function deleteClient(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(clients).where(eq(clients.id, id));
}

// ============ Products ============
export async function getProductsByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(products).where(eq(products.userId, userId));
}

export async function createProduct(data: typeof products.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(products).values(data);
}

export async function updateProduct(id: number, data: Partial<typeof products.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(products).set(data).where(eq(products.id, id));
}

export async function deleteProduct(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(products).where(eq(products.id, id));
}

// ============ Suppliers ============
export async function getSuppliersByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(suppliers).where(eq(suppliers.userId, userId));
}

export async function createSupplier(data: typeof suppliers.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(suppliers).values(data);
}

export async function updateSupplier(id: number, data: Partial<typeof suppliers.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(suppliers).set(data).where(eq(suppliers.id, id));
}

export async function deleteSupplier(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(suppliers).where(eq(suppliers.id, id));
}

export async function getSupplierById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(suppliers).where(eq(suppliers.id, id));
  return result.length > 0 ? result[0] : null;
}

// ============ Sales ============
export async function getSalesByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(sales).where(eq(sales.userId, userId));
}

export async function createSale(data: typeof sales.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(sales).values(data);
  
  // Extract insertId from Drizzle result - handle ResultSetHeader
  let saleId: number | undefined;
  if (Array.isArray(result) && result.length > 0) {
    // If result is an array, get insertId from first element
    saleId = (result[0] as any).insertId;
  } else if (typeof result === 'object' && result !== null) {
    // Try to get insertId directly
    saleId = (result as any).insertId;
  }
  
  if (!saleId || isNaN(saleId)) {
    console.error("[Database] Failed to get sale ID from result:", result);
    throw new Error("Failed to create sale - invalid ID");
  }
  
  return { id: saleId, ...data };
}

export async function updateSale(id: number, data: Partial<typeof sales.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(sales).set(data).where(eq(sales.id, id));
}

export async function deleteSale(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(sales).where(eq(sales.id, id));
}

// ============ Financial Records ============
export async function getFinancialRecordsByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(financialRecords).where(eq(financialRecords.userId, userId));
}

export async function createFinancialRecord(data: typeof financialRecords.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(financialRecords).values(data);
}

export async function updateFinancialRecord(id: number, data: Partial<typeof financialRecords.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(financialRecords).set(data).where(eq(financialRecords.id, id));
}

export async function deleteFinancialRecord(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(financialRecords).where(eq(financialRecords.id, id));
}

// ============ Tasks ============
export async function getTasksByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(tasks).where(eq(tasks.userId, userId));
}

export async function createTask(data: typeof tasks.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(tasks).values(data);
}

export async function updateTask(id: number, data: Partial<typeof tasks.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(tasks).set(data).where(eq(tasks.id, id));
}

export async function deleteTask(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(tasks).where(eq(tasks.id, id));
}

// ============ Teams ============
export async function getTeamsByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(teams).where(eq(teams.userId, userId));
}

export async function createTeam(data: typeof teams.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(teams).values(data);
}

export async function updateTeam(id: number, data: Partial<typeof teams.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(teams).set(data).where(eq(teams.id, id));
}

export async function deleteTeam(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(teams).where(eq(teams.id, id));
}

// ============ Supplier Purchases ============
export async function getSupplierPurchasesByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(supplierPurchases).where(eq(supplierPurchases.userId, userId));
}

export async function createSupplierPurchase(data: typeof supplierPurchases.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(supplierPurchases).values(data);
  // Retrieve the created purchase
  const result = await db.select().from(supplierPurchases)
    .where(eq(supplierPurchases.userId, data.userId))
    .orderBy(desc(supplierPurchases.id))
    .limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function updateSupplierPurchase(id: number, data: Partial<typeof supplierPurchases.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(supplierPurchases).set(data).where(eq(supplierPurchases.id, id));
}

export async function deleteSupplierPurchase(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(supplierPurchases).where(eq(supplierPurchases.id, id));
}

export async function getSupplierPurchaseById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(supplierPurchases).where(eq(supplierPurchases.id, id));
  return result.length > 0 ? result[0] : null;
}

export async function getPendingSupplierPurchasesByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(supplierPurchases).where(
    and(eq(supplierPurchases.userId, userId), eq(supplierPurchases.paymentStatus, "pending"))
  );
}

// ============ Calendar Event Synchronization ============
export async function createSupplierPaymentEvent(userId: number, purchase: typeof supplierPurchases.$inferSelect, supplier: typeof suppliers.$inferSelect) {
  console.log(`[SupplierPaymentEvent] Creating event for purchase ${purchase.id} with dueDate ${purchase.dueDate}`);
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  try {
    // Create a unique identifier to ensure we can find the exact event
    const uniqueMarker = `supplier-${purchase.id}-${Date.now()}`;
    
    // Create a task event for the supplier payment with unique marker in description
    await db.insert(tasks).values({
      userId,
      title: `Pagamento - ${supplier.name}`,
      description: `Valor: R$ ${purchase.amount}\nFornecedor: ${supplier.name}\nCompra: ${purchase.description}\nMarker: ${uniqueMarker}`,
      dueDate: purchase.dueDate,
      completed: false,
      priority: "high",
    });
    
    // Query to find the inserted task using the unique marker
    const insertedTasks = await db.select({ id: tasks.id }).from(tasks)
      .where(
        and(
          eq(tasks.userId, userId),
          eq(tasks.title, `Pagamento - ${supplier.name}`)
        )
      )
      .orderBy(desc(tasks.id))
      .limit(1);
    
    if (insertedTasks.length > 0) {
      const eventId = insertedTasks[0].id;
      // Update the supplier purchase with the calendar event ID
      await db.update(supplierPurchases).set({ calendarEventId: eventId }).where(eq(supplierPurchases.id, purchase.id));
      console.log(`[SupplierPaymentEvent] Created event ${eventId} for purchase ${purchase.id}`);
      return eventId;
    }
  } catch (error) {
    console.error("[SupplierPaymentEvent] Error creating calendar event:", error);
  }
  
  return null;
}

export async function updateSupplierPaymentEvent(eventId: number, purchase: typeof supplierPurchases.$inferSelect, supplier: typeof suppliers.$inferSelect) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Update the task event
  await db.update(tasks).set({
    dueDate: purchase.dueDate,
    description: `Valor: R$ ${purchase.amount}\nFornecedor: ${supplier.name}\nCompra: ${purchase.description}`,
  }).where(eq(tasks.id, eventId));
}

export async function removeSupplierPaymentEvent(eventId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Delete the task event
  await db.delete(tasks).where(eq(tasks.id, eventId));
}

// ============ Subscriptions ============
export async function getSubscriptionByUserId(userId: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(subscriptions).where(eq(subscriptions.userId, userId)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function createSubscription(data: typeof subscriptions.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(subscriptions).values(data);
}

export async function updateSubscription(userId: number, data: Partial<typeof subscriptions.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(subscriptions).set(data).where(eq(subscriptions.userId, userId));
}

// ============ Product Output History ============
export async function getProductOutputHistoryByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(productOutputHistory).where(eq(productOutputHistory.userId, userId));
}

export async function createProductOutput(data: typeof productOutputHistory.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(productOutputHistory).values(data);
}

export async function deleteProductOutput(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(productOutputHistory).where(eq(productOutputHistory.id, id));
}

// ============ Dashboard Metrics ============
export async function getDashboardMetrics(userId: number) {
  const db = await getDb();
  if (!db) return null;

  try {
    const totalClients = (await db.select().from(clients).where(eq(clients.userId, userId))).length;
    const totalProducts = (await db.select().from(products).where(eq(products.userId, userId))).length;
    const totalSales = (await db.select().from(sales).where(eq(sales.userId, userId))).length;
    
    const salesData = await db.select().from(sales).where(eq(sales.userId, userId));
    const totalRevenue = salesData.reduce((sum, sale) => sum + parseFloat(sale.totalPrice as any), 0);

    const financialData = await db.select().from(financialRecords).where(eq(financialRecords.userId, userId));
    const totalIncome = financialData
      .filter(record => record.type === 'income')
      .reduce((sum, record) => sum + parseFloat(record.amount as any), 0);
    const totalExpenses = financialData
      .filter(record => record.type === 'expense')
      .reduce((sum, record) => sum + parseFloat(record.amount as any), 0);

    // Tarefas
    const tasksData = await db.select().from(tasks).where(eq(tasks.userId, userId));
    const totalTasks = tasksData.length;
    const completedTasks = tasksData.filter(t => t.completed === true).length;
    const inProgressTasks = tasksData.filter(t => t.completed === false && t.assignedTo !== null).length;
    const pendingTasks = tasksData.filter(t => t.completed === false && t.assignedTo === null).length;

    return {
      totalClients,
      totalProducts,
      totalSales,
      totalRevenue,
      totalIncome,
      totalExpenses,
      netProfit: totalIncome - totalExpenses,
      totalTasks,
      completedTasks,
      inProgressTasks,
      pendingTasks,
    };
  } catch (error) {
    console.error("[Database] Failed to get dashboard metrics:", error);
    return null;
  }
}


// Bank Accounts functions
export async function getBankAccountsByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];
  try {
    return await db.select().from(bankAccounts).where(eq(bankAccounts.userId, userId));
  } catch (error) {
    console.error("[Database] Failed to get bank accounts:", error);
    return [];
  }
}

export async function createBankAccount(data: typeof bankAccounts.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  try {
    const result = await db.insert(bankAccounts).values(data);
    return result;
  } catch (error) {
    console.error("[Database] Failed to create bank account:", error);
    throw error;
  }
}

// Credit Cards functions
export async function getCreditCardsByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];
  try {
    return await db.select().from(creditCards).where(eq(creditCards.userId, userId));
  } catch (error) {
    console.error("[Database] Failed to get credit cards:", error);
    return [];
  }
}

export async function createCreditCard(data: typeof creditCards.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  try {
    const result = await db.insert(creditCards).values(data);
    return result;
  } catch (error) {
    console.error("[Database] Failed to create credit card:", error);
    throw error;
  }
}

// Digital Wallets functions
export async function getDigitalWalletsByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];
  try {
    return await db.select().from(digitalWallets).where(eq(digitalWallets.userId, userId));
  } catch (error) {
    console.error("[Database] Failed to get digital wallets:", error);
    return [];
  }
}

export async function createDigitalWallet(data: typeof digitalWallets.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  try {
    const result = await db.insert(digitalWallets).values(data);
    return result;
  } catch (error) {
    console.error("[Database] Failed to create digital wallet:", error);
    throw error;
  }
}

// Financial Transactions functions
export async function getFinancialTransactionsByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];
  try {
    return await db.select().from(financialTransactions).where(eq(financialTransactions.userId, userId)).orderBy(desc(financialTransactions.transactionDate));
  } catch (error) {
    console.error("[Database] Failed to get financial transactions:", error);
    return [];
  }
}

export async function createFinancialTransaction(data: typeof financialTransactions.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  try {
    // Criar a transação
    const result = await db.insert(financialTransactions).values(data);
    
    // Se a transação é em dinheiro (cash), atualizar o cashBox
    if (data.paymentMethod === 'cash') {
      const amount = typeof data.amount === 'string' ? parseFloat(data.amount) : data.amount;
      const isIncome = data.transactionType === 'income';
      const balanceChange = isIncome ? amount : -amount;
      
      await updateCashBoxBalance(data.userId, balanceChange);
      console.log(`[Database] Updated cash box for user ${data.userId}: +${balanceChange}`);
    }
    
    // Se a transação tem uma conta bancária, atualizar o saldo
    if (data.accountId) {
      const amount = typeof data.amount === 'string' ? parseFloat(data.amount) : data.amount;
      const isIncome = data.transactionType === 'income';
      const balanceChange = isIncome ? amount : -amount;
      
      // Buscar o saldo atual da conta
      const account = await db.select().from(bankAccounts).where(eq(bankAccounts.id, data.accountId));
      if (account.length > 0) {
        const currentBalance = typeof account[0].balance === 'string' ? parseFloat(account[0].balance) : account[0].balance || 0;
        const newBalance = currentBalance + balanceChange;
        
        // Atualizar o saldo da conta
        await db.update(bankAccounts).set({ balance: newBalance.toString() }).where(eq(bankAccounts.id, data.accountId));
        console.log(`[Database] Updated account ${data.accountId} balance: ${currentBalance} -> ${newBalance}`);
      }
    }
    
    return result;
  } catch (error) {
    console.error("[Database] Failed to create financial transaction:", error);
    throw error;
  }
}

// Installment Plans functions
export async function getInstallmentPlansByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];
  try {
    return await db.select().from(installmentPlans).where(eq(installmentPlans.userId, userId));
  } catch (error) {
    console.error("[Database] Failed to get installment plans:", error);
    return [];
  }
}

export async function createInstallmentPlan(data: typeof installmentPlans.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  try {
    const result = await db.insert(installmentPlans).values(data);
    return result;
  } catch (error) {
    console.error("[Database] Failed to create installment plan:", error);
    throw error;
  }
}

// Get total balance across all accounts
export async function getTotalBalance(userId: number) {
  const db = await getDb();
  if (!db) return 0;
  try {
    const accounts = await db.select().from(bankAccounts).where(eq(bankAccounts.userId, userId));
    const wallets = await db.select().from(digitalWallets).where(eq(digitalWallets.userId, userId));
    const cards = await db.select().from(creditCards).where(eq(creditCards.userId, userId));
    
    // BUG FIX: Remover o cálculo duplicado do cash
    // O saldo das contas bancárias (accountsBalance) JÁ inclui todas as transações
    // Não devemos somar novamente o cash calculado a partir das transações
    // Isso causava duplicação: Conta (R$ 2150) + Cash (R$ 150) = R$ 2300 (ERRADO)
    // Deveria ser apenas: Conta (R$ 2150) = R$ 2150 (CORRETO)
    
    const accountsBalance = accounts.reduce((sum, acc) => sum + parseFloat(acc.balance as any), 0);
    const walletsBalance = wallets.reduce((sum, wallet) => sum + parseFloat(wallet.balance as any), 0);
    const cardsBalance = cards.reduce((sum, card) => sum + parseFloat(card.currentBalance as any), 0);
    
    return accountsBalance + walletsBalance + cardsBalance;
  } catch (error) {
    console.error("[Database] Failed to get total balance:", error);
    return 0;
  }
}


// ===== LOANS FUNCTIONS =====

export async function getLoansByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  try {
    const result = await db
      .select()
      .from(loans)
      .where(eq(loans.userId, userId));
    return result;
  } catch (error) {
    console.error("[Database] Failed to get loans:", error);
    return [];
  }
}

export async function createLoan(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  try {
    const result = await db.insert(loans).values(data);
    return result;
  } catch (error) {
    console.error("[Database] Failed to create loan:", error);
    throw error;
  }
}

export async function updateLoan(id: number, data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  try {
    const result = await db
      .update(loans)
      .set(data)
      .where(eq(loans.id, id));
    return result;
  } catch (error) {
    console.error("[Database] Failed to update loan:", error);
    throw error;
  }
}

export async function deleteLoan(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  try {
    const result = await db
      .delete(loans)
      .where(eq(loans.id, id));
    return result;
  } catch (error) {
    console.error("[Database] Failed to delete loan:", error);
    throw error;
  }
}

export async function getLoanInstallments(loanId: number) {
  const db = await getDb();
  if (!db) return [];
  
  try {
    const result = await db
      .select()
      .from(loanInstallments)
      .where(eq(loanInstallments.loanId, loanId));
    return result;
  } catch (error) {
    console.error("[Database] Failed to get loan installments:", error);
    return [];
  }
}

export async function createLoanInstallments(data: any[]) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  try {
    const result = await db.insert(loanInstallments).values(data);
    return result;
  } catch (error) {
    console.error("[Database] Failed to create loan installments:", error);
    throw error;
  }
}

export async function updateLoanInstallment(id: number, data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  try {
    const result = await db
      .update(loanInstallments)
      .set(data)
      .where(eq(loanInstallments.id, id));
    return result;
  } catch (error) {
    console.error("[Database] Failed to update loan installment:", error);
    throw error;
  }
}

export async function createLoanPayment(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  try {
    const result = await db.insert(loanPayments).values(data);
    return result;
  } catch (error) {
    console.error("[Database] Failed to create loan payment:", error);
    throw error;
  }
}

export async function getLoanPayments(loanId: number) {
  const db = await getDb();
  if (!db) return [];
  
  try {
    const result = await db
      .select()
      .from(loanPayments)
      .where(eq(loanPayments.loanId, loanId));
    return result;
  } catch (error) {
    console.error("[Database] Failed to get loan payments:", error);
    return [];
  }
}

/**
 * Handle partial loan payment with interest recalculation
 * Creates a new installment with remaining balance + interest
 */
export async function handlePartialLoanPayment(data: {
  loanId: number;
  installmentId: number;
  paidAmount: number;
  interestRate: number; // Original interest rate from loan
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  try {
    const installment = await getLoanInstallmentById(data.installmentId);
    if (!installment) throw new Error("Installment not found");
    
    const loan = await getLoanById(data.loanId);
    if (!loan) throw new Error("Loan not found");
    
    // Calculate remaining balance
    const remainingBalance = parseFloat(installment.amount.toString()) - data.paidAmount;
    
    if (remainingBalance <= 0) {
      // Full payment, just mark as paid
      await updateLoanInstallment(data.installmentId, {
        status: "paid",
        paidAmount: installment.amount,
        paidAt: new Date(),
      });
      return null;
    }
    
    // Partial payment: mark current installment as partially paid
    await updateLoanInstallment(data.installmentId, {
      status: "partially_paid",
      paidAmount: data.paidAmount,
      paidAt: new Date(),
    });
    
    // Calculate new amount with interest for next installment
    const interestAmount = remainingBalance * (data.interestRate / 100);
    const newAmount = remainingBalance + interestAmount;
    
    // Get the last installment number
    const allInstallments = await getLoanInstallments(data.loanId);
    const maxInstallmentNumber = Math.max(...allInstallments.map(i => i.installmentNumber), 0);
    
    // Calculate due date (next month from current installment due date)
    const currentDueDate = new Date(installment.dueDate);
    const nextDueDate = new Date(currentDueDate);
    nextDueDate.setMonth(nextDueDate.getMonth() + 1);
    
    // Create new installment with recalculated amount
    const result = await db.insert(loanInstallments).values({
      loanId: data.loanId,
      installmentNumber: maxInstallmentNumber + 1,
      dueDate: nextDueDate,
      amount: newAmount.toString(),
      paidAmount: "0",
      status: "pending",
    });
    
    // Get the newly created installment by installment number
    const newInstallments = await db
      .select()
      .from(loanInstallments)
      .where(eq(loanInstallments.loanId, data.loanId))
      .orderBy(desc(loanInstallments.installmentNumber))
      .limit(1);
    
    const newInstallmentId = newInstallments[0]?.id || 0;
    
    return {
      newInstallmentId,
      remainingBalance,
      interestAmount,
      newAmount,
      newDueDate: nextDueDate,
    };
  } catch (error) {
    console.error("[Database] Failed to handle partial loan payment:", error);
    throw error;
  }
}


// ===== CALENDAR EVENTS FUNCTIONS =====

export async function getCalendarEvents(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  try {
    // Get loan installments as calendar events
    const userLoans = await db
      .select()
      .from(loans)
      .where(eq(loans.userId, userId));
    
    const events = [];
    
    for (const loan of userLoans) {
      const installments = await db
        .select()
        .from(loanInstallments)
        .where(eq(loanInstallments.loanId, loan.id));
      
      for (const installment of installments) {
        events.push({
          id: `loan-${installment.id}`,
          type: "payment",
          title: `Parcela #${installment.installmentNumber} - Empréstimo`,
          dueDate: installment.dueDate,
          amount: installment.amount,
          status: installment.status,
          loanId: loan.id,
          installmentId: installment.id,
        });
      }
    }
    
    // Get supplier purchases as calendar events
    const userPurchases = await db
      .select()
      .from(supplierPurchases)
      .where(eq(supplierPurchases.userId, userId));
    
    for (const purchase of userPurchases) {
      events.push({
        id: `purchase-${purchase.id}`,
        type: "payment",
        title: `Pagamento a Fornecedor - ${purchase.description}`,
        dueDate: purchase.dueDate,
        amount: purchase.amount,
        status: purchase.paymentStatus,
        purchaseId: purchase.id,
      });
    }
    
    // Get sales as calendar events
    const userSales = await db
      .select()
      .from(sales)
      .where(eq(sales.userId, userId));
    
    for (const sale of userSales) {
      events.push({
        id: `sale-${sale.id}`,
        type: "sale",
        title: `Venda realizada - ${sale.totalPrice}`,
        dueDate: sale.createdAt,
        amount: sale.totalPrice,
        status: sale.paymentStatus,
        saleId: sale.id,
      });
    }
    
    // Get tasks as calendar events
    const userTasks = await db
      .select()
      .from(tasks)
      .where(eq(tasks.userId, userId));
    
    for (const task of userTasks) {
      events.push({
        id: `task-${task.id}`,
        type: "task",
        title: task.title,
        dueDate: task.dueDate,
        status: task.completed ? "completed" : "pending",
        taskId: task.id,
      });
    }
    
    // Get team tasks as calendar events
    const userTeamMembers = await db
      .select()
      .from(teamMembers)
      .where(eq(teamMembers.userId, userId));
    
    for (const member of userTeamMembers) {
      const memberTeamTasks = await db
        .select()
        .from(teamTasks)
        .where(eq(teamTasks.teamId, member.teamId));
      
      for (const task of memberTeamTasks) {
        events.push({
          id: `team-task-${task.id}`,
          type: "task",
          title: `[${task.teamId}] ${task.title}`,
          dueDate: task.dueDate,
          status: task.status === "completed" ? "completed" : "pending",
          taskId: task.id,
          isTeamTask: true,
        });
      }
    }
    
    return events;
  } catch (error) {
    console.error("[Database] Failed to get calendar events:", error);
    return [];
  }
}


// ===== BANK ACCOUNT BALANCE UPDATE =====

export async function updateBankAccountBalance(accountId: number, amount: string, isIncome: boolean) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  try {
    const account = await db.select().from(bankAccounts).where(eq(bankAccounts.id, accountId)).limit(1);
    
    if (account.length === 0) {
      throw new Error("Bank account not found");
    }
    
    const currentBalance = parseFloat(account[0].balance as any);
    const transactionAmount = parseFloat(amount);
    const newBalance = isIncome ? currentBalance + transactionAmount : currentBalance - transactionAmount;
    
    const result = await db
      .update(bankAccounts)
      .set({ balance: newBalance.toString() })
      .where(eq(bankAccounts.id, accountId));
    
    return result;
  } catch (error) {
    console.error("[Database] Failed to update bank account balance:", error);
    throw error;
  }
}


// ============ Team Members Functions ============

export async function getTeamMembers(teamId: number) {
  const db = await getDb();
  if (!db) return [];
  try {
    return await db.select().from(teamMembers).where(eq(teamMembers.teamId, teamId));
  } catch (error) {
    console.error("[Database] Failed to get team members:", error);
    return [];
  }
}

export async function addTeamMember(teamId: number, userId: number, role: "admin" | "member") {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  try {
    return await db.insert(teamMembers).values({ teamId, userId, role });
  } catch (error) {
    console.error("[Database] Failed to add team member:", error);
    throw error;
  }
}

export async function removeTeamMember(teamId: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  try {
    return await db.delete(teamMembers).where(and(eq(teamMembers.teamId, teamId), eq(teamMembers.userId, userId)));
  } catch (error) {
    console.error("[Database] Failed to remove team member:", error);
    throw error;
  }
}

export async function getTeamTasks(teamId: number) {
  const db = await getDb();
  if (!db) return [];
  try {
    return await db.select().from(teamTasks).where(eq(teamTasks.teamId, teamId));
  } catch (error) {
    console.error("[Database] Failed to get team tasks:", error);
    return [];
  }
}

export async function createTeamTask(data: {
  teamId: number;
  title: string;
  description?: string;
  assignedTo: number;
  startDate?: Date;
  dueDate: Date;
  createdBy: number;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  try {
    return await db.insert(teamTasks).values(data);
  } catch (error) {
    console.error("[Database] Failed to create team task:", error);
    throw error;
  }
}

export async function updateTeamTaskStatus(taskId: number, status: "pending" | "in_progress" | "completed") {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  try {
    return await db.update(teamTasks).set({ status }).where(eq(teamTasks.id, taskId));
  } catch (error) {
    console.error("[Database] Failed to update team task status:", error);
    throw error;
  }
}

export async function deleteTeamTask(taskId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  try {
    return await db.delete(teamTasks).where(eq(teamTasks.id, taskId));
  } catch (error) {
    console.error("[Database] Failed to delete team task:", error);
    throw error;
  }
}

export async function getTeamMessages(teamId: number) {
  const db = await getDb();
  if (!db) return [];
  try {
    return await db.select().from(teamMessages).where(eq(teamMessages.teamId, teamId));
  } catch (error) {
    console.error("[Database] Failed to get team messages:", error);
    return [];
  }
}

export async function createTeamMessage(data: { teamId: number; userId: number; message: string }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  try {
    return await db.insert(teamMessages).values(data);
  } catch (error) {
    console.error("[Database] Failed to create team message:", error);
    throw error;
  }
}


// ===== NOTIFICATIONS =====

export async function getNotifications(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  try {
    const userNotifications = await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt))
      .limit(50);
    
    return userNotifications;
  } catch (error) {
    console.error("[Database] Failed to get notifications:", error);
    return [];
  }
}

export async function createNotification(
  userId: number,
  type: "task_assigned" | "task_due" | "task_completed" | "message" | "team_invite",
  title: string,
  message: string,
  relatedId?: number
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  try {
    const result = await db.insert(notifications).values({
      userId,
      notificationType: type,
      title,
      message,
      relatedId,
      read: false,
    });
    
    return result;
  } catch (error) {
    console.error("[Database] Failed to create notification:", error);
    throw error;
  }
}

export async function markNotificationAsRead(notificationId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  try {
    await db
      .update(notifications)
      .set({ read: true })
      .where(eq(notifications.id, notificationId));
  } catch (error) {
    console.error("[Database] Failed to mark notification as read:", error);
    throw error;
  }
}

export async function getUnreadNotificationCount(userId: number) {
  const db = await getDb();
  if (!db) return 0;
  
  try {
    const result = await db
      .select({ count: count() })
      .from(notifications)
      .where(and(eq(notifications.userId, userId), eq(notifications.read, false)));
    
    return result[0]?.count || 0;
  } catch (error) {
    console.error("[Database] Failed to get unread notification count:", error);
    return 0;
  }
}


// ===== DASHBOARD STATISTICS =====
export async function getTasksStatistics(userId: number, teamId?: number) {
  const db = await getDb();
  if (!db) return { total: 0, completed: 0, pending: 0, inProgress: 0 };
  
  try {
    const query = teamId 
      ? db.select().from(teamTasks).where(eq(teamTasks.teamId, teamId))
      : db.select().from(teamTasks).where(eq(teamTasks.createdBy, userId));
    
    const allTasks = await query;
    
    return {
      total: allTasks.length,
      completed: allTasks.filter(t => t.status === 'completed').length,
      pending: allTasks.filter(t => t.status === 'pending').length,
      inProgress: allTasks.filter(t => t.status === 'in_progress').length,
    };
  } catch (error) {
    console.error("[Database] Failed to get tasks statistics:", error);
    return { total: 0, completed: 0, pending: 0, inProgress: 0 };
  }
}

export async function getTasksCompletedByWeek(userId: number, teamId?: number) {
  const db = await getDb();
  if (!db) return [];
  
  try {
    const query = teamId 
      ? db.select().from(teamTasks).where(eq(teamTasks.teamId, teamId))
      : db.select().from(teamTasks).where(eq(teamTasks.createdBy, userId));
    
    const allTasks = await query;
    
    // Agrupar por semana
    const weeks: Record<string, number> = {};
    const now = new Date();
    
    allTasks.forEach(task => {
      if (task.status === 'completed' && task.updatedAt) {
        const taskDate = new Date(task.updatedAt);
        const weekStart = new Date(taskDate);
        weekStart.setDate(taskDate.getDate() - taskDate.getDay());
        const weekKey = weekStart.toISOString().split('T')[0];
        weeks[weekKey] = (weeks[weekKey] || 0) + 1;
      }
    });
    
    // Retornar últimas 8 semanas
    const result = [];
    for (let i = 7; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(now.getDate() - (now.getDay() + i * 7));
      const weekKey = date.toISOString().split('T')[0];
      result.push({
        week: weekKey,
        completed: weeks[weekKey] || 0,
      });
    }
    
    return result;
  } catch (error) {
    console.error("[Database] Failed to get tasks completed by week:", error);
    return [];
  }
}

export async function getMemberProductivity(teamId: number) {
  const db = await getDb();
  if (!db) return [];
  
  try {
    const tasks = await db.select().from(teamTasks).where(eq(teamTasks.teamId, teamId));
    const members = await db.select().from(teamMembers).where(eq(teamMembers.teamId, teamId));
    
    const productivity: Record<number, { name: string; completed: number; pending: number; inProgress: number }> = {};
    
    members.forEach(member => {
      productivity[member.userId] = {
        name: `Membro ${member.userId}`,
        completed: 0,
        pending: 0,
        inProgress: 0,
      };
    });
    
    tasks.forEach(task => {
      if (productivity[task.assignedTo]) {
        if (task.status === 'completed') {
          productivity[task.assignedTo].completed++;
        } else if (task.status === 'pending') {
          productivity[task.assignedTo].pending++;
        } else if (task.status === 'in_progress') {
          productivity[task.assignedTo].inProgress++;
        }
      }
    });
    
    return Object.entries(productivity).map(([userId, data]) => ({
      userId: parseInt(userId),
      ...data,
    }));
  } catch (error) {
    console.error("[Database] Failed to get member productivity:", error);
    return [];
  }
}

export async function getFinancialSummary(userId: number) {
  const db = await getDb();
  if (!db) return { income: 0, expense: 0, balance: 0 };
  
  try {
    const transactions = await db
      .select()
      .from(financialTransactions)
      .where(eq(financialTransactions.userId, userId));
    
    const income = transactions
      .filter(t => t.transactionType === 'income' && t.status === 'completed')
      .reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0);
    
    const expense = transactions
      .filter(t => t.transactionType === 'expense' && t.status === 'completed')
      .reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0);
    
    return {
      income,
      expense,
      balance: income - expense,
    };
  } catch (error) {
    console.error("[Database] Failed to get financial summary:", error);
    return { income: 0, expense: 0, balance: 0 };
  }
}


// ===== REPORT GENERATION =====
export async function getReportData(userId: number, teamId?: number, startDate?: Date, endDate?: Date) {
  const db = await getDb();
  if (!db) return null;
  
  try {
    const stats = await getTasksStatistics(userId, teamId);
    const weeklyData = await getTasksCompletedByWeek(userId, teamId);
    const memberProductivity = teamId ? await getMemberProductivity(teamId) : [];
    const financialSummary = await getFinancialSummary(userId);
    
    return {
      generatedAt: new Date(),
      period: { startDate, endDate },
      stats,
      weeklyData,
      memberProductivity,
      financialSummary,
    };
  } catch (error) {
    console.error("[Database] Failed to get report data:", error);
    return null;
  }
}

export async function getOverdueTasks(userId: number, teamId?: number) {
  const db = await getDb();
  if (!db) return [];
  
  try {
    const now = new Date();
    const query = teamId
      ? db.select().from(teamTasks).where(eq(teamTasks.teamId, teamId))
      : db.select().from(teamTasks).where(eq(teamTasks.createdBy, userId));
    
    const allTasks = await query;
    
    return allTasks.filter(task => 
      task.status !== 'completed' && 
      task.dueDate && 
      new Date(task.dueDate) < now
    );
  } catch (error) {
    console.error("[Database] Failed to get overdue tasks:", error);
    return [];
  }
}

export async function getFinancialAnomalies(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  try {
    const transactions = await db
      .select()
      .from(financialTransactions)
      .where(eq(financialTransactions.userId, userId));
    
    const anomalies = [];
    
    // Detectar transações muito altas (acima de 10x da média)
    const amounts = transactions.map(t => parseFloat(t.amount.toString()));
    if (amounts.length > 0) {
      const average = amounts.reduce((a, b) => a + b, 0) / amounts.length;
      const highTransactions = transactions.filter(t => 
        parseFloat(t.amount.toString()) > average * 10
      );
      
      if (highTransactions.length > 0) {
        anomalies.push({
          type: "high_transaction",
          severity: "warning",
          message: `Transação acima do normal detectada: ${highTransactions.length} transações`,
          count: highTransactions.length,
        });
      }
    }
    
    // Detectar muitas transações de despesa em um dia
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTransactions = transactions.filter(t => {
      const txDate = new Date(t.transactionDate);
      txDate.setHours(0, 0, 0, 0);
      return txDate.getTime() === today.getTime();
    });
    
    if (todayTransactions.length > 10) {
      anomalies.push({
        type: "many_transactions",
        severity: "info",
        message: `Muitas transações hoje: ${todayTransactions.length}`,
        count: todayTransactions.length,
      });
    }
    
    return anomalies;
  } catch (error) {
    console.error("[Database] Failed to get financial anomalies:", error);
    return [];
  }
}


// ===== PDV (POINT OF SALE) FUNCTIONS =====

/**
 * Search products by name, code, or SKU for quick PDV lookup
 */
export async function searchProductsForPdv(userId: number, query: string) {
  const db = await getDb();
  if (!db) return [];
  
  try {
    const searchTerm = `%${query}%`;
    return await db
      .select()
      .from(products)
      .where(
        and(
          eq(products.userId, userId),
          // Search by name, code, or SKU
          // Note: MySQL LIKE is case-insensitive by default
        )
      )
      .limit(20);
  } catch (error) {
    console.error("[Database] Failed to search products:", error);
    return [];
  }
}

/**
 * Get product favorites (shortcuts) for PDV
 */
export async function getProductFavorites(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  try {
    const favorites = await db
      .select()
      .from(productFavorites)
      .where(eq(productFavorites.userId, userId))
      .orderBy(productFavorites.position);
    
    // Join with products to get full product info
    const favoriteIds = favorites.map(f => f.productId);
    if (favoriteIds.length === 0) return [];
    
    return await db
      .select()
      .from(products)
      .where(and(
        eq(products.userId, userId),
        // In clause would be better but Drizzle might not support it easily
      ))
      .limit(100);
  } catch (error) {
    console.error("[Database] Failed to get product favorites:", error);
    return [];
  }
}

/**
 * Add product to favorites
 */
export async function addProductFavorite(userId: number, productId: number, position: number = 0) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  try {
    return await db.insert(productFavorites).values({
      userId,
      productId,
      position,
    });
  } catch (error) {
    console.error("[Database] Failed to add product favorite:", error);
    throw error;
  }
}

/**
 * Remove product from favorites
 */
export async function removeProductFavorite(userId: number, productId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  try {
    return await db
      .delete(productFavorites)
      .where(
        and(
          eq(productFavorites.userId, userId),
          eq(productFavorites.productId, productId)
        )
      );
  } catch (error) {
    console.error("[Database] Failed to remove product favorite:", error);
    throw error;
  }
}

/**
 * Create a complete sales order with items
 */
export async function createSalesOrder(
  orderData: typeof salesOrders.$inferInsert,
  items: typeof salesOrderItems.$inferInsert[]
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  try {
    // Insert order first
    console.log("[Database] Creating sales order with data:", orderData);
    const orderResult = await db.insert(salesOrders).values(orderData);
    console.log("[Database] Order result:", orderResult);
    
    // Extract insertId from Drizzle result - handle different return formats
    let orderId: number | undefined;
    if (typeof orderResult === 'object' && orderResult !== null) {
      orderId = (orderResult as any).insertId;
      console.log("[Database] Extracted orderId:", orderId, "Type:", typeof orderId);
    }
    
    if (!orderId || isNaN(orderId)) {
      console.error("[Database] Invalid orderId:", orderId, "Result:", orderResult);
      throw new Error(`Failed to get valid insertId from order result`);
    }
    
    // Insert items with the order ID
    const itemsWithOrderId = items.map(item => {
      const itemData: any = { ...item };
      itemData.salesOrderId = Number(orderId);
      return itemData;
    });
    
    if (itemsWithOrderId.length > 0) {
      await db.insert(salesOrderItems).values(itemsWithOrderId as any);
    }
    
    return { orderId, success: true };
  } catch (error) {
    console.error("[Database] Failed to create sales order:", error);
    throw error;
  }
}

/**
 * Get sales order with items
 */
export async function getSalesOrderWithItems(orderId: number) {
  const db = await getDb();
  if (!db) return null;
  
  try {
    const order = await db
      .select()
      .from(salesOrders)
      .where(eq(salesOrders.id, orderId))
      .limit(1);
    
    if (!order || order.length === 0) return null;
    
    const items = await db
      .select()
      .from(salesOrderItems)
      .where(eq(salesOrderItems.salesOrderId, orderId));
    
    return {
      ...order[0],
      items,
    };
  } catch (error) {
    console.error("[Database] Failed to get sales order:", error);
    return null;
  }
}

/**
 * Get sales orders for a user
 */
export async function getSalesOrdersByUserId(userId: number, limit: number = 50) {
  const db = await getDb();
  if (!db) return [];
  
  try {
    return await db
      .select()
      .from(salesOrders)
      .where(eq(salesOrders.userId, userId))
      .orderBy(desc(salesOrders.createdAt))
      .limit(limit);
  } catch (error) {
    console.error("[Database] Failed to get sales orders:", error);
    return [];
  }
}

/**
 * Update sales order status
 */
export async function updateSalesOrderStatus(orderId: number, status: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  try {
    return await db
      .update(salesOrders)
      .set({ paymentStatus: status as any })
      .where(eq(salesOrders.id, orderId));
  } catch (error) {
    console.error("[Database] Failed to update sales order status:", error);
    throw error;
  }
}


// ============ Additional Loan Functions ============

export async function getLoanById(id: number) {
  const db = await getDb();
  if (!db) return null;
  
  try {
    const result = await db
      .select()
      .from(loans)
      .where(eq(loans.id, id))
      .limit(1);
    return result[0] || null;
  } catch (error) {
    console.error("[Database] Failed to get loan by ID:", error);
    return null;
  }
}

export async function getLoanInstallmentById(id: number) {
  const db = await getDb();
  if (!db) return null;
  
  try {
    const result = await db
      .select()
      .from(loanInstallments)
      .where(eq(loanInstallments.id, id))
      .limit(1);
    return result[0] || null;
  } catch (error) {
    console.error("[Database] Failed to get loan installment by ID:", error);
    return null;
  }
}


// ============ Account Management ============
export async function deleteAllUserData(userId: number): Promise<void> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  try {
    // Apagar dados em ordem de dependência (chaves estrangeiras primeiro)
    // Apagar notificações PRIMEIRO (elas referenciam outras entidades)
    await db.delete(notifications).where(eq(notifications.userId, userId));
    
    // Tabelas que dependem de outras
    await db.delete(teamMessages).where(eq(teamMessages.userId, userId));
    await db.delete(teamTasks).where(eq(teamTasks.createdBy, userId));
    await db.delete(teamMembers).where(eq(teamMembers.userId, userId));
    await db.delete(teams).where(eq(teams.userId, userId));
    
    // Apagar loans e dependências
    const userLoans = await db.select({ id: loans.id }).from(loans).where(eq(loans.userId, userId));
    for (const loan of userLoans) {
      await db.delete(loanPayments).where(eq(loanPayments.loanId, loan.id));
      await db.delete(loanInstallments).where(eq(loanInstallments.loanId, loan.id));
    }
    await db.delete(loans).where(eq(loans.userId, userId));
    
    // Apagar installmentPlans
    await db.delete(installmentPlans).where(eq(installmentPlans.userId, userId));
    
    // Apagar transações financeiras
    await db.delete(financialTransactions).where(eq(financialTransactions.userId, userId));
    await db.delete(digitalWallets).where(eq(digitalWallets.userId, userId));
    await db.delete(creditCards).where(eq(creditCards.userId, userId));
    await db.delete(bankAccounts).where(eq(bankAccounts.userId, userId));
    
    // Apagar histórico de produtos
    await db.delete(productOutputHistory).where(eq(productOutputHistory.userId, userId));
    
    // Apagar compras de fornecedores
    await db.delete(supplierPurchases).where(eq(supplierPurchases.userId, userId));
    
    // Apagar assinaturas
    await db.delete(subscriptions).where(eq(subscriptions.userId, userId));
    
    // Apagar vendas e dependências
    const userSalesOrders = await db.select({ id: salesOrders.id }).from(salesOrders).where(eq(salesOrders.userId, userId));
    for (const order of userSalesOrders) {
      await db.delete(salesOrderItems).where(eq(salesOrderItems.salesOrderId, order.id));
    }
    await db.delete(salesOrders).where(eq(salesOrders.userId, userId));
    await db.delete(sales).where(eq(sales.userId, userId));
    
    // Apagar tarefas
    await db.delete(tasks).where(eq(tasks.userId, userId));
    
    // Apagar registros financeiros
    await db.delete(financialRecords).where(eq(financialRecords.userId, userId));
    
    // Apagar favoritos de produtos
    await db.delete(productFavorites).where(eq(productFavorites.userId, userId));
    
    // Apagar produtos
    await db.delete(products).where(eq(products.userId, userId));
    
    // Apagar fornecedores
    await db.delete(suppliers).where(eq(suppliers.userId, userId));
    
    // Apagar clientes
    await db.delete(clients).where(eq(clients.userId, userId));
  } catch (error) {
    console.error("[Database] Failed to delete all user data:", error);
    throw error;
  }
}

export async function deleteUser(userId: number): Promise<void> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  try {
    await db.delete(users).where(eq(users.id, userId));
  } catch (error) {
    console.error("[Database] Failed to delete user:", error);
    throw error;
  }
}


// ============ Cash Box ============
/**
 * Get or create cash box for user
 */
export async function getCashBox(userId: number) {
  const db = await getDb();
  if (!db) return null;

  try {
    const result = await db.select().from(cashBox).where(eq(cashBox.userId, userId)).limit(1);
    
    if (result.length > 0) {
      return result[0];
    }

    // Create new cash box if it doesn't exist
    const newCashBox = await db.insert(cashBox).values({
      userId,
      balance: "0",
      currency: "BRL",
    });

    const insertedId = (newCashBox as any).insertId || newCashBox[0];
    return {
      id: insertedId,
      userId,
      balance: "0",
      currency: "BRL",
      lastUpdated: new Date(),
      createdAt: new Date(),
    };
  } catch (error) {
    console.error("[Database] Failed to get cash box:", error);
    throw error;
  }
}

/**
 * Update cash box balance
 */
export async function updateCashBoxBalance(userId: number, amount: string | number) {
  const db = await getDb();
  if (!db) return null;

  try {
    // Ensure cash box exists
    const existing = await getCashBox(userId);
    
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    const currentBalance = typeof existing?.balance === 'string' ? parseFloat(existing.balance) : (existing?.balance || 0);
    const newBalance = currentBalance + numAmount;

    const result = await db
      .update(cashBox)
      .set({ 
        balance: newBalance.toString(),
        lastUpdated: new Date(),
      })
      .where(eq(cashBox.userId, userId));

    return result;
  } catch (error) {
    console.error("[Database] Failed to update cash box balance:", error);
    throw error;
  }
}

/**
 * Get cash box balance
 */
export async function getCashBoxBalance(userId: number): Promise<number> {
  const db = await getDb();
  if (!db) return 0;

  try {
    const result = await db.select().from(cashBox).where(eq(cashBox.userId, userId)).limit(1);
    
    if (result.length > 0) {
      const balance = result[0].balance;
      return typeof balance === 'string' ? parseFloat(balance) : (balance || 0);
    }

    return 0;
  } catch (error) {
    console.error("[Database] Failed to get cash box balance:", error);
    return 0;
  }
}


/**
 * Get all expense categories for a user, ordered by usage count (most used first)
 */
export async function getExpenseCategoriesByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];

  try {
    return await db
      .select()
      .from(expenseCategories)
      .where(eq(expenseCategories.userId, userId))
      .orderBy(desc(expenseCategories.usageCount), desc(expenseCategories.createdAt));
  } catch (error) {
    console.error("[Database] Failed to get expense categories:", error);
    return [];
  }
}

/**
 * Create a new expense category
 */
export async function createExpenseCategory(data: {
  userId: number;
  name: string;
  icon?: string;
  color?: string;
  isDefault?: boolean;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    const result = await db.insert(expenseCategories).values({
      userId: data.userId,
      name: data.name,
      nameLower: data.name.toLowerCase(),
      icon: data.icon || "tag",
      color: data.color || "#7c3aed",
      isDefault: data.isDefault || false,
      usageCount: 0,
    });

    // Return the created category
    const categories = await db
      .select()
      .from(expenseCategories)
      .where(
        and(
          eq(expenseCategories.userId, data.userId),
          eq(expenseCategories.nameLower, data.name.toLowerCase())
        )
      )
      .limit(1);

    return categories[0] || null;
  } catch (error) {
    console.error("[Database] Failed to create expense category:", error);
    throw error;
  }
}

/**
 * Delete an expense category
 */
export async function deleteExpenseCategory(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    await db
      .delete(expenseCategories)
      .where(
        and(
          eq(expenseCategories.id, id),
          eq(expenseCategories.userId, userId)
        )
      );

    return { success: true };
  } catch (error) {
    console.error("[Database] Failed to delete expense category:", error);
    throw error;
  }
}

/**
 * Increment usage count for a category
 */
export async function incrementCategoryUsageCount(categoryId: number) {
  const db = await getDb();
  if (!db) return;

  try {
    const category = await db
      .select()
      .from(expenseCategories)
      .where(eq(expenseCategories.id, categoryId))
      .limit(1);

    if (category.length > 0) {
      await db
        .update(expenseCategories)
        .set({ usageCount: (category[0].usageCount || 0) + 1 })
        .where(eq(expenseCategories.id, categoryId));
    }
  } catch (error) {
    console.error("[Database] Failed to increment category usage count:", error);
  }
}

/**
 * Seed default expense categories for a new user
 */
export async function seedDefaultExpenseCategories(userId: number) {
  const db = await getDb();
  if (!db) return;

  try {
    const defaultCategories = [
      { name: "Supermercado", icon: "shopping-cart", color: "#10b981" },
      { name: "Aluguel", icon: "home", color: "#3b82f6" },
      { name: "Funcionários", icon: "users", color: "#8b5cf6" },
      { name: "Escola", icon: "book", color: "#f59e0b" },
      { name: "Transporte", icon: "truck", color: "#ec4899" },
      { name: "Outros", icon: "tag", color: "#6b7280" },
    ];

    for (const category of defaultCategories) {
      // Check if category already exists
      const existing = await db
        .select()
        .from(expenseCategories)
        .where(
          and(
            eq(expenseCategories.userId, userId),
            eq(expenseCategories.nameLower, category.name.toLowerCase())
          )
        )
        .limit(1);

      if (existing.length === 0) {
        await db.insert(expenseCategories).values({
          userId,
          name: category.name,
          nameLower: category.name.toLowerCase(),
          icon: category.icon,
          color: category.color,
          isDefault: true,
          usageCount: 0,
        });
      }
    }
  } catch (error) {
    console.error("[Database] Failed to seed default expense categories:", error);
  }
}


export async function getInstallmentsForCalendar(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  try {
    // Get all loans for the user
    const userLoans = await db
      .select()
      .from(loans)
      .where(eq(loans.userId, userId));
    
    // Get all installments for these loans
    const allInstallments: Array<any> = [];
    for (const loan of userLoans) {
      const installments = await db
        .select()
        .from(loanInstallments)
        .where(eq(loanInstallments.loanId, loan.id));
      
      // Add client name to each installment
      const client = await db
        .select()
        .from(clients)
        .where(eq(clients.id, loan.clientId))
        .limit(1);
      
      installments.forEach((inst: any) => {
        allInstallments.push({
          ...inst,
          loanId: loan.id,
          clientName: client.length > 0 ? client[0].name : "Cliente Desconhecido",
          loanType: loan.type,
        });
      });
    }
    
    return allInstallments;
  } catch (error) {
    console.error("[Database] Failed to get installments for calendar:", error);
    return [];
  }
}
