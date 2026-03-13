// server/_core/index.ts
import "dotenv/config";
import express2 from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";

// shared/const.ts
var COOKIE_NAME = "app_session_id";
var ONE_YEAR_MS = 1e3 * 60 * 60 * 24 * 365;
var AXIOS_TIMEOUT_MS = 3e4;
var UNAUTHED_ERR_MSG = "Please login (10001)";
var NOT_ADMIN_ERR_MSG = "You do not have required permission (10002)";

// server/db.ts
import { eq, and, desc, count } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";

// drizzle/schema.ts
import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal, boolean, datetime } from "drizzle-orm/mysql-core";
var users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull()
});
var clients = mysqlTable("clients", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 20 }),
  address: text("address"),
  city: varchar("city", { length: 100 }),
  state: varchar("state", { length: 50 }),
  zipCode: varchar("zipCode", { length: 20 }),
  cpfCnpj: varchar("cpfCnpj", { length: 20 }).unique(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});
var products = mysqlTable("products", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  code: varchar("code", { length: 100 }).unique(),
  description: text("description"),
  sku: varchar("sku", { length: 100 }).unique(),
  supplierId: int("supplierId"),
  measure: varchar("measure", { length: 50 }),
  unit: varchar("unit", { length: 50 }),
  weight: decimal("weight", { precision: 10, scale: 3 }),
  cost: decimal("cost", { precision: 10, scale: 2 }).notNull(),
  markup: decimal("markup", { precision: 5, scale: 2 }).default("0"),
  marginPercentage: decimal("marginPercentage", { precision: 5, scale: 2 }).default("0"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  quantity: int("quantity").default(0).notNull(),
  category: varchar("category", { length: 100 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});
var productOutputHistory = mysqlTable("productOutputHistory", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  productId: int("productId").notNull(),
  quantity: int("quantity").notNull(),
  clientId: int("clientId"),
  outputDate: datetime("outputDate").notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull()
});
var suppliers = mysqlTable("suppliers", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 20 }),
  address: text("address"),
  city: varchar("city", { length: 100 }),
  state: varchar("state", { length: 50 }),
  zipCode: varchar("zipCode", { length: 20 }),
  cnpj: varchar("cnpj", { length: 20 }).unique(),
  paymentTerms: varchar("paymentTerms", { length: 100 }),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});
var sales = mysqlTable("sales", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  clientId: int("clientId").notNull(),
  productId: int("productId"),
  quantity: int("quantity").notNull(),
  unitPrice: decimal("unitPrice", { precision: 10, scale: 2 }).notNull(),
  totalPrice: decimal("totalPrice", { precision: 10, scale: 2 }).notNull(),
  discount: decimal("discount", { precision: 10, scale: 2 }).default("0"),
  paymentMethod: varchar("paymentMethod", { length: 50 }),
  paymentStatus: mysqlEnum("paymentStatus", ["pending", "paid", "cancelled"]).default("pending"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});
var financialRecords = mysqlTable("financialRecords", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  type: mysqlEnum("type", ["income", "expense"]).notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  description: text("description"),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  paymentMethod: varchar("paymentMethod", { length: 50 }),
  status: mysqlEnum("status", ["pending", "completed", "cancelled"]).default("pending"),
  dueDate: datetime("dueDate"),
  paidDate: datetime("paidDate"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});
var tasks = mysqlTable("tasks", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  dueDate: datetime("dueDate").notNull(),
  completed: boolean("completed").default(false),
  priority: mysqlEnum("priority", ["low", "medium", "high"]).default("medium"),
  assignedTo: int("assignedTo"),
  clientId: int("clientId"),
  actionType: mysqlEnum("actionType", ["reuniao", "visita", "trabalho"]),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});
var teams = mysqlTable("teams", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  members: text("members"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});
var supplierPurchases = mysqlTable("supplierPurchases", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  supplierId: int("supplierId").notNull(),
  description: text("description").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  purchaseDate: datetime("purchaseDate").notNull(),
  dueDate: datetime("dueDate").notNull(),
  paymentStatus: mysqlEnum("paymentStatus", ["pending", "paid", "cancelled"]).default("pending"),
  paidDate: datetime("paidDate"),
  notes: text("notes"),
  calendarEventId: int("calendarEventId"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});
var subscriptions = mysqlTable("subscriptions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  plan: mysqlEnum("plan", ["free", "basic", "pro", "enterprise"]).default("free"),
  status: mysqlEnum("status", ["active", "cancelled", "expired"]).default("active"),
  stripeCustomerId: varchar("stripeCustomerId", { length: 255 }),
  stripeSubscriptionId: varchar("stripeSubscriptionId", { length: 255 }),
  startDate: datetime("startDate").notNull(),
  endDate: datetime("endDate"),
  renewalDate: datetime("renewalDate"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});
var bankAccounts = mysqlTable("bankAccounts", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  accountName: varchar("accountName", { length: 255 }).notNull(),
  bankName: varchar("bankName", { length: 255 }),
  accountNumber: varchar("accountNumber", { length: 50 }),
  accountType: mysqlEnum("accountType", ["checking", "savings", "investment", "cash"]).default("checking"),
  balance: decimal("balance", { precision: 12, scale: 2 }).default("0"),
  currency: varchar("currency", { length: 3 }).default("BRL"),
  isActive: boolean("isActive").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});
var digitalWallets = mysqlTable("digitalWallets", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  walletName: varchar("walletName", { length: 255 }).notNull(),
  walletType: mysqlEnum("walletType", ["pix", "paypal", "stripe", "other"]).notNull(),
  balance: decimal("balance", { precision: 12, scale: 2 }).default("0"),
  currency: varchar("currency", { length: 3 }).default("BRL"),
  isActive: boolean("isActive").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});
var creditCards = mysqlTable("creditCards", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  cardName: varchar("cardName", { length: 255 }).notNull(),
  cardBrand: mysqlEnum("cardBrand", ["visa", "mastercard", "amex", "elo", "other"]).notNull(),
  cardNumber: varchar("cardNumber", { length: 20 }).notNull(),
  cardHolder: varchar("cardHolder", { length: 255 }).notNull(),
  expiryMonth: int("expiryMonth"),
  expiryYear: int("expiryYear"),
  cvv: varchar("cvv", { length: 4 }),
  creditLimit: decimal("creditLimit", { precision: 12, scale: 2 }).default("0"),
  currentBalance: decimal("currentBalance", { precision: 12, scale: 2 }).default("0"),
  dueDay: int("dueDay").default(10),
  isActive: boolean("isActive").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});
var financialTransactions = mysqlTable("financialTransactions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  transactionType: mysqlEnum("transactionType", ["income", "expense"]).notNull(),
  paymentMethod: mysqlEnum("paymentMethod", ["cash", "pix", "debit", "credit", "transfer"]).notNull(),
  accountId: int("accountId"),
  walletId: int("walletId"),
  creditCardId: int("creditCardId"),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  description: text("description"),
  category: varchar("category", { length: 100 }),
  clientId: int("clientId"),
  supplierId: int("supplierId"),
  productId: int("productId"),
  installments: int("installments").default(1),
  currentInstallment: int("currentInstallment").default(1),
  status: mysqlEnum("status", ["pending", "completed", "cancelled"]).default("pending"),
  transactionDate: datetime("transactionDate").notNull(),
  dueDate: datetime("dueDate"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});
var installmentPlans = mysqlTable("installmentPlans", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  transactionId: int("transactionId").notNull(),
  creditCardId: int("creditCardId").notNull(),
  totalAmount: decimal("totalAmount", { precision: 12, scale: 2 }).notNull(),
  installmentAmount: decimal("installmentAmount", { precision: 12, scale: 2 }).notNull(),
  totalInstallments: int("totalInstallments").notNull(),
  currentInstallment: int("currentInstallment").default(1),
  interestRate: decimal("interestRate", { precision: 5, scale: 2 }).default("0"),
  status: mysqlEnum("status", ["active", "completed", "cancelled"]).default("active"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});
var loans = mysqlTable("loans", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  clientId: int("clientId").notNull(),
  accountId: int("accountId"),
  // Conta bancária associada
  type: mysqlEnum("type", ["lent", "borrowed"]).notNull(),
  // "Emprestei dinheiro" or "Peguei empréstimo"
  initialAmount: decimal("initialAmount", { precision: 12, scale: 2 }).notNull(),
  interestRate: decimal("interestRate", { precision: 5, scale: 2 }).default("0"),
  // Taxa de juros em %
  isInstallment: boolean("isInstallment").default(false),
  // Parcelado ou não
  numberOfInstallments: int("numberOfInstallments"),
  // Número de parcelas (se parcelado)
  frequency: varchar("frequency", { length: 50 }).default("monthly"),
  // Frequência (mensal)
  totalWithInterest: decimal("totalWithInterest", { precision: 12, scale: 2 }),
  // Total com juros
  totalPaid: decimal("totalPaid", { precision: 12, scale: 2 }).default("0"),
  remainingBalance: decimal("remainingBalance", { precision: 12, scale: 2 }),
  status: mysqlEnum("status", ["active", "completed", "overdue"]).default("active"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});
