import { describe, it, expect, beforeAll } from "vitest";
import { getBankAccountsByUserId, createFinancialTransaction } from "./db";

describe("Sales Finalization Flow", () => {
  let testUserId: number;
  let testAccountId: number;

  beforeAll(async () => {
    testUserId = 1;
    
    const accounts = await getBankAccountsByUserId(testUserId);
    if (accounts.length > 0) {
      testAccountId = accounts[0].id;
    } else {
      throw new Error("No bank accounts found for test user");
    }
  });

  it("should create a financial transaction when finalizing a sale", async () => {
    const transactionData = {
      userId: testUserId,
      transactionType: "income" as const,
      paymentMethod: "cash" as const,
      accountId: testAccountId,
      amount: "150.00",
      description: "Venda #120008",
      transactionDate: new Date(),
    };

    const result = await createFinancialTransaction(transactionData);

    expect(result).toBeDefined();
  });

  it("should retrieve bank accounts for a user", async () => {
    const accounts = await getBankAccountsByUserId(testUserId);

    expect(accounts).toBeDefined();
    expect(Array.isArray(accounts)).toBe(true);
    expect(accounts.length).toBeGreaterThan(0);
    
    const account = accounts[0];
    expect(account).toHaveProperty("id");
    expect(account).toHaveProperty("accountName");
    expect(account).toHaveProperty("bankName");
    expect(account).toHaveProperty("balance");
    expect(account.id).toBe(testAccountId);
  });

  it("should have correct account names", async () => {
    const accounts = await getBankAccountsByUserId(testUserId);
    const accountNames = accounts.map(a => a.accountName.toLowerCase());

    expect(accounts.length).toBeGreaterThan(0);
    expect(accountNames.some(name => name.includes("empresa") || name.includes("pessoal"))).toBe(true);
  });
});
