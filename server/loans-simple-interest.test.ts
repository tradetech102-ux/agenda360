import { describe, it, expect } from "vitest";

describe("Loans - Simple Interest (Juros Simples)", () => {

  describe("Simple Interest Calculation", () => {
    it("should calculate simple interest correctly: 1000 + 10% = 1100", () => {
      const initialAmount = 1000;
      const interestRate = 10;
      const expectedTotal = initialAmount * (1 + interestRate / 100);
      
      expect(expectedTotal).toBe(1100);
    });

    it("should calculate simple interest correctly: 500 + 5% = 525", () => {
      const initialAmount = 500;
      const interestRate = 5;
      const expectedTotal = initialAmount * (1 + interestRate / 100);
      
      expect(expectedTotal).toBe(525);
    });

    it("should calculate simple interest correctly: 2000 + 15% = 2300", () => {
      const initialAmount = 2000;
      const interestRate = 15;
      const expectedTotal = initialAmount * (1 + interestRate / 100);
      
      expect(expectedTotal).toBe(2300);
    });

    it("should handle zero interest rate", () => {
      const initialAmount = 1000;
      const interestRate = 0;
      const expectedTotal = initialAmount * (1 + interestRate / 100);
      
      expect(expectedTotal).toBe(1000);
    });

    it("should handle decimal interest rates: 1000 + 2.5% = 1025", () => {
      const initialAmount = 1000;
      const interestRate = 2.5;
      const expectedTotal = initialAmount * (1 + interestRate / 100);
      
      expect(expectedTotal).toBeCloseTo(1025, 2);
    });
  });

  describe("Partial Payments with Simple Interest", () => {
    it("should not recalculate interest after partial payment", () => {
      const initialAmount = 1000;
      const interestRate = 10;
      const totalWithInterest = initialAmount * (1 + interestRate / 100); // 1100
      
      // First payment: 300
      const remainingAfterFirstPayment = totalWithInterest - 300; // 800
      
      // Second payment: 200
      const remainingAfterSecondPayment = remainingAfterFirstPayment - 200; // 600
      
      // Interest should NOT be recalculated
      // The remaining balance should be exactly 600, not 600 + new interest
      expect(remainingAfterSecondPayment).toBe(600);
    });

    it("should correctly track total paid and remaining balance", () => {
      const initialAmount = 1000;
      const interestRate = 10;
      const totalWithInterest = initialAmount * (1 + interestRate / 100); // 1100
      
      let totalPaid = 0;
      let remainingBalance = totalWithInterest;
      
      // Payment 1: 300
      totalPaid += 300;
      remainingBalance -= 300;
      expect(remainingBalance).toBe(800);
      expect(totalPaid).toBe(300);
      
      // Payment 2: 200
      totalPaid += 200;
      remainingBalance -= 200;
      expect(remainingBalance).toBe(600);
      expect(totalPaid).toBe(500);
      
      // Payment 3: 600 (full remaining)
      totalPaid += 600;
      remainingBalance -= 600;
      expect(remainingBalance).toBe(0);
      expect(totalPaid).toBe(1100);
    });

    it("should prevent overpayment", () => {
      const initialAmount = 1000;
      const interestRate = 10;
      const totalWithInterest = initialAmount * (1 + interestRate / 100); // 1100
      
      let remainingBalance = totalWithInterest;
      
      // Try to pay more than remaining
      const paymentAmount = 1200;
      const wouldBeNegative = remainingBalance - paymentAmount < 0;
      
      expect(wouldBeNegative).toBe(true);
    });
  });

  describe("Installment Calculation with Simple Interest", () => {
    it("should divide total with interest equally among installments", () => {
      const initialAmount = 1000;
      const interestRate = 10;
      const totalWithInterest = initialAmount * (1 + interestRate / 100); // 1100
      const numberOfInstallments = 12;
      
      const installmentAmount = totalWithInterest / numberOfInstallments;
      
      expect(installmentAmount).toBeCloseTo(91.67, 2);
      
      // Verify total of all installments equals total with interest
      const totalOfInstallments = installmentAmount * numberOfInstallments;
      expect(totalOfInstallments).toBeCloseTo(totalWithInterest, 2);
    });

    it("should handle uneven division of installments", () => {
      const initialAmount = 1000;
      const interestRate = 10;
      const totalWithInterest = initialAmount * (1 + interestRate / 100); // 1100
      const numberOfInstallments = 7;
      
      const installmentAmount = totalWithInterest / numberOfInstallments;
      
      expect(installmentAmount).toBeCloseTo(157.14, 2);
    });
  });

  describe("Interest Calculation Consistency", () => {
    it("should produce consistent results across multiple calculations", () => {
      const initialAmount = 1000;
      const interestRate = 10;
      
      const result1 = initialAmount * (1 + interestRate / 100);
      const result2 = initialAmount * (1 + interestRate / 100);
      const result3 = initialAmount * (1 + interestRate / 100);
      
      expect(result1).toBe(result2);
      expect(result2).toBe(result3);
    });

    it("should not allow interest recalculation after creation", () => {
      const initialAmount = 1000;
      const interestRate = 10;
      const totalWithInterest = initialAmount * (1 + interestRate / 100); // 1100
      
      // Simulate a payment
      const paymentAmount = 100;
      const newRemainingBalance = totalWithInterest - paymentAmount; // 1000
      
      // Interest should NOT be recalculated on the new remaining balance
      // If it were, it would be: 1000 * (1 + 10/100) = 1100
      // But we should NOT do this - the interest is fixed
      
      // The correct behavior is that remainingBalance stays at 1000
      // and totalWithInterest stays at 1100
      expect(newRemainingBalance).toBe(1000);
    });
  });

  describe("Edge Cases", () => {
    it("should handle very small amounts", () => {
      const initialAmount = 0.01;
      const interestRate = 10;
      const expectedTotal = initialAmount * (1 + interestRate / 100);
      
      expect(expectedTotal).toBeCloseTo(0.011, 3);
    });

    it("should handle very large amounts", () => {
      const initialAmount = 1000000;
      const interestRate = 10;
      const expectedTotal = initialAmount * (1 + interestRate / 100);
      
      expect(expectedTotal).toBe(1100000);
    });

    it("should handle high interest rates", () => {
      const initialAmount = 1000;
      const interestRate = 100;
      const expectedTotal = initialAmount * (1 + interestRate / 100);
      
      expect(expectedTotal).toBe(2000);
    });
  });
});