var loanInstallments = mysqlTable("loanInstallments", {
  id: int("id").autoincrement().primaryKey(),
  loanId: int("loanId").notNull(),
  installmentNumber: int("installmentNumber").notNull(),
  dueDate: timestamp("dueDate").notNull(),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  paidAmount: decimal("paidAmount", { precision: 12, scale: 2 }).default("0"),
  status: mysqlEnum("status", ["pending", "paid", "partially_paid", "overdue"]).default("pending"),
  paidAt: timestamp("paidAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});
var loanPayments = mysqlTable("loanPayments", {
  id: int("id").autoincrement().primaryKey(),
  loanId: int("loanId").notNull(),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  paymentType: mysqlEnum("paymentType", ["full", "partial"]).notNull(),
  paymentDate: timestamp("paymentDate").defaultNow().notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});
var teamMembers = mysqlTable("teamMembers", {
  id: int("id").autoincrement().primaryKey(),
  teamId: int("teamId").notNull(),
  userId: int("userId").notNull(),
  role: mysqlEnum("memberRole", ["admin", "member"]).default("member").notNull(),
  joinedAt: timestamp("joinedAt").defaultNow().notNull()
});
var teamTasks = mysqlTable("teamTasks", {
  id: int("id").autoincrement().primaryKey(),
  teamId: int("teamId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  assignedTo: int("assignedTo").notNull(),
  startDate: timestamp("startDate"),
  dueDate: timestamp("dueDate").notNull(),
  status: mysqlEnum("taskStatus", ["pending", "in_progress", "completed"]).default("pending").notNull(),
  createdBy: int("createdBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});
var teamMessages = mysqlTable("teamMessages", {
  id: int("id").autoincrement().primaryKey(),
  teamId: int("teamId").notNull(),
  userId: int("userId").notNull(),
  message: text("message").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull()
});
var notifications = mysqlTable("notifications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  notificationType: mysqlEnum("notificationType", ["task_assigned", "task_due", "task_completed", "message", "team_invite"]).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  relatedId: int("relatedId"),
  // Task ID, Message ID, etc
  read: boolean("read").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull()
});
var salesOrders = mysqlTable("salesOrders", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  clientId: int("clientId"),
  // Optional - customer can be anonymous
  sellerId: int("sellerId"),
  // Optional - who made the sale
  subtotal: decimal("subtotal", { precision: 12, scale: 2 }).notNull(),
  discount: decimal("discount", { precision: 12, scale: 2 }).default("0"),
  discountType: mysqlEnum("discountType", ["percentage", "fixed"]).default("fixed"),
  total: decimal("total", { precision: 12, scale: 2 }).notNull(),
  paymentMethod: mysqlEnum("paymentMethod", ["cash", "card", "pix", "check", "mixed"]).notNull(),
  amountPaid: decimal("amountPaid", { precision: 12, scale: 2 }).notNull(),
  change: decimal("change", { precision: 12, scale: 2 }).default("0"),
  paymentStatus: mysqlEnum("paymentStatus", ["pending", "paid", "cancelled"]).default("paid"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});
var salesOrderItems = mysqlTable("salesOrderItems", {
  id: int("id").autoincrement().primaryKey(),
  salesOrderId: int("salesOrderId").notNull(),
  productId: int("productId").notNull(),
  quantity: int("quantity").notNull(),
  unitPrice: decimal("unitPrice", { precision: 10, scale: 2 }).notNull(),
  discount: decimal("discount", { precision: 10, scale: 2 }).default("0"),
  discountType: mysqlEnum("discountType", ["percentage", "fixed"]).default("fixed"),
  subtotal: decimal("subtotal", { precision: 12, scale: 2 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull()
});
var productFavorites = mysqlTable("productFavorites", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  productId: int("productId").notNull(),
  position: int("position").default(0),
  // For ordering in the grid
  createdAt: timestamp("createdAt").defaultNow().notNull()
});
var cashBox = mysqlTable("cashBox", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  balance: decimal("balance", { precision: 12, scale: 2 }).default("0"),
  currency: varchar("currency", { length: 3 }).default("BRL"),
  lastUpdated: timestamp("lastUpdated").defaultNow().onUpdateNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull()
});
var expenseCategories = mysqlTable("expenseCategories", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  nameLower: varchar("nameLower", { length: 100 }).notNull(),
  // For case-insensitive duplicate checking
  icon: varchar("icon", { length: 50 }).default("tag"),
  // Icon name for UI
  color: varchar("color", { length: 7 }).default("#7c3aed"),
  // Hex color code
  usageCount: int("usageCount").default(0),
  // Track how many times this category is used
  isDefault: boolean("isDefault").default(false),
  // Mark default categories
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});

// server/_core/env.ts
var ENV = {
  appId: process.env.VITE_APP_ID ?? "",
  cookieSecret: process.env.JWT_SECRET ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
  oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  isProduction: process.env.NODE_ENV === "production",
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? ""
};

// server/db.ts
var _db = null;
async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}
async function upsertUser(user) {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }
  try {
    const values = {
      openId: user.openId
    };
    const updateSet = {};
    const textFields = ["name", "email", "loginMethod"];
    const assignNullable = (field) => {
      const value = user[field];
      if (value === void 0) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };
    textFields.forEach(assignNullable);
    if (user.lastSignedIn !== void 0) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== void 0) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }
    if (!values.lastSignedIn) {
      values.lastSignedIn = /* @__PURE__ */ new Date();
    }
    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = /* @__PURE__ */ new Date();
    }
    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}
async function getUserByOpenId(openId) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return void 0;
  }
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : void 0;
}
async function getClientsByUserId(userId) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(clients).where(eq(clients.userId, userId));
}
async function createClient(data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(clients).values(data);
  return result;
}
async function updateClient(id, data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(clients).set(data).where(eq(clients.id, id));
}
async function deleteClient(id) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(clients).where(eq(clients.id, id));
}
async function getProductsByUserId(userId) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(products).where(eq(products.userId, userId));
}
async function createProduct(data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(products).values(data);
}
async function updateProduct(id, data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(products).set(data).where(eq(products.id, id));
}
async function deleteProduct(id) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(products).where(eq(products.id, id));
}
async function getSuppliersByUserId(userId) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(suppliers).where(eq(suppliers.userId, userId));
}
async function createSupplier(data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(suppliers).values(data);
}
async function updateSupplier(id, data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(suppliers).set(data).where(eq(suppliers.id, id));
}
async function deleteSupplier(id) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(suppliers).where(eq(suppliers.id, id));
}
async function getSupplierById(id) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(suppliers).where(eq(suppliers.id, id));
  return result.length > 0 ? result[0] : null;
}
async function getSalesByUserId(userId) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(sales).where(eq(sales.userId, userId));
}
async function createSale(data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(sales).values(data);
  let saleId;
  if (Array.isArray(result) && result.length > 0) {
    saleId = result[0].insertId;
  } else if (typeof result === "object" && result !== null) {
    saleId = result.insertId;
  }
  if (!saleId || isNaN(saleId)) {
    console.error("[Database] Failed to get sale ID from result:", result);
    throw new Error("Failed to create sale - invalid ID");
  }
  return { id: saleId, ...data };
}
async function updateSale(id, data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(sales).set(data).where(eq(sales.id, id));
}
async function deleteSale(id) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(sales).where(eq(sales.id, id));
}
async function createFinancialRecord(data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(financialRecords).values(data);
}
async function updateFinancialRecord(id, data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(financialRecords).set(data).where(eq(financialRecords.id, id));
}
async function deleteFinancialRecord(id) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(financialRecords).where(eq(financialRecords.id, id));
}
async function getTasksByUserId(userId) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(tasks).where(eq(tasks.userId, userId));
}
async function createTask(data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(tasks).values(data);
}
async function updateTask(id, data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(tasks).set(data).where(eq(tasks.id, id));
}
async function deleteTask(id) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(tasks).where(eq(tasks.id, id));
}
async function getTeamsByUserId(userId) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(teams).where(eq(teams.userId, userId));
}
async function createTeam(data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(teams).values(data);
}
async function updateTeam(id, data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(teams).set(data).where(eq(teams.id, id));
}
async function deleteTeam(id) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(teams).where(eq(teams.id, id));
}
async function getSupplierPurchasesByUserId(userId) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(supplierPurchases).where(eq(supplierPurchases.userId, userId));
}
async function createSupplierPurchase(data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(supplierPurchases).values(data);
  const result = await db.select().from(supplierPurchases).where(eq(supplierPurchases.userId, data.userId)).orderBy(desc(supplierPurchases.id)).limit(1);
  return result.length > 0 ? result[0] : null;
}
async function updateSupplierPurchase(id, data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(supplierPurchases).set(data).where(eq(supplierPurchases.id, id));
}
async function deleteSupplierPurchase(id) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(supplierPurchases).where(eq(supplierPurchases.id, id));
}
async function getSupplierPurchaseById(id) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(supplierPurchases).where(eq(supplierPurchases.id, id));
  return result.length > 0 ? result[0] : null;
}
async function getPendingSupplierPurchasesByUserId(userId) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(supplierPurchases).where(
    and(eq(supplierPurchases.userId, userId), eq(supplierPurchases.paymentStatus, "pending"))
  );
}
async function createSupplierPaymentEvent(userId, purchase, supplier) {
  console.log(`[SupplierPaymentEvent] Creating event for purchase ${purchase.id} with dueDate ${purchase.dueDate}`);
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  try {
    const uniqueMarker = `supplier-${purchase.id}-${Date.now()}`;
    await db.insert(tasks).values({
      userId,
      title: `Pagamento - ${supplier.name}`,
      description: `Valor: R$ ${purchase.amount}
Fornecedor: ${supplier.name}
Compra: ${purchase.description}
Marker: ${uniqueMarker}`,
      dueDate: purchase.dueDate,
      completed: false,
      priority: "high"
    });
    const insertedTasks = await db.select({ id: tasks.id }).from(tasks).where(
      and(
        eq(tasks.userId, userId),
        eq(tasks.title, `Pagamento - ${supplier.name}`)
      )
    ).orderBy(desc(tasks.id)).limit(1);
    if (insertedTasks.length > 0) {
      const eventId = insertedTasks[0].id;
      await db.update(supplierPurchases).set({ calendarEventId: eventId }).where(eq(supplierPurchases.id, purchase.id));
      console.log(`[SupplierPaymentEvent] Created event ${eventId} for purchase ${purchase.id}`);
      return eventId;
    }
  } catch (error) {
    console.error("[SupplierPaymentEvent] Error creating calendar event:", error);
  }
  return null;
}
async function updateSupplierPaymentEvent(eventId, purchase, supplier) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(tasks).set({
    dueDate: purchase.dueDate,
    description: `Valor: R$ ${purchase.amount}
Fornecedor: ${supplier.name}
Compra: ${purchase.description}`
  }).where(eq(tasks.id, eventId));
}
async function removeSupplierPaymentEvent(eventId) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(tasks).where(eq(tasks.id, eventId));
}
async function getDashboardMetrics(userId) {
  const db = await getDb();
  if (!db) return null;
  try {
    const totalClients = (await db.select().from(clients).where(eq(clients.userId, userId))).length;
    const totalProducts = (await db.select().from(products).where(eq(products.userId, userId))).length;
    const totalSales = (await db.select().from(sales).where(eq(sales.userId, userId))).length;
    const salesData = await db.select().from(sales).where(eq(sales.userId, userId));
    const totalRevenue = salesData.reduce((sum, sale) => sum + parseFloat(sale.totalPrice), 0);
    const financialData = await db.select().from(financialRecords).where(eq(financialRecords.userId, userId));
    const totalIncome = financialData.filter((record) => record.type === "income").reduce((sum, record) => sum + parseFloat(record.amount), 0);
    const totalExpenses = financialData.filter((record) => record.type === "expense").reduce((sum, record) => sum + parseFloat(record.amount), 0);
    const tasksData = await db.select().from(tasks).where(eq(tasks.userId, userId));
    const totalTasks = tasksData.length;
    const completedTasks = tasksData.filter((t2) => t2.completed === true).length;
    const inProgressTasks = tasksData.filter((t2) => t2.completed === false && t2.assignedTo !== null).length;
    const pendingTasks = tasksData.filter((t2) => t2.completed === false && t2.assignedTo === null).length;
    return {
      totalClients,
      totalProducts,
      totalSales,
      totalRevenue,
      totalIncome,
      totalExpenses,
      netProfit: totalIncome - totalExpenses,
      totalTasks,
      completedTasks,
      inProgressTasks,
      pendingTasks
    };
  } catch (error) {
    console.error("[Database] Failed to get dashboard metrics:", error);
    return null;
  }
}
async function getBankAccountsByUserId(userId) {
  const db = await getDb();
  if (!db) return [];
  try {
    return await db.select().from(bankAccounts).where(eq(bankAccounts.userId, userId));
  } catch (error) {
    console.error("[Database] Failed to get bank accounts:", error);
    return [];
  }
}
async function createBankAccount(data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  try {
    const result = await db.insert(bankAccounts).values(data);
    return result;
  } catch (error) {
    console.error("[Database] Failed to create bank account:", error);
    throw error;
  }
}
async function getCreditCardsByUserId(userId) {
  const db = await getDb();
  if (!db) return [];
  try {
    return await db.select().from(creditCards).where(eq(creditCards.userId, userId));
  } catch (error) {
    console.error("[Database] Failed to get credit cards:", error);
    return [];
  }
}
async function createCreditCard(data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  try {
    const result = await db.insert(creditCards).values(data);
    return result;
  } catch (error) {
    console.error("[Database] Failed to create credit card:", error);
    throw error;
  }
}
async function getDigitalWalletsByUserId(userId) {
  const db = await getDb();
  if (!db) return [];
  try {
    return await db.select().from(digitalWallets).where(eq(digitalWallets.userId, userId));
  } catch (error) {
    console.error("[Database] Failed to get digital wallets:", error);
    return [];
  }
}
async function createDigitalWallet(data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  try {
    const result = await db.insert(digitalWallets).values(data);
    return result;
  } catch (error) {
    console.error("[Database] Failed to create digital wallet:", error);
    throw error;
  }
}
async function getFinancialTransactionsByUserId(userId) {
  const db = await getDb();
  if (!db) return [];
  try {
    return await db.select().from(financialTransactions).where(eq(financialTransactions.userId, userId)).orderBy(desc(financialTransactions.transactionDate));
  } catch (error) {
    console.error("[Database] Failed to get financial transactions:", error);
    return [];
  }
}
async function createFinancialTransaction(data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  try {
    const result = await db.insert(financialTransactions).values(data);
    if (data.paymentMethod === "cash") {
      const amount = typeof data.amount === "string" ? parseFloat(data.amount) : data.amount;
      const isIncome = data.transactionType === "income";
      const balanceChange = isIncome ? amount : -amount;
      await updateCashBoxBalance(data.userId, balanceChange);
      console.log(`[Database] Updated cash box for user ${data.userId}: +${balanceChange}`);
    }
    if (data.accountId) {
      const amount = typeof data.amount === "string" ? parseFloat(data.amount) : data.amount;
      const isIncome = data.transactionType === "income";
      const balanceChange = isIncome ? amount : -amount;
      const account = await db.select().from(bankAccounts).where(eq(bankAccounts.id, data.accountId));
      if (account.length > 0) {
        const currentBalance = typeof account[0].balance === "string" ? parseFloat(account[0].balance) : account[0].balance || 0;
        const newBalance = currentBalance + balanceChange;
        await db.update(bankAccounts).set({ balance: newBalance.toString() }).where(eq(bankAccounts.id, data.accountId));
        console.log(`[Database] Updated account ${data.accountId} balance: ${currentBalance} -> ${newBalance}`);
      }
    }
    return result;
  } catch (error) {
    console.error("[Database] Failed to create financial transaction:", error);
    throw error;
  }
}
async function getTotalBalance(userId) {
  const db = await getDb();
  if (!db) return 0;
  try {
    const accounts = await db.select().from(bankAccounts).where(eq(bankAccounts.userId, userId));
    const wallets = await db.select().from(digitalWallets).where(eq(digitalWallets.userId, userId));
    const cards = await db.select().from(creditCards).where(eq(creditCards.userId, userId));
    const accountsBalance = accounts.reduce((sum, acc) => sum + parseFloat(acc.balance), 0);
    const walletsBalance = wallets.reduce((sum, wallet) => sum + parseFloat(wallet.balance), 0);
    const cardsBalance = cards.reduce((sum, card) => sum + parseFloat(card.currentBalance), 0);
    return accountsBalance + walletsBalance + cardsBalance;
  } catch (error) {
    console.error("[Database] Failed to get total balance:", error);
    return 0;
  }
}
async function getLoansByUserId(userId) {
  const db = await getDb();
  if (!db) return [];
  try {
    const result = await db.select().from(loans).where(eq(loans.userId, userId));
    return result;
  } catch (error) {
    console.error("[Database] Failed to get loans:", error);
    return [];
  }
}
async function createLoan(data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  try {
    const result = await db.insert(loans).values(data);
    return result;
  } catch (error) {
    console.error("[Database] Failed to create loan:", error);
    throw error;
  }
}
async function updateLoan(id, data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  try {
    const result = await db.update(loans).set(data).where(eq(loans.id, id));
    return result;
  } catch (error) {
    console.error("[Database] Failed to update loan:", error);
    throw error;
  }
}
async function deleteLoan(id) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  try {
    const result = await db.delete(loans).where(eq(loans.id, id));
    return result;
  } catch (error) {
    console.error("[Database] Failed to delete loan:", error);
    throw error;
  }
}
async function getLoanInstallments(loanId) {
  const db = await getDb();
  if (!db) return [];
  try {
    const result = await db.select().from(loanInstallments).where(eq(loanInstallments.loanId, loanId));
    return result;
  } catch (error) {
    console.error("[Database] Failed to get loan installments:", error);
    return [];
  }
}
async function createLoanInstallments(data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  try {
    const result = await db.insert(loanInstallments).values(data);
    return result;
  } catch (error) {
    console.error("[Database] Failed to create loan installments:", error);
    throw error;
  }
}
async function updateLoanInstallment(id, data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  try {
    const result = await db.update(loanInstallments).set(data).where(eq(loanInstallments.id, id));
    return result;
  } catch (error) {
    console.error("[Database] Failed to update loan installment:", error);
    throw error;
  }
}
async function createLoanPayment(data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  try {
    const result = await db.insert(loanPayments).values(data);
    return result;
  } catch (error) {
    console.error("[Database] Failed to create loan payment:", error);
    throw error;
  }
}
async function getLoanPayments(loanId) {
  const db = await getDb();
  if (!db) return [];
  try {
    const result = await db.select().from(loanPayments).where(eq(loanPayments.loanId, loanId));
    return result;
  } catch (error) {
    console.error("[Database] Failed to get loan payments:", error);
    return [];
  }
}
async function handlePartialLoanPayment(data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  try {
    const installment = await getLoanInstallmentById(data.installmentId);
    if (!installment) throw new Error("Installment not found");
    const loan = await getLoanById(data.loanId);
    if (!loan) throw new Error("Loan not found");
    const remainingBalance = parseFloat(installment.amount.toString()) - data.paidAmount;
    if (remainingBalance <= 0) {
      await updateLoanInstallment(data.installmentId, {
        status: "paid",
        paidAmount: installment.amount,
        paidAt: /* @__PURE__ */ new Date()
      });
      return null;
    }
    await updateLoanInstallment(data.installmentId, {
      status: "partially_paid",
      paidAmount: data.paidAmount,
      paidAt: /* @__PURE__ */ new Date()
    });
    const interestAmount = remainingBalance * (data.interestRate / 100);
    const newAmount = remainingBalance + interestAmount;
    const allInstallments = await getLoanInstallments(data.loanId);
    const maxInstallmentNumber = Math.max(...allInstallments.map((i) => i.installmentNumber), 0);
    const currentDueDate = new Date(installment.dueDate);
    const nextDueDate = new Date(currentDueDate);
    nextDueDate.setMonth(nextDueDate.getMonth() + 1);
    const result = await db.insert(loanInstallments).values({
      loanId: data.loanId,
      installmentNumber: maxInstallmentNumber + 1,
      dueDate: nextDueDate,
      amount: newAmount.toString(),
      paidAmount: "0",
      status: "pending"
    });
    const newInstallments = await db.select().from(loanInstallments).where(eq(loanInstallments.loanId, data.loanId)).orderBy(desc(loanInstallments.installmentNumber)).limit(1);
    const newInstallmentId = newInstallments[0]?.id || 0;
    return {
      newInstallmentId,
      remainingBalance,
      interestAmount,
      newAmount,
      newDueDate: nextDueDate
    };
  } catch (error) {
    console.error("[Database] Failed to handle partial loan payment:", error);
    throw error;
  }
}
async function getCalendarEvents(userId) {
  const db = await getDb();
  if (!db) return [];
  try {
    const userLoans = await db.select().from(loans).where(eq(loans.userId, userId));
    const events = [];
    for (const loan of userLoans) {
      const installments = await db.select().from(loanInstallments).where(eq(loanInstallments.loanId, loan.id));
      for (const installment of installments) {
        events.push({
          id: `loan-${installment.id}`,
          type: "payment",
          title: `Parcela #${installment.installmentNumber} - Empr\xE9stimo`,
          dueDate: installment.dueDate,
          amount: installment.amount,
          status: installment.status,
          loanId: loan.id,
          installmentId: installment.id
        });
      }
    }
    const userPurchases = await db.select().from(supplierPurchases).where(eq(supplierPurchases.userId, userId));
    for (const purchase of userPurchases) {
      events.push({
        id: `purchase-${purchase.id}`,
        type: "payment",
        title: `Pagamento a Fornecedor - ${purchase.description}`,
        dueDate: purchase.dueDate,
        amount: purchase.amount,
        status: purchase.paymentStatus,
        purchaseId: purchase.id
      });
    }
    const userSales = await db.select().from(sales).where(eq(sales.userId, userId));
    for (const sale of userSales) {
      events.push({
        id: `sale-${sale.id}`,
        type: "sale",
        title: `Venda realizada - ${sale.totalPrice}`,
        dueDate: sale.createdAt,
        amount: sale.totalPrice,
        status: sale.paymentStatus,
        saleId: sale.id
      });
    }
    const userTasks = await db.select().from(tasks).where(eq(tasks.userId, userId));
    for (const task of userTasks) {
      events.push({
        id: `task-${task.id}`,
        type: "task",
        title: task.title,
        dueDate: task.dueDate,
        status: task.completed ? "completed" : "pending",
        taskId: task.id
      });
    }
    const userTeamMembers = await db.select().from(teamMembers).where(eq(teamMembers.userId, userId));
    for (const member of userTeamMembers) {
      const memberTeamTasks = await db.select().from(teamTasks).where(eq(teamTasks.teamId, member.teamId));
      for (const task of memberTeamTasks) {
        events.push({
          id: `team-task-${task.id}`,
          type: "task",
          title: `[${task.teamId}] ${task.title}`,
          dueDate: task.dueDate,
          status: task.status === "completed" ? "completed" : "pending",
          taskId: task.id,
          isTeamTask: true
        });
      }
    }
    return events;
  } catch (error) {
    console.error("[Database] Failed to get calendar events:", error);
    return [];
  }
}
async function getTeamMembers(teamId) {
  const db = await getDb();
  if (!db) return [];
  try {
    return await db.select().from(teamMembers).where(eq(teamMembers.teamId, teamId));
  } catch (error) {
    console.error("[Database] Failed to get team members:", error);
    return [];
  }
}
async function addTeamMember(teamId, userId, role) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  try {
    return await db.insert(teamMembers).values({ teamId, userId, role });
  } catch (error) {
    console.error("[Database] Failed to add team member:", error);
    throw error;
  }
}
async function removeTeamMember(teamId, userId) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  try {
    return await db.delete(teamMembers).where(and(eq(teamMembers.teamId, teamId), eq(teamMembers.userId, userId)));
  } catch (error) {
    console.error("[Database] Failed to remove team member:", error);
    throw error;
  }
}
async function getTeamTasks(teamId) {
  const db = await getDb();
  if (!db) return [];
  try {
    return await db.select().from(teamTasks).where(eq(teamTasks.teamId, teamId));
  } catch (error) {
    console.error("[Database] Failed to get team tasks:", error);
    return [];
  }
}
async function createTeamTask(data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  try {
    return await db.insert(teamTasks).values(data);
  } catch (error) {
    console.error("[Database] Failed to create team task:", error);
    throw error;
  }
}
async function updateTeamTaskStatus(taskId, status) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  try {
    return await db.update(teamTasks).set({ status }).where(eq(teamTasks.id, taskId));
  } catch (error) {
    console.error("[Database] Failed to update team task status:", error);
    throw error;
  }
}
async function deleteTeamTask(taskId) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  try {
    return await db.delete(teamTasks).where(eq(teamTasks.id, taskId));
  } catch (error) {
    console.error("[Database] Failed to delete team task:", error);
    throw error;
  }
}
async function getTeamMessages(teamId) {
  const db = await getDb();
  if (!db) return [];
  try {
    return await db.select().from(teamMessages).where(eq(teamMessages.teamId, teamId));
  } catch (error) {
    console.error("[Database] Failed to get team messages:", error);
    return [];
  }
}
async function createTeamMessage(data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  try {
    return await db.insert(teamMessages).values(data);
  } catch (error) {
    console.error("[Database] Failed to create team message:", error);
    throw error;
  }
}
async function getNotifications(userId) {
  const db = await getDb();
  if (!db) return [];
  try {
    const userNotifications = await db.select().from(notifications).where(eq(notifications.userId, userId)).orderBy(desc(notifications.createdAt)).limit(50);
    return userNotifications;
  } catch (error) {
    console.error("[Database] Failed to get notifications:", error);
    return [];
  }
}
async function markNotificationAsRead(notificationId) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  try {
    await db.update(notifications).set({ read: true }).where(eq(notifications.id, notificationId));
  } catch (error) {
    console.error("[Database] Failed to mark notification as read:", error);
    throw error;
  }
}
async function getUnreadNotificationCount(userId) {
  const db = await getDb();
  if (!db) return 0;
  try {
    const result = await db.select({ count: count() }).from(notifications).where(and(eq(notifications.userId, userId), eq(notifications.read, false)));
    return result[0]?.count || 0;
  } catch (error) {
    console.error("[Database] Failed to get unread notification count:", error);
    return 0;
  }
}
async function getTasksStatistics(userId, teamId) {
  const db = await getDb();
  if (!db) return { total: 0, completed: 0, pending: 0, inProgress: 0 };
  try {
    const query = teamId ? db.select().from(teamTasks).where(eq(teamTasks.teamId, teamId)) : db.select().from(teamTasks).where(eq(teamTasks.createdBy, userId));
    const allTasks = await query;
    return {
      total: allTasks.length,
      completed: allTasks.filter((t2) => t2.status === "completed").length,
      pending: allTasks.filter((t2) => t2.status === "pending").length,
      inProgress: allTasks.filter((t2) => t2.status === "in_progress").length
    };
  } catch (error) {
    console.error("[Database] Failed to get tasks statistics:", error);
    return { total: 0, completed: 0, pending: 0, inProgress: 0 };
  }
}
async function getTasksCompletedByWeek(userId, teamId) {
  const db = await getDb();
  if (!db) return [];
  try {
    const query = teamId ? db.select().from(teamTasks).where(eq(teamTasks.teamId, teamId)) : db.select().from(teamTasks).where(eq(teamTasks.createdBy, userId));
    const allTasks = await query;
    const weeks = {};
    const now = /* @__PURE__ */ new Date();
    allTasks.forEach((task) => {
      if (task.status === "completed" && task.updatedAt) {
        const taskDate = new Date(task.updatedAt);
        const weekStart = new Date(taskDate);
        weekStart.setDate(taskDate.getDate() - taskDate.getDay());
        const weekKey = weekStart.toISOString().split("T")[0];
        weeks[weekKey] = (weeks[weekKey] || 0) + 1;
      }
    });
    const result = [];
    for (let i = 7; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(now.getDate() - (now.getDay() + i * 7));
      const weekKey = date.toISOString().split("T")[0];
      result.push({
        week: weekKey,
        completed: weeks[weekKey] || 0
      });
    }
    return result;
  } catch (error) {
    console.error("[Database] Failed to get tasks completed by week:", error);
    return [];
  }
}
async function getMemberProductivity(teamId) {
  const db = await getDb();
  if (!db) return [];
  try {
    const tasks2 = await db.select().from(teamTasks).where(eq(teamTasks.teamId, teamId));
    const members = await db.select().from(teamMembers).where(eq(teamMembers.teamId, teamId));
    const productivity = {};
    members.forEach((member) => {
      productivity[member.userId] = {
        name: `Membro ${member.userId}`,
        completed: 0,
        pending: 0,
        inProgress: 0
      };
    });
    tasks2.forEach((task) => {
      if (productivity[task.assignedTo]) {
        if (task.status === "completed") {
          productivity[task.assignedTo].completed++;
        } else if (task.status === "pending") {
          productivity[task.assignedTo].pending++;
        } else if (task.status === "in_progress") {
          productivity[task.assignedTo].inProgress++;
        }
      }
    });
    return Object.entries(productivity).map(([userId, data]) => ({
      userId: parseInt(userId),
      ...data
    }));
  } catch (error) {
    console.error("[Database] Failed to get member productivity:", error);
    return [];
  }
}
async function getFinancialSummary(userId) {
  const db = await getDb();
  if (!db) return { income: 0, expense: 0, balance: 0 };
  try {
    const transactions = await db.select().from(financialTransactions).where(eq(financialTransactions.userId, userId));
    const income = transactions.filter((t2) => t2.transactionType === "income" && t2.status === "completed").reduce((sum, t2) => sum + parseFloat(t2.amount.toString()), 0);
    const expense = transactions.filter((t2) => t2.transactionType === "expense" && t2.status === "completed").reduce((sum, t2) => sum + parseFloat(t2.amount.toString()), 0);
    return {
      income,
      expense,
      balance: income - expense
    };
  } catch (error) {
    console.error("[Database] Failed to get financial summary:", error);
    return { income: 0, expense: 0, balance: 0 };
  }
}
async function getReportData(userId, teamId, startDate, endDate) {
  const db = await getDb();
  if (!db) return null;
  try {
    const stats = await getTasksStatistics(userId, teamId);
    const weeklyData = await getTasksCompletedByWeek(userId, teamId);
    const memberProductivity = teamId ? await getMemberProductivity(teamId) : [];
    const financialSummary = await getFinancialSummary(userId);
    return {
      generatedAt: /* @__PURE__ */ new Date(),
      period: { startDate, endDate },
      stats,
      weeklyData,
      memberProductivity,
      financialSummary
    };
  } catch (error) {
    console.error("[Database] Failed to get report data:", error);
    return null;
  }
}
async function getOverdueTasks(userId, teamId) {
  const db = await getDb();
  if (!db) return [];
  try {
    const now = /* @__PURE__ */ new Date();
    const query = teamId ? db.select().from(teamTasks).where(eq(teamTasks.teamId, teamId)) : db.select().from(teamTasks).where(eq(teamTasks.createdBy, userId));
    const allTasks = await query;
    return allTasks.filter(
      (task) => task.status !== "completed" && task.dueDate && new Date(task.dueDate) < now
    );
  } catch (error) {
    console.error("[Database] Failed to get overdue tasks:", error);
    return [];
  }
}
async function getFinancialAnomalies(userId) {
  const db = await getDb();
  if (!db) return [];
  try {
    const transactions = await db.select().from(financialTransactions).where(eq(financialTransactions.userId, userId));
    const anomalies = [];
    const amounts = transactions.map((t2) => parseFloat(t2.amount.toString()));
    if (amounts.length > 0) {
      const average = amounts.reduce((a, b) => a + b, 0) / amounts.length;
      const highTransactions = transactions.filter(
        (t2) => parseFloat(t2.amount.toString()) > average * 10
      );
      if (highTransactions.length > 0) {
        anomalies.push({
          type: "high_transaction",
          severity: "warning",
          message: `Transa\xE7\xE3o acima do normal detectada: ${highTransactions.length} transa\xE7\xF5es`,
          count: highTransactions.length
        });
      }
    }
    const today = /* @__PURE__ */ new Date();
    today.setHours(0, 0, 0, 0);
    const todayTransactions = transactions.filter((t2) => {
      const txDate = new Date(t2.transactionDate);
      txDate.setHours(0, 0, 0, 0);
      return txDate.getTime() === today.getTime();
    });
    if (todayTransactions.length > 10) {
      anomalies.push({
        type: "many_transactions",
        severity: "info",
        message: `Muitas transa\xE7\xF5es hoje: ${todayTransactions.length}`,
        count: todayTransactions.length
      });
    }
    return anomalies;
  } catch (error) {
    console.error("[Database] Failed to get financial anomalies:", error);
    return [];
  }
}
async function searchProductsForPdv(userId, query) {
  const db = await getDb();
  if (!db) return [];
  try {
    const searchTerm = `%${query}%`;
    return await db.select().from(products).where(
      and(
        eq(products.userId, userId)
        // Search by name, code, or SKU
        // Note: MySQL LIKE is case-insensitive by default
      )
    ).limit(20);
  } catch (error) {
    console.error("[Database] Failed to search products:", error);
    return [];
  }
}
async function getProductFavorites(userId) {
  const db = await getDb();
  if (!db) return [];
  try {
    const favorites = await db.select().from(productFavorites).where(eq(productFavorites.userId, userId)).orderBy(productFavorites.position);
    const favoriteIds = favorites.map((f) => f.productId);
    if (favoriteIds.length === 0) return [];
    return await db.select().from(products).where(and(
      eq(products.userId, userId)
      // In clause would be better but Drizzle might not support it easily
    )).limit(100);
  } catch (error) {
    console.error("[Database] Failed to get product favorites:", error);
    return [];
  }
}
async function addProductFavorite(userId, productId, position = 0) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  try {
    return await db.insert(productFavorites).values({
      userId,
      productId,
      position
    });
  } catch (error) {
    console.error("[Database] Failed to add product favorite:", error);
    throw error;
  }
}
async function removeProductFavorite(userId, productId) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  try {
    return await db.delete(productFavorites).where(
      and(
        eq(productFavorites.userId, userId),
        eq(productFavorites.productId, productId)
      )
    );
  } catch (error) {
    console.error("[Database] Failed to remove product favorite:", error);
    throw error;
  }
}
async function createSalesOrder(orderData, items) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  try {
    console.log("[Database] Creating sales order with data:", orderData);
    const orderResult = await db.insert(salesOrders).values(orderData);
    console.log("[Database] Order result:", orderResult);
    let orderId;
    if (typeof orderResult === "object" && orderResult !== null) {
      orderId = orderResult.insertId;
      console.log("[Database] Extracted orderId:", orderId, "Type:", typeof orderId);
    }
    if (!orderId || isNaN(orderId)) {
      console.error("[Database] Invalid orderId:", orderId, "Result:", orderResult);
      throw new Error(`Failed to get valid insertId from order result`);
    }
    const itemsWithOrderId = items.map((item) => {
      const itemData = { ...item };
      itemData.salesOrderId = Number(orderId);
      return itemData;
    });
    if (itemsWithOrderId.length > 0) {
      await db.insert(salesOrderItems).values(itemsWithOrderId);
    }
    return { orderId, success: true };
  } catch (error) {
    console.error("[Database] Failed to create sales order:", error);
    throw error;
  }
}
async function getSalesOrderWithItems(orderId) {
  const db = await getDb();
  if (!db) return null;
  try {
    const order = await db.select().from(salesOrders).where(eq(salesOrders.id, orderId)).limit(1);
    if (!order || order.length === 0) return null;
    const items = await db.select().from(salesOrderItems).where(eq(salesOrderItems.salesOrderId, orderId));
    return {
      ...order[0],
      items
    };
  } catch (error) {
    console.error("[Database] Failed to get sales order:", error);
    return null;
  }
}
async function getSalesOrdersByUserId(userId, limit = 50) {
  const db = await getDb();
  if (!db) return [];
  try {
    return await db.select().from(salesOrders).where(eq(salesOrders.userId, userId)).orderBy(desc(salesOrders.createdAt)).limit(limit);
  } catch (error) {
    console.error("[Database] Failed to get sales orders:", error);
    return [];
  }
}
async function updateSalesOrderStatus(orderId, status) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  try {
    return await db.update(salesOrders).set({ paymentStatus: status }).where(eq(salesOrders.id, orderId));
  } catch (error) {
    console.error("[Database] Failed to update sales order status:", error);
    throw error;
  }
}
async function getLoanById(id) {
  const db = await getDb();
  if (!db) return null;
  try {
    const result = await db.select().from(loans).where(eq(loans.id, id)).limit(1);
    return result[0] || null;
  } catch (error) {
    console.error("[Database] Failed to get loan by ID:", error);
    return null;
  }
}
async function getLoanInstallmentById(id) {
  const db = await getDb();
  if (!db) return null;
  try {
    const result = await db.select().from(loanInstallments).where(eq(loanInstallments.id, id)).limit(1);
    return result[0] || null;
  } catch (error) {
    console.error("[Database] Failed to get loan installment by ID:", error);
    return null;
  }
}
async function deleteAllUserData(userId) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }
  try {
    await db.delete(notifications).where(eq(notifications.userId, userId));
    await db.delete(teamMessages).where(eq(teamMessages.userId, userId));
    await db.delete(teamTasks).where(eq(teamTasks.createdBy, userId));
    await db.delete(teamMembers).where(eq(teamMembers.userId, userId));
    await db.delete(teams).where(eq(teams.userId, userId));
    const userLoans = await db.select({ id: loans.id }).from(loans).where(eq(loans.userId, userId));
    for (const loan of userLoans) {
      await db.delete(loanPayments).where(eq(loanPayments.loanId, loan.id));
      await db.delete(loanInstallments).where(eq(loanInstallments.loanId, loan.id));
    }
    await db.delete(loans).where(eq(loans.userId, userId));
    await db.delete(installmentPlans).where(eq(installmentPlans.userId, userId));
    await db.delete(financialTransactions).where(eq(financialTransactions.userId, userId));
    await db.delete(digitalWallets).where(eq(digitalWallets.userId, userId));
    await db.delete(creditCards).where(eq(creditCards.userId, userId));
    await db.delete(bankAccounts).where(eq(bankAccounts.userId, userId));
    await db.delete(productOutputHistory).where(eq(productOutputHistory.userId, userId));
    await db.delete(supplierPurchases).where(eq(supplierPurchases.userId, userId));
    await db.delete(subscriptions).where(eq(subscriptions.userId, userId));
    const userSalesOrders = await db.select({ id: salesOrders.id }).from(salesOrders).where(eq(salesOrders.userId, userId));
    for (const order of userSalesOrders) {
      await db.delete(salesOrderItems).where(eq(salesOrderItems.salesOrderId, order.id));
    }
    await db.delete(salesOrders).where(eq(salesOrders.userId, userId));
    await db.delete(sales).where(eq(sales.userId, userId));
    await db.delete(tasks).where(eq(tasks.userId, userId));
    await db.delete(financialRecords).where(eq(financialRecords.userId, userId));
    await db.delete(productFavorites).where(eq(productFavorites.userId, userId));
    await db.delete(products).where(eq(products.userId, userId));
    await db.delete(suppliers).where(eq(suppliers.userId, userId));
    await db.delete(clients).where(eq(clients.userId, userId));
  } catch (error) {
    console.error("[Database] Failed to delete all user data:", error);
    throw error;
  }
}
async function deleteUser(userId) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }
  try {
    await db.delete(users).where(eq(users.id, userId));
  } catch (error) {
    console.error("[Database] Failed to delete user:", error);
    throw error;
  }
}
async function getCashBox(userId) {
  const db = await getDb();
  if (!db) return null;
  try {
    const result = await db.select().from(cashBox).where(eq(cashBox.userId, userId)).limit(1);
    if (result.length > 0) {
      return result[0];
    }
    const newCashBox = await db.insert(cashBox).values({
      userId,
      balance: "0",
      currency: "BRL"
    });
    const insertedId = newCashBox.insertId || newCashBox[0];
    return {
      id: insertedId,
      userId,
      balance: "0",
      currency: "BRL",
      lastUpdated: /* @__PURE__ */ new Date(),
      createdAt: /* @__PURE__ */ new Date()
    };
  } catch (error) {
    console.error("[Database] Failed to get cash box:", error);
    throw error;
  }
}
async function updateCashBoxBalance(userId, amount) {
  const db = await getDb();
  if (!db) return null;
  try {
    const existing = await getCashBox(userId);
    const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;
    const currentBalance = typeof existing?.balance === "string" ? parseFloat(existing.balance) : existing?.balance || 0;
    const newBalance = currentBalance + numAmount;
    const result = await db.update(cashBox).set({
      balance: newBalance.toString(),
      lastUpdated: /* @__PURE__ */ new Date()
    }).where(eq(cashBox.userId, userId));
    return result;
  } catch (error) {
    console.error("[Database] Failed to update cash box balance:", error);
    throw error;
  }
}
async function getExpenseCategoriesByUserId(userId) {
  const db = await getDb();
  if (!db) return [];
  try {
    return await db.select().from(expenseCategories).where(eq(expenseCategories.userId, userId)).orderBy(desc(expenseCategories.usageCount), desc(expenseCategories.createdAt));
  } catch (error) {
    console.error("[Database] Failed to get expense categories:", error);
    return [];
  }
}
async function createExpenseCategory(data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  try {
    const result = await db.insert(expenseCategories).values({
      userId: data.userId,
      name: data.name,
      nameLower: data.name.toLowerCase(),
      icon: data.icon || "tag",
      color: data.color || "#7c3aed",
      isDefault: data.isDefault || false,
      usageCount: 0
    });
    const categories = await db.select().from(expenseCategories).where(
      and(
        eq(expenseCategories.userId, data.userId),
        eq(expenseCategories.nameLower, data.name.toLowerCase())
      )
    ).limit(1);
    return categories[0] || null;
  } catch (error) {
    console.error("[Database] Failed to create expense category:", error);
    throw error;
  }
}
async function deleteExpenseCategory(id, userId) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  try {
    await db.delete(expenseCategories).where(
      and(
        eq(expenseCategories.id, id),
        eq(expenseCategories.userId, userId)
      )
    );
    return { success: true };
  } catch (error) {
    console.error("[Database] Failed to delete expense category:", error);
    throw error;
  }
}
async function seedDefaultExpenseCategories(userId) {
  const db = await getDb();
  if (!db) return;
  try {
    const defaultCategories = [
      { name: "Supermercado", icon: "shopping-cart", color: "#10b981" },
      { name: "Aluguel", icon: "home", color: "#3b82f6" },
      { name: "Funcion\xE1rios", icon: "users", color: "#8b5cf6" },
      { name: "Escola", icon: "book", color: "#f59e0b" },
      { name: "Transporte", icon: "truck", color: "#ec4899" },
      { name: "Outros", icon: "tag", color: "#6b7280" }
    ];
    for (const category of defaultCategories) {
      const existing = await db.select().from(expenseCategories).where(
        and(
          eq(expenseCategories.userId, userId),
          eq(expenseCategories.nameLower, category.name.toLowerCase())
        )
      ).limit(1);
      if (existing.length === 0) {
        await db.insert(expenseCategories).values({
          userId,
          name: category.name,
          nameLower: category.name.toLowerCase(),
          icon: category.icon,
          color: category.color,
          isDefault: true,
          usageCount: 0
        });
      }
    }
  } catch (error) {
    console.error("[Database] Failed to seed default expense categories:", error);
  }
}
async function getInstallmentsForCalendar(userId) {
  const db = await getDb();
  if (!db) return [];
  try {
    const userLoans = await db.select().from(loans).where(eq(loans.userId, userId));
    const allInstallments = [];
    for (const loan of userLoans) {
      const installments = await db.select().from(loanInstallments).where(eq(loanInstallments.loanId, loan.id));
      const client = await db.select().from(clients).where(eq(clients.id, loan.clientId)).limit(1);
      installments.forEach((inst) => {
        allInstallments.push({
          ...inst,
          loanId: loan.id,
          clientName: client.length > 0 ? client[0].name : "Cliente Desconhecido",
          loanType: loan.type
        });
      });
    }
    return allInstallments;
  } catch (error) {
    console.error("[Database] Failed to get installments for calendar:", error);
    return [];
  }
}

