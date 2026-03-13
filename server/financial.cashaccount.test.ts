import { describe, expect, it, beforeAll, afterAll } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import * as db from "./db";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(userId: number = 1): TrpcContext {
  const user: AuthenticatedUser = {
    id: userId,
    openId: `test-user-${userId}`,
    email: `test${userId}@example.com`,
    name: `Test User ${userId}`,
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };

  return ctx;
}

describe("financial.bankAccounts - Cash Account Creation", () => {
  const testUserId = 999;
  let ctx: TrpcContext;

  beforeAll(async () => {
    ctx = createAuthContext(testUserId);
    // Ensure test user exists
    await db.upsertUser({
      openId: ctx.user!.openId,
      name: ctx.user!.name,
      email: ctx.user!.email,
    });
  });

  afterAll(async () => {
    // Clean up test data
    await db.deleteAllUserData(testUserId);
  });

  it("should create a cash account without bankName and accountNumber", async () => {
    const caller = appRouter.createCaller(ctx);

    const result = await caller.financial.bankAccounts.create({
      accountName: "Dinheiro em Mao",
      accountType: "cash",
      balance: "100.00",
    });

    expect(result).toBeDefined();
    expect(result[0]?.insertId).toBeDefined();
  });

  it("should list cash accounts correctly", async () => {
    const caller = appRouter.createCaller(ctx);

    // Create a cash account
    await caller.financial.bankAccounts.create({
      accountName: "Dinheiro Fisico",
      accountType: "cash",
      balance: "50.00",
    });

    // List accounts
    const accounts = await caller.financial.bankAccounts.list();

    expect(accounts).toBeDefined();
    expect(Array.isArray(accounts)).toBe(true);

    // Find cash accounts
    const cashAccounts = accounts.filter((acc: any) => acc.accountType === "cash");
    expect(cashAccounts.length).toBeGreaterThan(0);
    
    // Verify that all cash accounts have no bankName and accountNumber
    cashAccounts.forEach((acc: any) => {
      expect(acc.bankName).toBeNull();
      expect(acc.accountNumber).toBeNull();
    });
  });

  it("should reject non-cash accounts without bankName and accountNumber", async () => {
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.financial.bankAccounts.create({
        accountName: "Conta Corrente",
        accountType: "checking",
        balance: "100.00",
        // Missing bankName and accountNumber
      });
      // If we reach here, the test should fail
      expect.fail("Should have thrown an error");
    } catch (error: any) {
      expect(error.message).toContain("Bank name and account number required");
    }
  });

  it("should create a checking account with bankName and accountNumber", async () => {
    const caller = appRouter.createCaller(ctx);

    const result = await caller.financial.bankAccounts.create({
      accountName: "Conta Corrente Teste",
      bankName: "Banco Teste",
      accountNumber: "123456-7",
      accountType: "checking",
      balance: "200.00",
    });

    expect(result).toBeDefined();
    expect(result[0]?.insertId).toBeDefined();
  });
});
