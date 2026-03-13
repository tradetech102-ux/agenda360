import { describe, it, expect, beforeEach } from "vitest";
import * as db from "./db";

describe("Partial Loan Payment with Interest Recalculation", () => {
  beforeEach(async () => {
    // Clear test data
    const testDb = await db.getDb();
    if (testDb) {
      // Clean up test loans
      await testDb.execute(
        `DELETE FROM loanInstallments WHERE loanId IN (SELECT id FROM loans WHERE clientId = 9999)`
      );
      await testDb.execute(
        `DELETE FROM loans WHERE clientId = 9999`
      );
    }
  });

  it("should create new installment with recalculated interest for partial payment", async () => {
    // Create a test loan
    const loanId = 1;
    const installmentId = 1;
    const paidAmount = 50; // Pay only R$ 50 of R$ 110
    const interestRate = 10; // 10%

    // Simulate: Original installment has R$ 110 (R$ 100 principal + R$ 10 interest)
    // After partial payment of R$ 50:
    // - Remaining: R$ 60
    // - New interest: R$ 60 * 10% = R$ 6
    // - New total: R$ 66

    const result = await db.handlePartialLoanPayment({
      loanId,
      installmentId,
      paidAmount,
      interestRate,
    });

    expect(result).toBeDefined();
    expect(result?.remainingBalance).toBe(60);
    expect(result?.interestAmount).toBe(6);
    expect(result?.newAmount).toBe(66);
    expect(result?.newInstallmentId).toBeGreaterThan(0);
  });

  it("should handle full payment correctly", async () => {
    const loanId = 1;
    const installmentId = 1;
    const paidAmount = 110; // Pay full amount
    const interestRate = 10;

    const result = await db.handlePartialLoanPayment({
      loanId,
      installmentId,
      paidAmount,
      interestRate,
    });

    // Should return null for full payment
    expect(result).toBeNull();
  });

  it("should calculate correct interest for different rates", async () => {
    const testCases = [
      { paidAmount: 50, interestRate: 10, expectedInterest: 6, expectedTotal: 66 },
      { paidAmount: 50, interestRate: 20, expectedInterest: 12, expectedTotal: 72 },
      { paidAmount: 50, interestRate: 5, expectedInterest: 3, expectedTotal: 53 },
      { paidAmount: 75, interestRate: 10, expectedInterest: 3.5, expectedTotal: 38.5 },
    ];

    for (const testCase of testCases) {
      const result = await db.handlePartialLoanPayment({
        loanId: 1,
        installmentId: 1,
        paidAmount: testCase.paidAmount,
        interestRate: testCase.interestRate,
      });

      if (result) {
        expect(result.remainingBalance).toBe(110 - testCase.paidAmount);
        expect(result.interestAmount).toBeCloseTo(testCase.expectedInterest, 1);
        expect(result.newAmount).toBeCloseTo(testCase.expectedTotal, 1);
      }
    }
  });

  it("should create new installment with next month due date", async () => {
    const result = await db.handlePartialLoanPayment({
      loanId: 1,
      installmentId: 1,
      paidAmount: 50,
      interestRate: 10,
    });

    if (result) {
      expect(result.newDueDate).toBeDefined();
      // New due date should be approximately 1 month from now
      const now = new Date();
      const expectedMonth = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());
      
      const diffInDays = Math.abs(
        (result.newDueDate.getTime() - expectedMonth.getTime()) / (1000 * 60 * 60 * 24)
      );
      
      expect(diffInDays).toBeLessThan(2); // Allow 1-2 day difference
    }
  });
});