// server/_core/cookies.ts
function isSecureRequest(req) {
  if (req.protocol === "https") return true;
  const forwardedProto = req.headers["x-forwarded-proto"];
  if (!forwardedProto) return false;
  const protoList = Array.isArray(forwardedProto) ? forwardedProto : forwardedProto.split(",");
  return protoList.some((proto) => proto.trim().toLowerCase() === "https");
}
function getSessionCookieOptions(req) {
  return {
    httpOnly: true,
    path: "/",
    sameSite: "none",
    secure: isSecureRequest(req)
  };
}

// shared/_core/errors.ts
var HttpError = class extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.name = "HttpError";
  }
};
var ForbiddenError = (msg) => new HttpError(403, msg);

// server/_core/sdk.ts
import axios from "axios";
import { parse as parseCookieHeader } from "cookie";
import { SignJWT, jwtVerify } from "jose";
var isNonEmptyString = (value) => typeof value === "string" && value.length > 0;
var EXCHANGE_TOKEN_PATH = `/webdev.v1.WebDevAuthPublicService/ExchangeToken`;
var GET_USER_INFO_PATH = `/webdev.v1.WebDevAuthPublicService/GetUserInfo`;
var GET_USER_INFO_WITH_JWT_PATH = `/webdev.v1.WebDevAuthPublicService/GetUserInfoWithJwt`;
var OAuthService = class {
  constructor(client) {
    this.client = client;
    console.log("[OAuth] Initialized with baseURL:", ENV.oAuthServerUrl);
    if (!ENV.oAuthServerUrl) {
      console.error(
        "[OAuth] ERROR: OAUTH_SERVER_URL is not configured! Set OAUTH_SERVER_URL environment variable."
      );
    }
  }
  decodeState(state) {
    const redirectUri = atob(state);
    return redirectUri;
  }
  async getTokenByCode(code, state) {
    const payload = {
      clientId: ENV.appId,
      grantType: "authorization_code",
      code,
      redirectUri: this.decodeState(state)
    };
    const { data } = await this.client.post(
      EXCHANGE_TOKEN_PATH,
      payload
    );
    return data;
  }
  async getUserInfoByToken(token) {
    const { data } = await this.client.post(
      GET_USER_INFO_PATH,
      {
        accessToken: token.accessToken
      }
    );
    return data;
  }
};
var createOAuthHttpClient = () => axios.create({
  baseURL: ENV.oAuthServerUrl,
  timeout: AXIOS_TIMEOUT_MS
});
var SDKServer = class {
  client;
  oauthService;
  constructor(client = createOAuthHttpClient()) {
    this.client = client;
    this.oauthService = new OAuthService(this.client);
  }
  deriveLoginMethod(platforms, fallback) {
    if (fallback && fallback.length > 0) return fallback;
    if (!Array.isArray(platforms) || platforms.length === 0) return null;
    const set = new Set(
      platforms.filter((p) => typeof p === "string")
    );
    if (set.has("REGISTERED_PLATFORM_EMAIL")) return "email";
    if (set.has("REGISTERED_PLATFORM_GOOGLE")) return "google";
    if (set.has("REGISTERED_PLATFORM_APPLE")) return "apple";
    if (set.has("REGISTERED_PLATFORM_MICROSOFT") || set.has("REGISTERED_PLATFORM_AZURE"))
      return "microsoft";
    if (set.has("REGISTERED_PLATFORM_GITHUB")) return "github";
    const first = Array.from(set)[0];
    return first ? first.toLowerCase() : null;
  }
  /**
   * Exchange OAuth authorization code for access token
   * @example
   * const tokenResponse = await sdk.exchangeCodeForToken(code, state);
   */
  async exchangeCodeForToken(code, state) {
    return this.oauthService.getTokenByCode(code, state);
  }
  /**
   * Get user information using access token
   * @example
   * const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);
   */
  async getUserInfo(accessToken) {
    const data = await this.oauthService.getUserInfoByToken({
      accessToken
    });
    const loginMethod = this.deriveLoginMethod(
      data?.platforms,
      data?.platform ?? data.platform ?? null
    );
    return {
      ...data,
      platform: loginMethod,
      loginMethod
    };
  }
  parseCookies(cookieHeader) {
    if (!cookieHeader) {
      return /* @__PURE__ */ new Map();
    }
    const parsed = parseCookieHeader(cookieHeader);
    return new Map(Object.entries(parsed));
  }
  getSessionSecret() {
    const secret = ENV.cookieSecret;
    return new TextEncoder().encode(secret);
  }
  /**
   * Create a session token for a Manus user openId
   * @example
   * const sessionToken = await sdk.createSessionToken(userInfo.openId);
   */
  async createSessionToken(openId, options = {}) {
    return this.signSession(
      {
        openId,
        appId: ENV.appId,
        name: options.name || ""
      },
      options
    );
  }
  async signSession(payload, options = {}) {
    const issuedAt = Date.now();
    const expiresInMs = options.expiresInMs ?? ONE_YEAR_MS;
    const expirationSeconds = Math.floor((issuedAt + expiresInMs) / 1e3);
    const secretKey = this.getSessionSecret();
    return new SignJWT({
      openId: payload.openId,
      appId: payload.appId,
      name: payload.name
    }).setProtectedHeader({ alg: "HS256", typ: "JWT" }).setExpirationTime(expirationSeconds).sign(secretKey);
  }
  async verifySession(cookieValue) {
    if (!cookieValue) {
      console.warn("[Auth] Missing session cookie");
      return null;
    }
    try {
      const secretKey = this.getSessionSecret();
      const { payload } = await jwtVerify(cookieValue, secretKey, {
        algorithms: ["HS256"]
      });
      const { openId, appId, name } = payload;
      if (!isNonEmptyString(openId) || !isNonEmptyString(appId) || !isNonEmptyString(name)) {
        console.warn("[Auth] Session payload missing required fields");
        return null;
      }
      return {
        openId,
        appId,
        name
      };
    } catch (error) {
      console.warn("[Auth] Session verification failed", String(error));
      return null;
    }
  }
  async getUserInfoWithJwt(jwtToken) {
    const payload = {
      jwtToken,
      projectId: ENV.appId
    };
    const { data } = await this.client.post(
      GET_USER_INFO_WITH_JWT_PATH,
      payload
    );
    const loginMethod = this.deriveLoginMethod(
      data?.platforms,
      data?.platform ?? data.platform ?? null
    );
    return {
      ...data,
      platform: loginMethod,
      loginMethod
    };
  }
  async authenticateRequest(req) {
    const cookies = this.parseCookies(req.headers.cookie);
    const sessionCookie = cookies.get(COOKIE_NAME);
    const session = await this.verifySession(sessionCookie);
    if (!session) {
      throw ForbiddenError("Invalid session cookie");
    }
    const sessionUserId = session.openId;
    const signedInAt = /* @__PURE__ */ new Date();
    let user = await getUserByOpenId(sessionUserId);
    if (!user) {
      try {
        const userInfo = await this.getUserInfoWithJwt(sessionCookie ?? "");
        await upsertUser({
          openId: userInfo.openId,
          name: userInfo.name || null,
          email: userInfo.email ?? null,
          loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
          lastSignedIn: signedInAt
        });
        user = await getUserByOpenId(userInfo.openId);
      } catch (error) {
        console.error("[Auth] Failed to sync user from OAuth:", error);
        throw ForbiddenError("Failed to sync user info");
      }
    }
    if (!user) {
      throw ForbiddenError("User not found");
    }
    await upsertUser({
      openId: user.openId,
      lastSignedIn: signedInAt
    });
    return user;
  }
};
var sdk = new SDKServer();

