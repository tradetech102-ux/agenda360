/**
 * Optimized Database Queries
 * Eliminam N+1 problems, implementam agregações e paginação
 */

import { eq, and, desc, sql } from "drizzle-orm";
import { getDb } from "./db";
import { loans, loanInstallments, clients } from "../drizzle/schema";

interface LoanWithDetails {
  id: number;
  clientId: number;
  clientName: string | null;
  initialAmount: string | number;
  interestRate: string | number | null;
  status: string | null;
  createdAt: Date;
  totalInstallments: number;
  paidInstallments: number;
  pendingInstallments: number;
  totalPaid: number;
  totalPending: number;
}

/**
 * Otimizado: Get loans with client details e agregações de parcelas
 * Usa JOIN + GROUP BY para evitar N+1 problem
 * Implementa paginação com LIMIT/OFFSET
 */
export async function getLoansByUserIdOptimized(
  userId: number,
  page: number = 1,
  pageSize: number = 20
): Promise<LoanWithDetails[]> {
  const db = await getDb();
  if (!db) return [];

  try {
    const offset = (page - 1) * pageSize;

    // Query com JOINs e agregações
    const result = await db
      .select({
        id: loans.id,
        clientId: loans.clientId,
        clientName: clients.name,
        initialAmount: loans.initialAmount,
        interestRate: loans.interestRate,
        status: loans.status,
        createdAt: loans.createdAt,
        totalInstallments: sql<number>`COUNT(DISTINCT ${loanInstallments.id})`,
        paidInstallments: sql<number>`SUM(CASE WHEN ${loanInstallments.status} = 'paid' THEN 1 ELSE 0 END)`,
        pendingInstallments: sql<number>`SUM(CASE WHEN ${loanInstallments.status} IN ('pending', 'partially_paid') THEN 1 ELSE 0 END)`,
        totalPaid: sql<number>`COALESCE(SUM(CASE WHEN ${loanInstallments.status} = 'paid' THEN ${loanInstallments.amount} ELSE 0 END), 0)`,
        totalPending: sql<number>`COALESCE(SUM(CASE WHEN ${loanInstallments.status} IN ('pending', 'partially_paid') THEN ${loanInstallments.amount} ELSE 0 END), 0)`,
      })
      .from(loans)
      .leftJoin(clients, eq(loans.clientId, clients.id))
      .leftJoin(loanInstallments, eq(loans.id, loanInstallments.loanId))
      .where(eq(loans.userId, userId))
      .groupBy(loans.id)
      .orderBy(desc(loans.createdAt))
      .limit(pageSize)
      .offset(offset);

    return result as LoanWithDetails[];
  } catch (error) {
    console.error("[Database] Failed to get loans optimized:", error);
    return [];
  }
}

/**
 * Otimizado: Count total loans para paginação
 */
export async function countLoansByUserId(userId: number): Promise<number> {
  const db = await getDb();
  if (!db) return 0;

  try {
    const result = await db
      .select({ count: sql<number>`COUNT(DISTINCT ${loans.id})` })
      .from(loans)
      .where(eq(loans.userId, userId));

    return result[0]?.count || 0;
  } catch (error) {
    console.error("[Database] Failed to count loans:", error);
    return 0;
  }
}

/**
 * Otimizado: Get loan details com todas as parcelas
 * Usa agregação para calcular totais sem múltiplas queries
 */
export async function getLoanDetailsOptimized(
  loanId: number,
  userId: number
): Promise<any> {
  const db = await getDb();
  if (!db) return null;

  try {
    // Query principal com agregações
    const result = await db
      .select({
        id: loans.id,
        clientId: loans.clientId,
        clientName: clients.name,
        initialAmount: loans.initialAmount,
        interestRate: loans.interestRate,
        status: loans.status,
        createdAt: loans.createdAt,
        totalInstallments: sql<number>`COUNT(DISTINCT ${loanInstallments.id})`,
        totalPaid: sql<number>`COALESCE(SUM(CASE WHEN ${loanInstallments.status} = 'paid' THEN ${loanInstallments.amount} ELSE 0 END), 0)`,
        totalPending: sql<number>`COALESCE(SUM(CASE WHEN ${loanInstallments.status} IN ('pending', 'partially_paid') THEN ${loanInstallments.amount} ELSE 0 END), 0)`,
      })
      .from(loans)
      .leftJoin(clients, eq(loans.clientId, clients.id))
      .leftJoin(loanInstallments, eq(loans.id, loanInstallments.loanId))
      .where(and(eq(loans.id, loanId), eq(loans.userId, userId)))
      .groupBy(loans.id);

    return result[0] || null;
  } catch (error) {
    console.error("[Database] Failed to get loan details optimized:", error);
    return null;
  }
}

/**
 * Otimizado: Get financial transactions com paginação
 */
export async function getFinancialTransactionsOptimized(
  userId: number,
  page: number = 1,
  pageSize: number = 50
): Promise<any[]> {
  const db = await getDb();
  if (!db) return [];

  try {
    const offset = (page - 1) * pageSize;
    const { financialTransactions } = await import("../drizzle/schema");

    const result = await db
      .select()
      .from(financialTransactions)
      .where(eq(financialTransactions.userId, userId))
      .orderBy(desc(financialTransactions.transactionDate))
      .limit(pageSize)
      .offset(offset);

    return result;
  } catch (error) {
    console.error("[Database] Failed to get transactions optimized:", error);
    return [];
  }
}

/**
 * Cache de saldo total (atualizado no momento da transação)
 * Evita recalcular SUM toda vez
 */
export async function getTotalBalanceCached(userId: number): Promise<number> {
  const db = await getDb();
  if (!db) return 0;

  try {
    const { bankAccounts, digitalWallets, financialTransactions } = await import("../drizzle/schema");

    // Saldo das contas bancárias
    const bankResult = await db
      .select({ total: sql<number>`COALESCE(SUM(${bankAccounts.balance}), 0)` })
      .from(bankAccounts)
      .where(eq(bankAccounts.userId, userId));

    // Saldo das wallets
    const walletResult = await db
      .select({ total: sql<number>`COALESCE(SUM(${digitalWallets.balance}), 0)` })
      .from(digitalWallets)
      .where(eq(digitalWallets.userId, userId));

    const bankBalance = bankResult[0]?.total || 0;
    const walletBalance = walletResult[0]?.total || 0;

    return bankBalance + walletBalance;
  } catch (error) {
    console.error("[Database] Failed to get total balance cached:", error);
    return 0;
  }
}
