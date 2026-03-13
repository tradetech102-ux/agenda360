import { describe, it, expect, beforeAll, afterAll } from "vitest";
import * as db from "./db";

describe("Dashboard Statistics", () => {
  const testUserId = 999;
  const testTeamId = 999;

  beforeAll(async () => {
    // Setup: Create test data
    // This would normally be done via database setup
  });

  afterAll(async () => {
    // Cleanup: Remove test data
  });

  it("should get tasks statistics", async () => {
    const stats = await db.getTasksStatistics(testUserId);
    expect(stats).toBeDefined();
    expect(stats).toHaveProperty("total");
    expect(stats).toHaveProperty("completed");
    expect(stats).toHaveProperty("pending");
    expect(stats).toHaveProperty("inProgress");
    expect(typeof stats.total).toBe("number");
    expect(typeof stats.completed).toBe("number");
    expect(typeof stats.pending).toBe("number");
    expect(typeof stats.inProgress).toBe("number");
  });

  it("should get tasks completed by week", async () => {
    const weeklyData = await db.getTasksCompletedByWeek(testUserId);
    expect(Array.isArray(weeklyData)).toBe(true);
    
    if (weeklyData.length > 0) {
      expect(weeklyData[0]).toHaveProperty("week");
      expect(weeklyData[0]).toHaveProperty("completed");
      expect(typeof weeklyData[0].week).toBe("string");
      expect(typeof weeklyData[0].completed).toBe("number");
    }
  });

  it("should get member productivity", async () => {
    const productivity = await db.getMemberProductivity(testTeamId);
    expect(Array.isArray(productivity)).toBe(true);
    
    if (productivity.length > 0) {
      expect(productivity[0]).toHaveProperty("userId");
      expect(productivity[0]).toHaveProperty("completed");
      expect(productivity[0]).toHaveProperty("pending");
      expect(productivity[0]).toHaveProperty("inProgress");
    }
  });

  it("should get financial summary", async () => {
    const summary = await db.getFinancialSummary(testUserId);
    expect(summary).toBeDefined();
    expect(summary).toHaveProperty("income");
    expect(summary).toHaveProperty("expense");
    expect(summary).toHaveProperty("balance");
    expect(typeof summary.income).toBe("number");
    expect(typeof summary.expense).toBe("number");
    expect(typeof summary.balance).toBe("number");
  });

  it("should calculate balance correctly", async () => {
    const summary = await db.getFinancialSummary(testUserId);
    const calculatedBalance = summary.income - summary.expense;
    expect(summary.balance).toBe(calculatedBalance);
  });
});