// server/_core/oauth.ts
function getQueryParam(req, key) {
  const value = req.query[key];
  return typeof value === "string" ? value : void 0;
}
function registerOAuthRoutes(app) {
  app.get("/api/oauth/callback", async (req, res) => {
    const code = getQueryParam(req, "code");
    const state = getQueryParam(req, "state");
    if (!code || !state) {
      res.status(400).json({ error: "code and state are required" });
      return;
    }
    try {
      const tokenResponse = await sdk.exchangeCodeForToken(code, state);
      const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);
      if (!userInfo.openId) {
        res.status(400).json({ error: "openId missing from user info" });
        return;
      }
      await upsertUser({
        openId: userInfo.openId,
        name: userInfo.name || null,
        email: userInfo.email ?? null,
        loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
        lastSignedIn: /* @__PURE__ */ new Date()
      });
      const sessionToken = await sdk.createSessionToken(userInfo.openId, {
        name: userInfo.name || "",
        expiresInMs: ONE_YEAR_MS
      });
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });
      res.redirect(302, "/");
    } catch (error) {
      console.error("[OAuth] Callback failed", error);
      res.status(500).json({ error: "OAuth callback failed" });
    }
  });
}

// server/_core/systemRouter.ts
import { z } from "zod";

// server/_core/notification.ts
import { TRPCError } from "@trpc/server";
var TITLE_MAX_LENGTH = 1200;
var CONTENT_MAX_LENGTH = 2e4;
var trimValue = (value) => value.trim();
var isNonEmptyString2 = (value) => typeof value === "string" && value.trim().length > 0;
var buildEndpointUrl = (baseUrl) => {
  const normalizedBase = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
  return new URL(
    "webdevtoken.v1.WebDevService/SendNotification",
    normalizedBase
  ).toString();
};
var validatePayload = (input) => {
  if (!isNonEmptyString2(input.title)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Notification title is required."
    });
  }
  if (!isNonEmptyString2(input.content)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Notification content is required."
    });
  }
  const title = trimValue(input.title);
  const content = trimValue(input.content);
  if (title.length > TITLE_MAX_LENGTH) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Notification title must be at most ${TITLE_MAX_LENGTH} characters.`
    });
  }
  if (content.length > CONTENT_MAX_LENGTH) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Notification content must be at most ${CONTENT_MAX_LENGTH} characters.`
    });
  }
  return { title, content };
};
async function notifyOwner(payload) {
  const { title, content } = validatePayload(payload);
  if (!ENV.forgeApiUrl) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Notification service URL is not configured."
    });
  }
  if (!ENV.forgeApiKey) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Notification service API key is not configured."
    });
  }
  const endpoint = buildEndpointUrl(ENV.forgeApiUrl);
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        accept: "application/json",
        authorization: `Bearer ${ENV.forgeApiKey}`,
        "content-type": "application/json",
        "connect-protocol-version": "1"
      },
      body: JSON.stringify({ title, content })
    });
    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      console.warn(
        `[Notification] Failed to notify owner (${response.status} ${response.statusText})${detail ? `: ${detail}` : ""}`
      );
      return false;
    }
    return true;
  } catch (error) {
    console.warn("[Notification] Error calling notification service:", error);
    return false;
  }
}

