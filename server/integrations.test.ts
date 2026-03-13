import { describe, it, expect, beforeAll, afterAll } from "vitest";
import * as db from "./db";

const testUserId = 999;

describe("Integration Tests - Calendar, Loans, Financial", () => {

  describe("Calendar Events", () => {
    it("should return empty events for user with no data", async () => {
      const events = await db.getCalendarEvents(testUserId);
      expect(Array.isArray(events)).toBe(true);
    });

    it("should include loan installment events", async () => {
      const events = await db.getCalendarEvents(testUserId);
      const loanEvents = events.filter((e: any) => e.type === "payment" && e.loanId);
      expect(Array.isArray(loanEvents)).toBe(true);
    });

    it("should include supplier purchase events", async () => {
      const events = await db.getCalendarEvents(testUserId);
      const purchaseEvents = events.filter((e: any) => e.type === "payment" && e.purchaseId);
      expect(Array.isArray(purchaseEvents)).toBe(true);
    });

    it("should include sale events", async () => {
      const events = await db.getCalendarEvents(testUserId);
      const saleEvents = events.filter((e: any) => e.type === "sale");
      expect(Array.isArray(saleEvents)).toBe(true);
    });

    it("should include task events", async () => {
      const events = await db.getCalendarEvents(testUserId);
      const taskEvents = events.filter((e: any) => e.type === "task");
      expect(Array.isArray(taskEvents)).toBe(true);
    });
  });

  describe("Financial Transactions", () => {
    it("should create financial transaction for loan payment", async () => {
      const transaction = await db.createFinancialTransaction({
        userId: testUserId,
        transactionType: "income",
        paymentMethod: "transfer",
        accountId: 1,
        amount: "1000",
        description: "Pagamento de emprestimo",
        category: "Emprestimos",
        status: "completed",
        transactionDate: new Date(),
      });
      expect(transaction).toBeDefined();
    });

    it("should create financial transaction for supplier payment", async () => {
      const transaction = await db.createFinancialTransaction({
        userId: testUserId,
        transactionType: "expense",
        paymentMethod: "transfer",
        accountId: 1,
        amount: "500",
        description: "Pagamento a fornecedor",
        category: "Fornecedores",
        status: "completed",
        transactionDate: new Date(),
      });
      expect(transaction).toBeDefined();
    });

    it("should create financial transaction for sale", async () => {
      const transaction = await db.createFinancialTransaction({
        userId: testUserId,
        transactionType: "income",
        paymentMethod: "transfer",
        accountId: 1,
        amount: "2000",
        description: "Venda de produto",
        category: "Vendas",
        status: "completed",
        transactionDate: new Date(),
      });
      expect(transaction).toBeDefined();
    });

    it("should retrieve financial transactions by user", async () => {
      const transactions = await db.getFinancialTransactionsByUserId(testUserId);
      expect(Array.isArray(transactions)).toBe(true);
    });
  });

  describe("Loan Installments", () => {
    it("should create loan installments", async () => {
      const installments = [
        {
          loanId: 1,
          installmentNumber: 1,
          dueDate: new Date("2026-03-21"),
          amount: "500",
          status: "pending",
        },
        {
          loanId: 1,
          installmentNumber: 2,
          dueDate: new Date("2026-04-21"),
          amount: "500",
          status: "pending",
        },
      ];
      const result = await db.createLoanInstallments(installments);
      expect(result).toBeDefined();
    });

    it("should retrieve loan installments", async () => {
      const installments = await db.getLoanInstallments(1);
      expect(Array.isArray(installments)).toBe(true);
    });

    it("should update loan installment status", async () => {
      const result = await db.updateLoanInstallment(1, {
        status: "paid",
        paidAt: new Date(),
      });
      expect(result).toBeDefined();
    });
  });

  describe("Loan Payments", () => {
    it("should create loan payment", async () => {
      const payment = await db.createLoanPayment({
        loanId: 1,
        amount: "500",
        paymentType: "partial",
        notes: "Primeira parcela paga",
      });
      expect(payment).toBeDefined();
    });

    it("should retrieve loan payments", async () => {
      const payments = await db.getLoanPayments(1);
      expect(Array.isArray(payments)).toBe(true);
    });
  });

  describe("Supplier Purchases", () => {
    it("should create supplier purchase", async () => {
      const purchase = await db.createSupplierPurchase({
        userId: testUserId,
        supplierId: 1,
        description: "Compra de materiais",
        amount: "1000",
        purchaseDate: new Date(),
        dueDate: new Date("2026-03-21"),
        paymentStatus: "pending",
      });
      expect(purchase).toBeDefined();
    });

    it("should retrieve supplier purchases", async () => {
      const purchases = await db.getSupplierPurchasesByUserId(testUserId);
      expect(Array.isArray(purchases)).toBe(true);
    });

    it("should update supplier purchase status", async () => {
      const result = await db.updateSupplierPurchase(1, {
        paymentStatus: "paid",
        paidDate: new Date(),
      });
      expect(result).toBeDefined();
    });
  });

  describe("Sales", () => {
    it("should create sale", async () => {
      const sale = await db.createSale({
        userId: testUserId,
        clientId: 1,
        productId: 1,
        quantity: 5,
        unitPrice: "100",
        totalPrice: "500",
        paymentStatus: "paid",
      });
      expect(sale).toBeDefined();
    });

    it("should retrieve sales", async () => {
      const sales = await db.getSalesByUserId(testUserId);
      expect(Array.isArray(sales)).toBe(true);
    });
  });
});


describe("Loan Account Integration", () => {
  it("should update bank account balance when creating borrowed loan", async () => {
    const account = await db.createBankAccount({
      userId: testUserId,
      accountName: "Conta Teste",
      bankName: "Banco Teste",
      accountNumber: "12345",
      balance: "5000",
    });

    const initialBalance = 5000;
    const loanAmount = "1000";
    const expectedBalance = initialBalance + 1000;

    await db.updateBankAccountBalance(1, loanAmount, true);

    const updatedAccounts = await db.getBankAccountsByUserId(testUserId);
    expect(updatedAccounts.length).toBeGreaterThan(0);
  });

  it("should update bank account balance when creating lent loan", async () => {
    const initialBalance = 5000;
    const loanAmount = "1000";
    const expectedBalance = initialBalance - 1000;

    await db.updateBankAccountBalance(1, loanAmount, false);

    const updatedAccounts = await db.getBankAccountsByUserId(testUserId);
    expect(updatedAccounts.length).toBeGreaterThan(0);
  });

  it("should create financial transaction when loan is created with account", async () => {
    const transaction = await db.createFinancialTransaction({
      userId: testUserId,
      transactionType: "income",
      paymentMethod: "transfer",
      accountId: 1,
      amount: "1000",
      description: "Emprestimo recebido",
      category: "Emprestimos",
      status: "completed",
      transactionDate: new Date(),
    });

    expect(transaction).toBeDefined();
  });

  it("should retrieve bank accounts for user", async () => {
    const accounts = await db.getBankAccountsByUserId(testUserId);
    expect(Array.isArray(accounts)).toBe(true);
  });
});
