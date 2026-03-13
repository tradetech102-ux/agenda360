import { describe, it, expect, beforeAll, afterAll } from "vitest";
import * as db from "./db";
import { getDb } from "./db";

describe("CashBox Management", () => {
  const testUserId = 999999; // Use a unique test user ID
  
  beforeAll(async () => {
    // Clean up any existing test data
    const database = await getDb();
    if (database) {
      try {
        // Delete test user's cash box
        await database.execute(`DELETE FROM cashBox WHERE userId = ${testUserId}`);
        // Delete test user's financial transactions
        await database.execute(`DELETE FROM financialTransactions WHERE userId = ${testUserId}`);
      } catch (error) {
        console.log("Cleanup note:", error);
      }
    }
  });

  afterAll(async () => {
    // Clean up test data
    const database = await getDb();
    if (database) {
      try {
        await database.execute(`DELETE FROM cashBox WHERE userId = ${testUserId}`);
        await database.execute(`DELETE FROM financialTransactions WHERE userId = ${testUserId}`);
      } catch (error) {
        console.log("Cleanup note:", error);
      }
    }
  });

  it("should create a new cash box for a user", async () => {
    const cashBox = await db.getCashBox(testUserId);
    
    expect(cashBox).toBeDefined();
    expect(cashBox?.userId).toBe(testUserId);
    expect(parseFloat(String(cashBox?.balance || 0))).toBe(0);
    expect(cashBox?.currency).toBe("BRL");
  });

  it("should return existing cash box if already created", async () => {
    const cashBox1 = await db.getCashBox(testUserId);
    const cashBox2 = await db.getCashBox(testUserId);
    
    expect(cashBox1?.id).toBe(cashBox2?.id);
    expect(cashBox1?.userId).toBe(cashBox2?.userId);
  });

  it("should update cash box balance with positive amount", async () => {
    await db.updateCashBoxBalance(testUserId, 100);
    
    const balance = await db.getCashBoxBalance(testUserId);
    expect(balance).toBe(100);
  });

  it("should update cash box balance with negative amount", async () => {
    // Start with 100
    await db.updateCashBoxBalance(testUserId, -30);
    
    const balance = await db.getCashBoxBalance(testUserId);
    expect(balance).toBe(70);
  });

  it("should accumulate multiple balance updates", async () => {
    // Current balance: 70
    await db.updateCashBoxBalance(testUserId, 50);
    
    const balance = await db.getCashBoxBalance(testUserId);
    expect(balance).toBe(120);
  });

  it("should get cash box balance correctly", async () => {
    const balance = await db.getCashBoxBalance(testUserId);
    
    expect(typeof balance).toBe("number");
    expect(balance).toBe(120);
  });

  it("should return 0 for non-existent user initially", async () => {
    const nonExistentUserId = 888888;
    const balance = await db.getCashBoxBalance(nonExistentUserId);
    
    // First call creates the cash box with 0 balance
    expect(balance).toBe(0);
  });

  it("should handle string and number amounts in updateCashBoxBalance", async () => {
    const testUserId2 = 777777;
    
    // Test with string amount
    await db.updateCashBoxBalance(testUserId2, "50.50");
    let balance = await db.getCashBoxBalance(testUserId2);
    expect(balance).toBe(50.50);
    
    // Test with number amount
    await db.updateCashBoxBalance(testUserId2, 25.75);
    balance = await db.getCashBoxBalance(testUserId2);
    expect(balance).toBe(76.25);
    
    // Cleanup
    const database = await getDb();
    if (database) {
      try {
        await database.execute(`DELETE FROM cashBox WHERE userId = ${testUserId2}`);
      } catch (error) {
        console.log("Cleanup note:", error);
      }
    }
  });

  it("should integrate with financial transactions for cash payments", async () => {
    const testUserId3 = 666666;
    
    // Create a financial transaction with cash payment
    const transaction = await db.createFinancialTransaction({
      userId: testUserId3,
      transactionType: "income",
      paymentMethod: "cash",
      amount: "250.00",
      description: "Test cash income",
      transactionDate: new Date(),
    });
    
    // Check that cash box was updated
    const balance = await db.getCashBoxBalance(testUserId3);
    expect(balance).toBe(250);
    
    // Cleanup
    const database = await getDb();
    if (database) {
      try {
        await database.execute(`DELETE FROM cashBox WHERE userId = ${testUserId3}`);
        await database.execute(`DELETE FROM financialTransactions WHERE userId = ${testUserId3}`);
      } catch (error) {
        console.log("Cleanup note:", error);
      }
    }
  });

  it("should handle cash expense transactions", async () => {
    const testUserId4 = 555555;
    
    // Create an income transaction first
    await db.createFinancialTransaction({
      userId: testUserId4,
      transactionType: "income",
      paymentMethod: "cash",
      amount: "500.00",
      description: "Initial cash",
      transactionDate: new Date(),
    });
    
    // Create an expense transaction
    await db.createFinancialTransaction({
      userId: testUserId4,
      transactionType: "expense",
      paymentMethod: "cash",
      amount: "150.00",
      description: "Cash expense",
      transactionDate: new Date(),
    });
    
    // Check that cash box reflects both transactions
    const balance = await db.getCashBoxBalance(testUserId4);
    expect(balance).toBe(350); // 500 - 150
    
    // Cleanup
    const database = await getDb();
    if (database) {
      try {
        await database.execute(`DELETE FROM cashBox WHERE userId = ${testUserId4}`);
        await database.execute(`DELETE FROM financialTransactions WHERE userId = ${testUserId4}`);
      } catch (error) {
        console.log("Cleanup note:", error);
      }
    }
  });
});