// server/_core/trpc.ts
import { initTRPC, TRPCError as TRPCError2 } from "@trpc/server";
import superjson from "superjson";
var t = initTRPC.context().create({
  transformer: superjson
});
var router = t.router;
var publicProcedure = t.procedure;
var requireUser = t.middleware(async (opts) => {
  const { ctx, next } = opts;
  if (!ctx.user) {
    throw new TRPCError2({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user
    }
  });
});
var protectedProcedure = t.procedure.use(requireUser);
var adminProcedure = t.procedure.use(
  t.middleware(async (opts) => {
    const { ctx, next } = opts;
    if (!ctx.user || ctx.user.role !== "admin") {
      throw new TRPCError2({ code: "FORBIDDEN", message: NOT_ADMIN_ERR_MSG });
    }
    return next({
      ctx: {
        ...ctx,
        user: ctx.user
      }
    });
  })
);

// server/_core/systemRouter.ts
var systemRouter = router({
  health: publicProcedure.input(
    z.object({
      timestamp: z.number().min(0, "timestamp cannot be negative")
    })
  ).query(() => ({
    ok: true
  })),
  notifyOwner: adminProcedure.input(
    z.object({
      title: z.string().min(1, "title is required"),
      content: z.string().min(1, "content is required")
    })
  ).mutation(async ({ input }) => {
    const delivered = await notifyOwner(input);
    return {
      success: delivered
    };
  })
});

