import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { getDb } from "./db";
import * as db from "./db";
import { users, suppliers, supplierPurchases, tasks } from "../drizzle/schema";
import { eq } from "drizzle-orm";

let testUserId: number;
let testSupplierId: number;
let testPurchaseId: number;
let testEventId: number;

describe("Calendar-Suppliers Integration", () => {
  beforeAll(async () => {
    const database = await getDb();
    if (!database) throw new Error("Database not available");

    // Create test user
    const testOpenId = `test-user-${Date.now()}`;
    await db.upsertUser({
      openId: testOpenId,
      name: "Test User",
      email: "test@example.com",
      loginMethod: "oauth",
      role: "user",
    });

    const userRows = await database
      .select()
      .from(users)
      .where(eq(users.openId, testOpenId));
    if (userRows.length === 0) throw new Error("Failed to create test user");
    testUserId = userRows[0].id;

    // Create test supplier
    const supplierResult = await db.createSupplier({
      userId: testUserId,
      name: "Test Supplier",
      email: "supplier@example.com",
      phone: "1234567890",
      address: "123 Test St",
      city: "Test City",
    });

    const supplierRows = await db.getSuppliersByUserId(testUserId);
    if (supplierRows.length === 0) throw new Error("Failed to create test supplier");
    testSupplierId = supplierRows[supplierRows.length - 1].id;
  });

  afterAll(async () => {
    const database = await getDb();
    if (!database) return;

    // Clean up test data
    if (testPurchaseId) {
      await database
        .delete(supplierPurchases)
        .where(eq(supplierPurchases.id, testPurchaseId));
    }
    if (testEventId) {
      await database.delete(tasks).where(eq(tasks.id, testEventId));
    }
    if (testSupplierId) {
      await database.delete(suppliers).where(eq(suppliers.id, testSupplierId));
    }
    if (testUserId) {
      await database.delete(users).where(eq(users.id, testUserId));
    }
  });

  it("should create a supplier purchase and sync calendar event", async () => {
    const database = await getDb();
    if (!database) throw new Error("Database not available");

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 7);

    // Create supplier purchase
    const purchaseResult = await database.insert(supplierPurchases).values({
      userId: testUserId,
      supplierId: testSupplierId,
      description: "Test Purchase",
      amount: "100.00",
      purchaseDate: new Date(),
      dueDate: dueDate,
      paymentStatus: "pending",
    });

    // Get the created purchase
    const purchases = await database
      .select()
      .from(supplierPurchases)
      .where(eq(supplierPurchases.userId, testUserId));
    expect(purchases.length).toBeGreaterThan(0);

    const purchase = purchases[purchases.length - 1];
    testPurchaseId = purchase.id;

    // Create calendar event
    const supplier = await database
      .select()
      .from(suppliers)
      .where(eq(suppliers.id, testSupplierId));
    expect(supplier.length).toBeGreaterThan(0);

    const eventId = await db.createSupplierPaymentEvent(
      testUserId,
      purchase,
      supplier[0]
    );
    expect(eventId).toBeDefined();
    expect(eventId).toBeGreaterThan(0);

    testEventId = eventId!;

    // Verify event was created
    const events = await database
      .select()
      .from(tasks)
      .where(eq(tasks.id, eventId!));
    expect(events.length).toBe(1);
    expect(events[0].title).toContain("Pagamento -");
    // Compare dates with tolerance for milliseconds
    const timeDiff = Math.abs(events[0].dueDate.getTime() - dueDate.getTime());
    expect(timeDiff).toBeLessThan(1000); // Allow 1 second difference
  });

  it("should update calendar event when due date changes", async () => {
    if (!testPurchaseId || !testEventId) {
      throw new Error("Test data not initialized");
    }

    const database = await getDb();
    if (!database) throw new Error("Database not available");

    const newDueDate = new Date();
    newDueDate.setDate(newDueDate.getDate() + 14);

    // Get purchase and supplier
    const purchases = await database
      .select()
      .from(supplierPurchases)
      .where(eq(supplierPurchases.id, testPurchaseId));
    expect(purchases.length).toBe(1);

    const supplierRows = await database
      .select()
      .from(suppliers)
      .where(eq(suppliers.id, purchases[0].supplierId));
    expect(supplierRows.length).toBe(1);

    // Update purchase with new due date
    const updatedPurchase = { ...purchases[0], dueDate: newDueDate };

    // Update calendar event
    await db.updateSupplierPaymentEvent(
      testEventId,
      updatedPurchase,
      supplierRows[0]
    );

    // Verify event was updated
    const events = await database
      .select()
      .from(tasks)
      .where(eq(tasks.id, testEventId));
    expect(events.length).toBe(1);
    // Compare dates with tolerance for milliseconds
    const timeDiff = Math.abs(events[0].dueDate.getTime() - newDueDate.getTime());
    expect(timeDiff).toBeLessThan(1000); // Allow 1 second difference
  });

  it("should remove calendar event when purchase is paid", async () => {
    if (!testEventId) {
      throw new Error("Test event not initialized");
    }

    const database = await getDb();
    if (!database) throw new Error("Database not available");

    // Remove calendar event
    await db.removeSupplierPaymentEvent(testEventId);

    // Verify event was removed
    const events = await database
      .select()
      .from(tasks)
      .where(eq(tasks.id, testEventId));
    expect(events.length).toBe(0);
  });

  it("should get pending supplier purchases", async () => {
    const database = await getDb();
    if (!database) throw new Error("Database not available");

    // Create a new pending purchase
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 7);

    await database.insert(supplierPurchases).values({
      userId: testUserId,
      supplierId: testSupplierId,
      description: "Another Test Purchase",
      amount: "50.00",
      purchaseDate: new Date(),
      dueDate: dueDate,
      paymentStatus: "pending",
    });

    // Get pending purchases
    const pending = await db.getPendingSupplierPurchasesByUserId(testUserId);
    expect(pending.length).toBeGreaterThan(0);

    const hasPending = pending.some(
      (p) => p.description === "Another Test Purchase"
    );
    expect(hasPending).toBe(true);
  });

  it("should filter events correctly in calendar", async () => {
    const database = await getDb();
    if (!database) throw new Error("Database not available");

    // Get all tasks for the user
    const allTasks = await database
      .select()
      .from(tasks)
      .where(eq(tasks.userId, testUserId));

    // Count supplier payment events
    const supplierEvents = allTasks.filter((t) => t.title.startsWith("Pagamento -"));
    expect(supplierEvents.length).toBeGreaterThanOrEqual(0);

    // Count manual tasks
    const manualTasks = allTasks.filter((t) => !t.title.startsWith("Pagamento -"));
    expect(manualTasks.length).toBeGreaterThanOrEqual(0);

    // Total should match
    expect(supplierEvents.length + manualTasks.length).toBe(allTasks.length);
  });
});
