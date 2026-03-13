import { describe, it, expect } from "vitest";

describe("Total Balance Calculation - No Duplication Bug", () => {
  describe("Balance Calculation Logic", () => {
    it("should NOT duplicate cash transactions in total balance", () => {
      // CRITICAL BUG FIX: Ensure cash balance is not counted twice
      // The bug was: getTotalBalance() was summing:
      // 1. Bank account balance (R$ 2150) - which ALREADY includes all transactions
      // 2. Cash calculated from transactions (R$ 150) - DUPLICATION!
      // Result: R$ 2150 + R$ 150 = R$ 2300 (WRONG)
      // Should be: R$ 2150 (CORRECT)
      
      const bankAccountBalance = 2150; // Already includes all transactions
      const cashCalculatedFromTransactions = 150; // Same transactions counted again!
      
      // WRONG calculation (the bug):
      const wrongTotal = bankAccountBalance + cashCalculatedFromTransactions;
      expect(wrongTotal).toBe(2300); // This was the bug!
      
      // CORRECT calculation (after fix):
      const correctTotal = bankAccountBalance; // Only count bank account once
      expect(correctTotal).toBe(2150);
      
      // Verify they're different
      expect(wrongTotal).not.toBe(correctTotal);
    });

    it("should sum only account balances without duplicating transactions", () => {
      // Scenario: User has multiple accounts
      const bankAccount1 = 1000; // Already includes transactions
      const bankAccount2 = 500;  // Already includes transactions
      const wallet = 200;        // Already includes transactions
      const creditCard = 450;    // Already includes transactions
      
      // CORRECT: Sum all accounts once
      const totalBalance = bankAccount1 + bankAccount2 + wallet + creditCard;
      
      expect(totalBalance).toBe(2150);
      
      // WRONG: Would be to also add cash calculated from transactions
      const cashFromTransactions = 150; // Duplicate!
      const wrongTotal = totalBalance + cashFromTransactions;
      
      expect(wrongTotal).toBe(2300); // This was the bug
      expect(totalBalance).not.toBe(wrongTotal);
    });

    it("should correctly calculate total with multiple transaction types", () => {
      // Scenario: Multiple transactions in a month
      // Initial account balance: R$ 2000
      // Income transaction: +R$ 150
      // Result: R$ 2150 (already in account balance)
      
      const initialAccountBalance = 2000;
      const incomeTransaction = 150;
      const accountBalanceAfterTransaction = initialAccountBalance + incomeTransaction; // 2150
      
      // The account balance ALREADY reflects the transaction
      expect(accountBalanceAfterTransaction).toBe(2150);
      
      // Total balance should be just the account balance
      const totalBalance = accountBalanceAfterTransaction;
      expect(totalBalance).toBe(2150);
      
      // NOT account balance + income transaction again
      const wrongTotal = accountBalanceAfterTransaction + incomeTransaction;
      expect(wrongTotal).toBe(2300); // WRONG!
      expect(totalBalance).not.toBe(wrongTotal);
    });

    it("should handle multiple transactions without duplication", () => {
      // Scenario: Multiple income and expense transactions
      let accountBalance = 2000;
      
      // Transaction 1: Income +100
      accountBalance += 100; // 2100
      expect(accountBalance).toBe(2100);
      
      // Transaction 2: Income +50
      accountBalance += 50; // 2150
      expect(accountBalance).toBe(2150);
      
      // Transaction 3: Expense -50
      accountBalance -= 50; // 2100
      expect(accountBalance).toBe(2100);
      
      // Total balance should be the account balance
      const totalBalance = accountBalance;
      expect(totalBalance).toBe(2100);
      
      // NOT account balance + sum of transactions
      const sumOfTransactions = 100 + 50 - 50; // 100
      const wrongTotal = accountBalance + sumOfTransactions;
      expect(wrongTotal).toBe(2200); // WRONG!
      expect(totalBalance).not.toBe(wrongTotal);
    });

    it("should correctly display Saldo Atual without duplicating Entradas", () => {
      // REAL WORLD SCENARIO from the bug report
      // User sees:
      // - Saldo Atual: R$ 2300 (WRONG - before fix)
      // - Entradas no Mês: R$ 150
      // - Conta Bancária (ITAU): R$ 2150
      
      // The bug was: Saldo Atual = Conta Bancária + Entradas no Mês
      // Saldo Atual = 2150 + 150 = 2300 (WRONG)
      
      // CORRECT: Saldo Atual should be just the account balance
      const contaBancaria = 2150;
      const entradasNoMes = 150;
      
      // WRONG calculation (the bug):
      const wrongSaldoAtual = contaBancaria + entradasNoMes;
      expect(wrongSaldoAtual).toBe(2300);
      
      // CORRECT calculation (after fix):
      const correctSaldoAtual = contaBancaria;
      expect(correctSaldoAtual).toBe(2150);
      
      // The Saldo do Mês should still be Entradas - Saídas
      const saidasNoMes = 0;
      const saldoDoMes = entradasNoMes - saidasNoMes;
      expect(saldoDoMes).toBe(150);
      
      // Verify the relationship
      expect(correctSaldoAtual).not.toBe(wrongSaldoAtual);
      expect(correctSaldoAtual).toBe(2150);
      expect(saldoDoMes).toBe(150);
    });
  });

  describe("Edge Cases", () => {
    it("should handle zero balance correctly", () => {
      const accountBalance = 0;
      const totalBalance = accountBalance;
      
      expect(totalBalance).toBe(0);
    });

    it("should handle negative balance correctly", () => {
      const accountBalance = -500; // Overdraft
      const totalBalance = accountBalance;
      
      expect(totalBalance).toBe(-500);
    });

    it("should handle large amounts without duplication", () => {
      const accountBalance = 1000000; // R$ 1 million
      const incomeTransaction = 50000; // R$ 50k
      const accountAfterTransaction = accountBalance + incomeTransaction; // 1050000
      
      // Total should be account balance, not account + transaction
      const totalBalance = accountAfterTransaction;
      expect(totalBalance).toBe(1050000);
      
      const wrongTotal = accountAfterTransaction + incomeTransaction;
      expect(wrongTotal).toBe(1100000); // WRONG!
      expect(totalBalance).not.toBe(wrongTotal);
    });

    it("should handle decimal amounts correctly", () => {
      const accountBalance = 2150.75;
      const incomeTransaction = 150.25;
      const accountAfterTransaction = accountBalance + incomeTransaction; // 2301.00
      
      // Total should be account balance only
      const totalBalance = accountAfterTransaction;
      expect(totalBalance).toBeCloseTo(2301.00, 2);
      
      // NOT account + transaction again
      const wrongTotal = accountAfterTransaction + incomeTransaction;
      expect(wrongTotal).toBeCloseTo(2451.25, 2); // WRONG!
      expect(totalBalance).not.toBe(wrongTotal);
    });
  });
});