// server/routers.ts
import { z as z2 } from "zod";
var appRouter = router({
  system: systemRouter,
  account: router({
    deleteAllData: protectedProcedure.input(z2.object({ confirmation: z2.string() })).mutation(async ({ ctx, input }) => {
      if (input.confirmation !== "APAGAR TODOS OS DADOS") {
        throw new Error("Confirmacao incorreta");
      }
      await deleteAllUserData(ctx.user.id);
      return { success: true, message: "Todos os dados foram apagados com sucesso" };
    }),
    deleteAccount: protectedProcedure.input(z2.object({ confirmation: z2.string() })).mutation(async ({ ctx, input }) => {
      if (input.confirmation !== "EXCLUIR MINHA CONTA") {
        throw new Error("Confirmacao incorreta");
      }
      await deleteAllUserData(ctx.user.id);
      await deleteUser(ctx.user.id);
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true, message: "Conta deletada com sucesso" };
    })
  }),
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true
      };
    })
  }),
  // ============ Clients Router ============
  clients: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return getClientsByUserId(ctx.user.id);
    }),
    create: protectedProcedure.input(z2.object({
      name: z2.string().min(1),
      email: z2.string().email().optional(),
      phone: z2.string().optional(),
      address: z2.string().optional(),
      city: z2.string().optional(),
      state: z2.string().optional(),
      zipCode: z2.string().optional(),
      cpfCnpj: z2.string().optional(),
      notes: z2.string().optional()
    })).mutation(async ({ ctx, input }) => {
      return createClient({
        userId: ctx.user.id,
        ...input
      });
    }),
    update: protectedProcedure.input(z2.object({
      id: z2.number(),
      name: z2.string().optional(),
      email: z2.string().email().optional(),
      phone: z2.string().optional(),
      address: z2.string().optional(),
      city: z2.string().optional(),
      state: z2.string().optional(),
      zipCode: z2.string().optional(),
      cpfCnpj: z2.string().optional(),
      notes: z2.string().optional()
    })).mutation(async ({ input }) => {
      const { id, ...data } = input;
      return updateClient(id, data);
    }),
    delete: protectedProcedure.input(z2.object({ id: z2.number() })).mutation(async ({ input }) => {
      return deleteClient(input.id);
    })
  }),
  // ============ Products Router ============
  products: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return getProductsByUserId(ctx.user.id);
    }),
    create: protectedProcedure.input(z2.object({
      name: z2.string().min(1),
      code: z2.string().optional(),
      description: z2.string().optional(),
      sku: z2.string().optional(),
      supplierId: z2.number().optional(),
      measure: z2.string().optional(),
      unit: z2.string().optional(),
      weight: z2.string().optional(),
      cost: z2.string().min(1),
      markup: z2.string().optional(),
      marginPercentage: z2.string().optional(),
      price: z2.string().min(1),
      quantity: z2.number().default(0),
      category: z2.string().optional()
    })).mutation(async ({ ctx, input }) => {
      return createProduct({
        userId: ctx.user.id,
        ...input
      });
    }),
    update: protectedProcedure.input(z2.object({
      id: z2.number(),
      name: z2.string().optional(),
      description: z2.string().optional(),
      sku: z2.string().optional(),
      price: z2.string().optional(),
      cost: z2.string().optional(),
      quantity: z2.number().optional(),
      category: z2.string().optional(),
      supplierId: z2.number().optional()
    })).mutation(async ({ input }) => {
      const { id, ...data } = input;
      return updateProduct(id, data);
    }),
    delete: protectedProcedure.input(z2.object({ id: z2.number() })).mutation(async ({ input }) => {
      return deleteProduct(input.id);
    })
  }),
  // ============ Suppliers Router ============
  suppliers: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return getSuppliersByUserId(ctx.user.id);
    }),
    create: protectedProcedure.input(z2.object({
      name: z2.string().min(1),
      email: z2.string().email().optional(),
      phone: z2.string().optional(),
      address: z2.string().optional(),
      city: z2.string().optional(),
      state: z2.string().optional(),
      zipCode: z2.string().optional(),
      cnpj: z2.string().optional(),
      paymentTerms: z2.string().optional(),
      notes: z2.string().optional()
    })).mutation(async ({ ctx, input }) => {
      return createSupplier({
        userId: ctx.user.id,
        ...input
      });
    }),
    update: protectedProcedure.input(z2.object({
      id: z2.number(),
      name: z2.string().optional(),
      email: z2.string().email().optional(),
      phone: z2.string().optional(),
      address: z2.string().optional(),
      city: z2.string().optional(),
      state: z2.string().optional(),
      zipCode: z2.string().optional(),
      cnpj: z2.string().optional(),
      paymentTerms: z2.string().optional(),
      notes: z2.string().optional()
    })).mutation(async ({ input }) => {
      const { id, ...data } = input;
      return updateSupplier(id, data);
    }),
    delete: protectedProcedure.input(z2.object({ id: z2.number() })).mutation(async ({ input }) => {
      return deleteSupplier(input.id);
    })
  }),
  // ============ Sales Router ============
  sales: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return getSalesByUserId(ctx.user.id);
    }),
    create: protectedProcedure.input(z2.object({
      clientId: z2.number(),
      productId: z2.number().optional(),
      quantity: z2.number().min(1),
      unitPrice: z2.string().min(1),
      totalPrice: z2.string().min(1),
      discount: z2.string().optional(),
      paymentMethod: z2.string().optional(),
      paymentStatus: z2.enum(["pending", "paid", "cancelled"]).optional(),
      accountId: z2.number().optional(),
      notes: z2.string().optional()
    })).mutation(async ({ ctx, input }) => {
      const { accountId, ...saleData } = input;
      const sale = await createSale({
        userId: ctx.user.id,
        ...saleData
      });
      if (accountId) {
        const paymentMethodMap = {
          "pix": "pix",
          "cash": "cash",
          "debit": "debit",
          "credit": "credit",
          "transfer": "transfer"
        };
        const mappedPaymentMethod = paymentMethodMap[input.paymentMethod?.toLowerCase() || "transfer"] || "transfer";
        await createFinancialTransaction({
          userId: ctx.user.id,
          transactionType: "income",
          paymentMethod: mappedPaymentMethod,
          accountId,
          amount: input.totalPrice,
          description: "Venda de produto",
          category: "Vendas",
          status: "completed",
          transactionDate: /* @__PURE__ */ new Date()
        });
      }
      return sale;
    }),
    update: protectedProcedure.input(z2.object({
      id: z2.number(),
      clientId: z2.number().optional(),
      productId: z2.number().optional(),
      quantity: z2.number().optional(),
      unitPrice: z2.string().optional(),
      totalPrice: z2.string().optional(),
      discount: z2.string().optional(),
      paymentMethod: z2.string().optional(),
      paymentStatus: z2.enum(["pending", "paid", "cancelled"]).optional(),
      notes: z2.string().optional()
    })).mutation(async ({ input }) => {
      const { id, ...data } = input;
      return updateSale(id, data);
    }),
    delete: protectedProcedure.input(z2.object({ id: z2.number() })).mutation(async ({ input }) => {
      return deleteSale(input.id);
    })
  }),
  // ============ Financial Records Router ============
  financial: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return getFinancialTransactionsByUserId(ctx.user.id);
    }),
    create: protectedProcedure.input(z2.object({
      type: z2.enum(["income", "expense"]),
      category: z2.string().min(1),
      description: z2.string().optional(),
      amount: z2.string().min(1),
      paymentMethod: z2.string().optional(),
      status: z2.enum(["pending", "completed", "cancelled"]).optional(),
      dueDate: z2.date().optional(),
      paidDate: z2.date().optional(),
      notes: z2.string().optional()
    })).mutation(async ({ ctx, input }) => {
      return createFinancialRecord({
        userId: ctx.user.id,
        ...input
      });
    }),
    update: protectedProcedure.input(z2.object({
      id: z2.number(),
      type: z2.enum(["income", "expense"]).optional(),
      category: z2.string().optional(),
      description: z2.string().optional(),
      amount: z2.string().optional(),
      paymentMethod: z2.string().optional(),
      status: z2.enum(["pending", "completed", "cancelled"]).optional(),
      dueDate: z2.date().optional(),
      paidDate: z2.date().optional(),
      notes: z2.string().optional()
    })).mutation(async ({ input }) => {
      const { id, ...data } = input;
      return updateFinancialRecord(id, data);
    }),
    delete: protectedProcedure.input(z2.object({ id: z2.number() })).mutation(async ({ input }) => {
      return deleteFinancialRecord(input.id);
    }),
    bankAccounts: router({
      list: protectedProcedure.query(async ({ ctx }) => {
        return getBankAccountsByUserId(ctx.user.id);
      }),
      create: protectedProcedure.input(
        z2.object({
          accountName: z2.string().min(1),
          bankName: z2.string().optional(),
          accountNumber: z2.string().optional(),
          accountType: z2.enum(["checking", "savings", "investment", "cash"]).optional(),
          balance: z2.string().optional(),
          currency: z2.string().optional()
        })
      ).mutation(async ({ ctx, input }) => {
        if (input.accountType !== "cash") {
          if (!input.bankName || !input.accountNumber) {
            throw new Error("Bank name and account number required for non-cash accounts");
          }
        }
        return createBankAccount({
          userId: ctx.user.id,
          accountName: input.accountName,
          bankName: input.accountType === "cash" ? null : input.bankName || "",
          accountNumber: input.accountType === "cash" ? null : input.accountNumber || "",
          accountType: input.accountType,
          balance: input.balance,
          currency: input.currency
        });
      })
    }),
    creditCards: router({
      list: protectedProcedure.query(async ({ ctx }) => {
        return getCreditCardsByUserId(ctx.user.id);
      }),
      create: protectedProcedure.input(z2.object({
        cardName: z2.string().min(1),
        cardBrand: z2.enum(["visa", "mastercard", "amex", "elo", "other"]),
        cardNumber: z2.string().min(1),
        cardHolder: z2.string().min(1),
        expiryMonth: z2.number().optional(),
        expiryYear: z2.number().optional(),
        cvv: z2.string().optional(),
        creditLimit: z2.string().optional(),
        dueDay: z2.number().optional()
      })).mutation(async ({ ctx, input }) => {
        return createCreditCard({
          userId: ctx.user.id,
          ...input
        });
      })
    }),
    digitalWallets: router({
      list: protectedProcedure.query(async ({ ctx }) => {
        return getDigitalWalletsByUserId(ctx.user.id);
      }),
      create: protectedProcedure.input(z2.object({
        walletName: z2.string().min(1),
        walletType: z2.enum(["pix", "paypal", "stripe", "other"]),
        balance: z2.string().optional(),
        currency: z2.string().optional()
      })).mutation(async ({ ctx, input }) => {
        return createDigitalWallet({
          userId: ctx.user.id,
          ...input
        });
      })
    }),
    transactions: router({
      list: protectedProcedure.query(async ({ ctx }) => {
        return getFinancialTransactionsByUserId(ctx.user.id);
      }),
      create: protectedProcedure.input(z2.object({
        transactionType: z2.enum(["income", "expense"]),
        paymentMethod: z2.enum(["cash", "pix", "debit", "credit", "transfer"]),
        accountId: z2.number().optional(),
        walletId: z2.number().optional(),
        creditCardId: z2.number().optional(),
        amount: z2.string().min(1),
        description: z2.string().optional(),
        category: z2.string().optional(),
        clientId: z2.number().optional(),
        supplierId: z2.number().optional(),
        productId: z2.number().optional(),
        installments: z2.number().optional(),
        transactionDate: z2.union([z2.string(), z2.date()]),
        dueDate: z2.string().optional(),
        notes: z2.string().optional()
      })).mutation(async ({ ctx, input }) => {
        const { transactionDate, dueDate, ...rest } = input;
        const txDate = typeof transactionDate === "string" ? new Date(transactionDate) : transactionDate;
        return createFinancialTransaction({
          userId: ctx.user.id,
          transactionDate: txDate,
          dueDate: dueDate ? new Date(dueDate) : void 0,
          ...rest
        });
      })
    }),
    totalBalance: protectedProcedure.query(async ({ ctx }) => {
      return getTotalBalance(ctx.user.id);
    }),
    getCashFlowData: protectedProcedure.query(async ({ ctx }) => {
      const transactions = await getFinancialTransactionsByUserId(ctx.user.id);
      const monthlyData = {};
      const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
      const today = /* @__PURE__ */ new Date();
      for (let i = 5; i >= 0; i--) {
        const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
        const monthName = monthNames[date.getMonth()];
        monthlyData[monthKey] = { mes: monthName, entradas: 0, saidas: 0 };
      }
      transactions.forEach((tx) => {
        const txDate = new Date(tx.transactionDate);
        const monthKey = `${txDate.getFullYear()}-${String(txDate.getMonth() + 1).padStart(2, "0")}`;
        if (monthlyData[monthKey]) {
          const amount = parseFloat(tx.amount) || 0;
          if (tx.transactionType === "income") {
            monthlyData[monthKey].entradas += amount;
          } else {
            monthlyData[monthKey].saidas += amount;
          }
        }
      });
      return Object.values(monthlyData).map((data) => ({
        ...data,
        tendencia: data.entradas - data.saidas
      }));
    }),
    cashBox: router({
      getBalance: protectedProcedure.query(async ({ ctx }) => {
        return getCashBox(ctx.user.id);
      }),
      getHistory: protectedProcedure.query(async ({ ctx }) => {
        const transactions = await getFinancialTransactionsByUserId(ctx.user.id);
        return transactions.filter((tx) => tx.paymentMethod === "cash");
      })
    })
  }),
  // ============ Tasks Router ============
  tasks: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return getTasksByUserId(ctx.user.id);
    }),
    create: protectedProcedure.input(z2.object({
      title: z2.string().min(1),
      description: z2.string().optional(),
      dueDate: z2.date(),
      completed: z2.boolean().optional(),
      priority: z2.enum(["low", "medium", "high"]).optional(),
      assignedTo: z2.number().optional(),
      clientId: z2.number().optional(),
      actionType: z2.enum(["reuniao", "visita", "trabalho"]).optional()
    })).mutation(async ({ ctx, input }) => {
      return createTask({
        userId: ctx.user.id,
        ...input
      });
    }),
    update: protectedProcedure.input(z2.object({
      id: z2.number(),
      title: z2.string().optional(),
      description: z2.string().optional(),
      dueDate: z2.date().optional(),
      completed: z2.boolean().optional(),
      priority: z2.enum(["low", "medium", "high"]).optional(),
      assignedTo: z2.number().optional(),
      clientId: z2.number().optional(),
      actionType: z2.enum(["reuniao", "visita", "trabalho"]).optional()
    })).mutation(async ({ input }) => {
      const { id, ...data } = input;
      return updateTask(id, data);
    }),
    delete: protectedProcedure.input(z2.object({ id: z2.number() })).mutation(async ({ input }) => {
      return deleteTask(input.id);
    })
  }),
  // ============ Teams Router ============
  teams: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return getTeamsByUserId(ctx.user.id);
    }),
    create: protectedProcedure.input(z2.object({
      name: z2.string().min(1),
      description: z2.string().optional(),
      members: z2.string().optional()
    })).mutation(async ({ ctx, input }) => {
      return createTeam({
        userId: ctx.user.id,
        ...input
      });
    }),
    update: protectedProcedure.input(z2.object({
      id: z2.number(),
      name: z2.string().optional(),
      description: z2.string().optional(),
      members: z2.string().optional()
    })).mutation(async ({ input }) => {
      const { id, ...data } = input;
      return updateTeam(id, data);
    }),
    delete: protectedProcedure.input(z2.object({ id: z2.number() })).mutation(async ({ input }) => {
      return deleteTeam(input.id);
    })
  }),
  // ============ Supplier Purchases Router ============
  supplierPurchases: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return getSupplierPurchasesByUserId(ctx.user.id);
    }),
    create: protectedProcedure.input(z2.object({
      supplierId: z2.number(),
      description: z2.string().min(1),
      amount: z2.string().min(1),
      purchaseDate: z2.date(),
      dueDate: z2.date(),
      notes: z2.string().optional()
    })).mutation(async ({ ctx, input }) => {
      const purchase = await createSupplierPurchase({
        userId: ctx.user.id,
        supplierId: input.supplierId,
        description: input.description,
        amount: input.amount,
        purchaseDate: input.purchaseDate,
        dueDate: input.dueDate,
        paymentStatus: "pending",
        notes: input.notes
      });
      try {
        const supplier = await getSupplierById(input.supplierId);
        if (supplier && purchase) {
          await createSupplierPaymentEvent(ctx.user.id, purchase, supplier);
        }
      } catch (error) {
        console.error("[SupplierPurchases] Failed to create calendar event:", error);
      }
      return purchase;
    }),
    update: protectedProcedure.input(z2.object({
      id: z2.number(),
      description: z2.string().optional(),
      amount: z2.string().optional(),
      purchaseDate: z2.date().optional(),
      dueDate: z2.date().optional(),
      paymentStatus: z2.enum(["pending", "paid", "cancelled"]).optional(),
      paidDate: z2.date().optional(),
      accountId: z2.number().optional(),
      notes: z2.string().optional()
    })).mutation(async ({ ctx, input }) => {
      const { id, accountId, ...data } = input;
      const purchase = await getSupplierPurchaseById(id);
      const result = await updateSupplierPurchase(id, data);
      if (data.dueDate && purchase && purchase.calendarEventId) {
        try {
          const supplier = await getSupplierById(purchase.supplierId);
          if (supplier) {
            await updateSupplierPaymentEvent(
              purchase.calendarEventId,
              { ...purchase, dueDate: data.dueDate },
              supplier
            );
          }
        } catch (error) {
          console.error("[SupplierPurchases] Failed to update calendar event:", error);
        }
      }
      if (data.paymentStatus === "paid" && accountId) {
        await createFinancialTransaction({
          userId: ctx.user.id,
          transactionType: "expense",
          paymentMethod: "transfer",
          accountId,
          amount: input.amount || "0",
          description: "Pagamento a fornecedor",
          category: "Fornecedores",
          status: "completed",
          transactionDate: /* @__PURE__ */ new Date()
        });
      }
      return result;
    }),
    delete: protectedProcedure.input(z2.object({ id: z2.number() })).mutation(async ({ input, ctx }) => {
      const purchase = await getSupplierPurchaseById(input.id);
      if (purchase && purchase.calendarEventId) {
        try {
          await removeSupplierPaymentEvent(purchase.calendarEventId);
        } catch (error) {
          console.error("[SupplierPurchases] Failed to remove calendar event:", error);
        }
      }
      return deleteSupplierPurchase(input.id);
    }),
    pay: protectedProcedure.input(z2.object({
      purchaseId: z2.number(),
      amount: z2.string().optional(),
      paymentDate: z2.date().optional(),
      paymentMethod: z2.enum(["cash", "pix", "debit", "credit", "transfer"]).optional(),
      accountId: z2.number().optional(),
      notes: z2.string().optional()
    })).mutation(async ({ ctx, input }) => {
      const purchase = await getSupplierPurchaseById(input.purchaseId);
      if (!purchase) {
        throw new Error("Compra n\xE3o encontrada");
      }
      const paymentAmount = input.amount || purchase.amount.toString();
      const paymentDate = input.paymentDate || /* @__PURE__ */ new Date();
      await updateSupplierPurchase(input.purchaseId, {
        paymentStatus: "paid",
        paidDate: paymentDate
      });
      await createFinancialTransaction({
        userId: ctx.user.id,
        transactionType: "expense",
        paymentMethod: input.paymentMethod || "transfer",
        accountId: input.accountId,
        amount: paymentAmount,
        description: `Pagamento: ${purchase.description}`,
        category: "Fornecedores",
        supplierId: purchase.supplierId,
        status: "completed",
        transactionDate: paymentDate,
        notes: input.notes || `Pagamento de compra a prazo do fornecedor`
      });
      if (purchase.calendarEventId) {
        try {
          await removeSupplierPaymentEvent(purchase.calendarEventId);
        } catch (error) {
          console.error("[SupplierPurchases] Failed to remove calendar event:", error);
        }
      }
      return { success: true, message: "Pagamento registrado com sucesso" };
    }),
    syncCalendarEvents: protectedProcedure.mutation(async ({ ctx }) => {
      try {
        const purchases = await getPendingSupplierPurchasesByUserId(ctx.user.id);
        let created = 0;
        for (const purchase of purchases) {
          if (purchase.calendarEventId) continue;
          const supplier = await getSupplierById(purchase.supplierId);
          if (supplier) {
            await createSupplierPaymentEvent(ctx.user.id, purchase, supplier);
            created++;
          }
        }
        return { success: true, message: `${created} eventos de pagamento sincronizados` };
      } catch (error) {
        console.error("[SupplierPurchases] Failed to sync calendar events:", error);
        throw error;
      }
    })
  }),
  // ============ Loans Router ============
  loans: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return getLoansByUserId(ctx.user.id);
    }),
    getInstallmentsForCalendar: protectedProcedure.query(async ({ ctx }) => {
      return getInstallmentsForCalendar(ctx.user.id);
    }),
    create: protectedProcedure.input(z2.object({
      clientId: z2.number(),
      type: z2.enum(["lent", "borrowed"]),
      initialAmount: z2.string(),
      accountId: z2.number().optional(),
      interestRate: z2.string().default("0"),
      isInstallment: z2.boolean().default(false),
      numberOfInstallments: z2.number().optional(),
      frequency: z2.string().default("monthly")
    })).mutation(async ({ ctx, input }) => {
      const initialAmount = parseFloat(input.initialAmount);
      let totalWithInterest = initialAmount;
      let remainingBalance = initialAmount;
      if (input.interestRate) {
        const rate = parseFloat(input.interestRate);
        totalWithInterest = initialAmount * (1 + rate / 100);
        remainingBalance = totalWithInterest;
        console.log(`[Loans] Juros Simples: ${initialAmount} * (1 + ${rate}%) = ${totalWithInterest}`);
      }
      const result = await createLoan({
        userId: ctx.user.id,
        clientId: input.clientId,
        accountId: input.accountId,
        type: input.type,
        initialAmount: initialAmount.toString(),
        interestRate: input.interestRate,
        isInstallment: input.isInstallment,
        numberOfInstallments: input.numberOfInstallments,
        frequency: input.frequency,
        totalWithInterest: totalWithInterest.toString(),
        remainingBalance: remainingBalance.toString(),
        status: "active"
      });
      console.log("[Loans] Create result:", result);
      console.log("[Loans] Result keys:", Object.keys(result));
      if (input.accountId) {
        const isIncome = input.type === "borrowed";
        await createFinancialTransaction({
          userId: ctx.user.id,
          transactionType: isIncome ? "income" : "expense",
          paymentMethod: "transfer",
          accountId: input.accountId,
          amount: input.initialAmount,
          description: isIncome ? "Emprestimo recebido" : "Emprestimo concedido",
          category: "Emprestimos",
          status: "completed",
          transactionDate: /* @__PURE__ */ new Date()
        });
      }
      console.log("[Loans] isInstallment:", input.isInstallment, "numberOfInstallments:", input.numberOfInstallments);
      if (input.isInstallment && input.numberOfInstallments && input.numberOfInstallments > 0) {
        const installmentAmount = totalWithInterest / input.numberOfInstallments;
        const installments = [];
        const startDate = /* @__PURE__ */ new Date();
        let loanId = 0;
        console.log("[Loans] Result type:", typeof result, "Result:", JSON.stringify(result));
        if (Array.isArray(result) && result.length > 0 && result[0].insertId) {
          loanId = Number(result[0].insertId);
          console.log("[Loans] Got loanId from result[0].insertId:", loanId);
        } else if (result.insertId) {
          loanId = Number(result.insertId);
          console.log("[Loans] Got loanId from insertId:", loanId);
        } else if (result[0]?.id) {
          loanId = result[0].id;
          console.log("[Loans] Got loanId from result[0].id:", loanId);
        } else if (Array.isArray(result) && result.length > 0) {
          loanId = result[0].id;
          console.log("[Loans] Got loanId from Array:", loanId);
        }
        if (!loanId || loanId === 0) {
          console.log("[Loans] Attempting to get loanId from database query...");
          const latestLoans = await getLoansByUserId(ctx.user.id);
          if (latestLoans && latestLoans.length > 0) {
            loanId = latestLoans[0].id;
            console.log("[Loans] Got loanId from database query:", loanId);
          }
        }
        console.log("[Loans] Final loanId for installments:", loanId);
        if (!loanId || loanId === 0) {
          console.error("[Loans] ERROR: Could not extract loanId from result!");
          throw new Error("Failed to get loan ID for creating installments");
        }
        for (let i = 1; i <= input.numberOfInstallments; i++) {
          const dueDate = new Date(startDate);
          dueDate.setMonth(dueDate.getMonth() + i);
          const validDueDate = new Date(dueDate.getTime());
          installments.push({
            loanId,
            installmentNumber: i,
            dueDate: validDueDate,
            amount: installmentAmount.toFixed(2),
            status: "pending"
          });
        }
        console.log("[Loans] Installments to create:", JSON.stringify(installments));
        if (installments.length > 0) {
          try {
            const createResult = await createLoanInstallments(installments);
            console.log("[Loans] Installments created successfully:", createResult);
          } catch (error) {
            console.error("[Loans] Error creating installments:", error);
            throw error;
          }
        }
      } else {
        console.log("[Loans] Skipping installments: isInstallment=", input.isInstallment, "numberOfInstallments=", input.numberOfInstallments);
      }
      return result;
    }),
    update: protectedProcedure.input(z2.object({
      id: z2.number(),
      status: z2.enum(["active", "completed", "overdue"]).optional(),
      totalPaid: z2.string().optional(),
      remainingBalance: z2.string().optional()
    })).mutation(async ({ ctx, input }) => {
      return updateLoan(input.id, {
        status: input.status,
        totalPaid: input.totalPaid,
        remainingBalance: input.remainingBalance
      });
    }),
    delete: protectedProcedure.input(z2.object({ id: z2.number() })).mutation(async ({ ctx, input }) => {
      return deleteLoan(input.id);
    }),
    getInstallments: protectedProcedure.input(z2.object({ loanId: z2.number() })).query(async ({ input }) => {
      return getLoanInstallments(input.loanId);
    }),
    recordPayment: protectedProcedure.input(z2.object({
      loanId: z2.number(),
      amount: z2.string(),
      paymentType: z2.enum(["full", "partial"]),
      accountId: z2.number().optional(),
      notes: z2.string().optional(),
      installmentIds: z2.array(z2.number()).optional(),
      installmentId: z2.number().optional()
    })).mutation(async ({ ctx, input }) => {
      const paidAmount = parseFloat(input.amount);
      const payment = await createLoanPayment({
        loanId: input.loanId,
        amount: input.amount,
        paymentType: input.paymentType,
        notes: input.notes
      });
      if (input.paymentType === "partial" && input.installmentId) {
        const loan2 = await getLoanById(input.loanId);
        if (loan2) {
          const interestRate = parseFloat(loan2.interestRate?.toString() || "0");
          await handlePartialLoanPayment({
            loanId: input.loanId,
            installmentId: input.installmentId,
            paidAmount,
            interestRate
          });
        }
      } else if (input.installmentIds && input.installmentIds.length > 0) {
        for (const installmentId of input.installmentIds) {
          const installment = await getLoanInstallmentById(installmentId);
          if (installment) {
            await updateLoanInstallment(installmentId, {
              status: "paid",
              paidAmount: installment.amount,
              paidAt: /* @__PURE__ */ new Date()
            });
          }
        }
      }
      if (input.accountId) {
        await createFinancialTransaction({
          userId: ctx.user.id,
          transactionType: "income",
          paymentMethod: "transfer",
          accountId: input.accountId,
          amount: input.amount,
          description: `Pagamento de emprestimo - ${input.paymentType === "full" ? "Pagamento completo" : "Pagamento parcial"}`,
          category: "Emprestimos",
          status: "completed",
          transactionDate: /* @__PURE__ */ new Date()
        });
      }
      const loan = await getLoanById(input.loanId);
      if (loan) {
        const remainingBalance = String(loan.remainingBalance || "0");
        const totalPaid = String(loan.totalPaid || "0");
        const newRemainingBalance = (parseFloat(remainingBalance) - parseFloat(input.amount)).toString();
        const newTotalPaid = (parseFloat(totalPaid) + parseFloat(input.amount)).toString();
        await updateLoan(input.loanId, {
          remainingBalance: newRemainingBalance,
          totalPaid: newTotalPaid,
          status: parseFloat(newRemainingBalance) <= 0 ? "completed" : "active"
        });
      }
      return payment;
    }),
    getPayments: protectedProcedure.input(z2.object({ loanId: z2.number() })).query(async ({ input }) => {
      return getLoanPayments(input.loanId);
    })
  }),
  // ============ Calendar Router ============
  calendar: router({
    events: protectedProcedure.query(async ({ ctx }) => {
      return getCalendarEvents(ctx.user.id);
    })
  }),
  // ============ Dashboard Router ============
  dashboard: router({
    metrics: protectedProcedure.query(async ({ ctx }) => {
      return getDashboardMetrics(ctx.user.id);
    }),
    tasksStatistics: protectedProcedure.input(z2.object({ teamId: z2.number().optional() })).query(async ({ ctx, input }) => {
      return getTasksStatistics(ctx.user.id, input.teamId);
    }),
    tasksCompletedByWeek: protectedProcedure.input(z2.object({ teamId: z2.number().optional() })).query(async ({ ctx, input }) => {
      return getTasksCompletedByWeek(ctx.user.id, input.teamId);
    }),
    memberProductivity: protectedProcedure.input(z2.object({ teamId: z2.number() })).query(async ({ input }) => {
      return getMemberProductivity(input.teamId);
    }),
    financialSummary: protectedProcedure.query(async ({ ctx }) => {
      return getFinancialSummary(ctx.user.id);
    })
  }),
  // ============ Team Tasks Router ============
  teamTasks: router({
    getMembers: protectedProcedure.input(z2.object({ teamId: z2.number() })).query(async ({ input }) => {
      return getTeamMembers(input.teamId);
    }),
    addMember: protectedProcedure.input(z2.object({
      teamId: z2.number(),
      userId: z2.number(),
      role: z2.enum(["admin", "member"])
    })).mutation(async ({ input }) => {
      return addTeamMember(input.teamId, input.userId, input.role);
    }),
    removeMember: protectedProcedure.input(z2.object({
      teamId: z2.number(),
      userId: z2.number()
    })).mutation(async ({ input }) => {
      return removeTeamMember(input.teamId, input.userId);
    }),
    getTasks: protectedProcedure.input(z2.object({ teamId: z2.number() })).query(async ({ input }) => {
      return getTeamTasks(input.teamId);
    }),
    createTask: protectedProcedure.input(z2.object({
      teamId: z2.number(),
      title: z2.string().min(1),
      description: z2.string().optional(),
      assignedTo: z2.number(),
      startDate: z2.date().optional(),
      dueDate: z2.date()
    })).mutation(async ({ ctx, input }) => {
      return createTeamTask({
        teamId: input.teamId,
        title: input.title,
        description: input.description,
        assignedTo: input.assignedTo,
        startDate: input.startDate,
        dueDate: input.dueDate,
        createdBy: ctx.user.id
      });
    }),
    updateTaskStatus: protectedProcedure.input(z2.object({
      taskId: z2.number(),
      status: z2.enum(["pending", "in_progress", "completed"])
    })).mutation(async ({ input }) => {
      return updateTeamTaskStatus(input.taskId, input.status);
    }),
    deleteTask: protectedProcedure.input(z2.object({ taskId: z2.number() })).mutation(async ({ input }) => {
      return deleteTeamTask(input.taskId);
    }),
    getMessages: protectedProcedure.input(z2.object({ teamId: z2.number() })).query(async ({ input }) => {
      return getTeamMessages(input.teamId);
    }),
    sendMessage: protectedProcedure.input(z2.object({
      teamId: z2.number(),
      message: z2.string().min(1)
    })).mutation(async ({ ctx, input }) => {
      return createTeamMessage({
        teamId: input.teamId,
        userId: ctx.user.id,
        message: input.message
      });
    })
  }),
  // ============ Notifications Router ============
  notifications: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return getNotifications(ctx.user.id);
    }),
    getUnreadCount: protectedProcedure.query(async ({ ctx }) => {
      return getUnreadNotificationCount(ctx.user.id);
    }),
    markAsRead: protectedProcedure.input(z2.object({ id: z2.number() })).mutation(async ({ input }) => {
      return markNotificationAsRead(input.id);
    })
  }),
  // ============ Reports Router ============
  reports: router({
    getReportData: protectedProcedure.input(z2.object({
      teamId: z2.number().optional(),
      startDate: z2.date().optional(),
      endDate: z2.date().optional()
    })).query(async ({ ctx, input }) => {
      return getReportData(ctx.user.id, input.teamId, input.startDate, input.endDate);
    }),
    getOverdueTasks: protectedProcedure.input(z2.object({ teamId: z2.number().optional() })).query(async ({ ctx, input }) => {
      return getOverdueTasks(ctx.user.id, input.teamId);
    }),
    getFinancialAnomalies: protectedProcedure.query(async ({ ctx }) => {
      return getFinancialAnomalies(ctx.user.id);
    })
  }),
  // ============ PDV (Point of Sale) Router ============
  pdv: router({
    // Search products for quick lookup
    searchProducts: protectedProcedure.input(z2.object({
      query: z2.string().min(1)
    })).query(async ({ ctx, input }) => {
      return searchProductsForPdv(ctx.user.id, input.query);
    }),
    // Get product favorites/shortcuts
    getFavorites: protectedProcedure.query(async ({ ctx }) => {
      return getProductFavorites(ctx.user.id);
    }),
    // Add product to favorites
    addFavorite: protectedProcedure.input(z2.object({
      productId: z2.number(),
      position: z2.number().optional().default(0)
    })).mutation(async ({ ctx, input }) => {
      return addProductFavorite(ctx.user.id, input.productId, input.position);
    }),
    // Remove product from favorites
    removeFavorite: protectedProcedure.input(z2.object({
      productId: z2.number()
    })).mutation(async ({ ctx, input }) => {
      return removeProductFavorite(ctx.user.id, input.productId);
    }),
    // Create a complete sales order
    createOrder: protectedProcedure.input(z2.object({
      clientId: z2.number().optional(),
      sellerId: z2.number().optional(),
      items: z2.array(z2.object({
        productId: z2.number(),
        quantity: z2.number().min(1),
        unitPrice: z2.string(),
        discount: z2.string().optional().default("0"),
        discountType: z2.enum(["percentage", "fixed"]).optional().default("fixed"),
        subtotal: z2.string()
      })),
      subtotal: z2.string(),
      discount: z2.string().optional().default("0"),
      discountType: z2.enum(["percentage", "fixed"]).optional().default("fixed"),
      total: z2.string(),
      paymentMethod: z2.enum(["cash", "card", "pix", "check", "mixed"]),
      amountPaid: z2.string(),
      change: z2.string().optional().default("0"),
      notes: z2.string().optional()
    })).mutation(async ({ ctx, input }) => {
      const orderData = {
        userId: ctx.user.id,
        clientId: input.clientId || null,
        sellerId: input.sellerId || null,
        subtotal: input.subtotal,
        discount: input.discount,
        discountType: input.discountType,
        total: input.total,
        paymentMethod: input.paymentMethod,
        amountPaid: input.amountPaid,
        change: input.change,
        paymentStatus: "paid",
        notes: input.notes || null
      };
      const items = input.items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discount: item.discount,
        discountType: item.discountType,
        subtotal: item.subtotal
      }));
      return createSalesOrder(orderData, items);
    }),
    // Get sales order with items
    getOrder: protectedProcedure.input(z2.object({
      orderId: z2.number()
    })).query(async ({ input }) => {
      return getSalesOrderWithItems(input.orderId);
    }),
    // Get sales orders for user
    listOrders: protectedProcedure.input(z2.object({
      limit: z2.number().optional().default(50)
    })).query(async ({ ctx, input }) => {
      return getSalesOrdersByUserId(ctx.user.id, input.limit);
    }),
    // Update order status
    updateOrderStatus: protectedProcedure.input(z2.object({
      orderId: z2.number(),
      status: z2.enum(["pending", "paid", "cancelled"])
    })).mutation(async ({ input }) => {
      return updateSalesOrderStatus(input.orderId, input.status);
    })
  }),
  // ============ Expense Categories Router ============
  expenseCategories: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return getExpenseCategoriesByUserId(ctx.user.id);
    }),
    create: protectedProcedure.input(z2.object({
      name: z2.string().min(1).max(100),
      icon: z2.string().optional(),
      color: z2.string().optional()
    })).mutation(async ({ ctx, input }) => {
      const existing = await getExpenseCategoriesByUserId(ctx.user.id);
      const isDuplicate = existing.some(
        (cat) => cat.nameLower === input.name.toLowerCase()
      );
      if (isDuplicate) {
        throw new Error(`Categoria "${input.name}" j\xE1 existe`);
      }
      return createExpenseCategory({
        userId: ctx.user.id,
        name: input.name,
        icon: input.icon,
        color: input.color
      });
    }),
    delete: protectedProcedure.input(z2.object({ id: z2.number() })).mutation(async ({ ctx, input }) => {
      return deleteExpenseCategory(input.id, ctx.user.id);
    }),
    seedDefaults: protectedProcedure.mutation(async ({ ctx }) => {
      await seedDefaultExpenseCategories(ctx.user.id);
      return { success: true };
    })
  })
});

// server/_core/context.ts
async function createContext(opts) {
  let user = null;
  try {
    user = await sdk.authenticateRequest(opts.req);
  } catch (error) {
    user = null;
  }
  return {
    req: opts.req,
    res: opts.res,
    user
  };
}

// server/_core/vite.ts
import express from "express";
import fs2 from "fs";
import { nanoid } from "nanoid";
import path2 from "path";
import { createServer as createViteServer } from "vite";

// vite.config.ts
import { jsxLocPlugin } from "@builder.io/vite-plugin-jsx-loc";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import fs from "node:fs";
import path from "node:path";
import { defineConfig } from "vite";
import { vitePluginManusRuntime } from "vite-plugin-manus-runtime";
var PROJECT_ROOT = import.meta.dirname;
var LOG_DIR = path.join(PROJECT_ROOT, ".manus-logs");
var MAX_LOG_SIZE_BYTES = 1 * 1024 * 1024;
var TRIM_TARGET_BYTES = Math.floor(MAX_LOG_SIZE_BYTES * 0.6);
function ensureLogDir() {
  if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
  }
}
function trimLogFile(logPath, maxSize) {
  try {
    if (!fs.existsSync(logPath) || fs.statSync(logPath).size <= maxSize) {
      return;
    }
    const lines = fs.readFileSync(logPath, "utf-8").split("\n");
    const keptLines = [];
    let keptBytes = 0;
    const targetSize = TRIM_TARGET_BYTES;
    for (let i = lines.length - 1; i >= 0; i--) {
      const lineBytes = Buffer.byteLength(`${lines[i]}
`, "utf-8");
      if (keptBytes + lineBytes > targetSize) break;
      keptLines.unshift(lines[i]);
      keptBytes += lineBytes;
    }
    fs.writeFileSync(logPath, keptLines.join("\n"), "utf-8");
  } catch {
  }
}
function writeToLogFile(source, entries) {
  if (entries.length === 0) return;
  ensureLogDir();
  const logPath = path.join(LOG_DIR, `${source}.log`);
  const lines = entries.map((entry) => {
    const ts = (/* @__PURE__ */ new Date()).toISOString();
    return `[${ts}] ${JSON.stringify(entry)}`;
  });
  fs.appendFileSync(logPath, `${lines.join("\n")}
`, "utf-8");
  trimLogFile(logPath, MAX_LOG_SIZE_BYTES);
}
function vitePluginManusDebugCollector() {
  return {
    name: "manus-debug-collector",
    transformIndexHtml(html) {
      if (process.env.NODE_ENV === "production") {
        return html;
      }
      return {
        html,
        tags: [
          {
            tag: "script",
            attrs: {
              src: "/__manus__/debug-collector.js",
              defer: true
            },
            injectTo: "head"
          }
        ]
      };
    },
    configureServer(server) {
      server.middlewares.use("/__manus__/logs", (req, res, next) => {
        if (req.method !== "POST") {
          return next();
        }
        const handlePayload = (payload) => {
          if (payload.consoleLogs?.length > 0) {
            writeToLogFile("browserConsole", payload.consoleLogs);
          }
          if (payload.networkRequests?.length > 0) {
            writeToLogFile("networkRequests", payload.networkRequests);
          }
          if (payload.sessionEvents?.length > 0) {
            writeToLogFile("sessionReplay", payload.sessionEvents);
          }
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ success: true }));
        };
        const reqBody = req.body;
        if (reqBody && typeof reqBody === "object") {
          try {
            handlePayload(reqBody);
          } catch (e) {
            res.writeHead(400, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ success: false, error: String(e) }));
          }
          return;
        }
        let body = "";
        req.on("data", (chunk) => {
          body += chunk.toString();
        });
        req.on("end", () => {
          try {
            const payload = JSON.parse(body);
            handlePayload(payload);
          } catch (e) {
            res.writeHead(400, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ success: false, error: String(e) }));
          }
        });
      });
    }
  };
}
var plugins = [react(), tailwindcss(), jsxLocPlugin(), vitePluginManusRuntime(), vitePluginManusDebugCollector()];
var vite_config_default = defineConfig({
  plugins,
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  envDir: path.resolve(import.meta.dirname),
  root: path.resolve(import.meta.dirname, "client"),
  publicDir: path.resolve(import.meta.dirname, "client", "public"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    host: true,
    allowedHosts: [
      ".manuspre.computer",
      ".manus.computer",
      ".manus-asia.computer",
      ".manuscomputer.ai",
      ".manusvm.computer",
      "localhost",
      "127.0.0.1"
    ],
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/_core/vite.ts
async function setupVite(app, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    server: serverOptions,
    appType: "custom"
  });
  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "../..",
        "client",
        "index.html"
      );
      let template = await fs2.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app) {
  const distPath = process.env.NODE_ENV === "development" ? path2.resolve(import.meta.dirname, "../..", "dist", "public") : path2.resolve(import.meta.dirname, "public");
  if (!fs2.existsSync(distPath)) {
    console.error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app.use(express.static(distPath));
  app.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/_core/index.ts
function isPortAvailable(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}
async function findAvailablePort(startPort = 3e3) {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}
async function startServer() {
  const app = express2();
  const server = createServer(app);
  app.use(express2.json({ limit: "50mb" }));
  app.use(express2.urlencoded({ limit: "50mb", extended: true }));
  registerOAuthRoutes(app);
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext
    })
  );
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);
  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }
  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}
startServer().catch(console.error);
