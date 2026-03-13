import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal, boolean, datetime, index } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extended with role-based access control for admin and employee differentiation.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Clients table for storing customer information
 */
export const clients = mysqlTable("clients", {
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
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Client = typeof clients.$inferSelect;
export type InsertClient = typeof clients.$inferInsert;

/**
 * Products table for inventory management
 */
export const products = mysqlTable("products", {
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
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Product = typeof products.$inferSelect;
export type InsertProduct = typeof products.$inferInsert;

/**
 * Product output history table for tracking product exits
 */
export const productOutputHistory = mysqlTable("productOutputHistory", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  productId: int("productId").notNull(),
  quantity: int("quantity").notNull(),
  clientId: int("clientId"),
  outputDate: datetime("outputDate").notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ProductOutputHistory = typeof productOutputHistory.$inferSelect;
export type InsertProductOutputHistory = typeof productOutputHistory.$inferInsert;

/**
 * Suppliers table for vendor management
 */
export const suppliers = mysqlTable("suppliers", {
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
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Supplier = typeof suppliers.$inferSelect;
export type InsertSupplier = typeof suppliers.$inferInsert;

/**
 * Sales table for recording transactions
 */
export const sales = mysqlTable("sales", {
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
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Sale = typeof sales.$inferSelect;
export type InsertSale = typeof sales.$inferInsert;

/**
 * Financial records table for tracking income and expenses
 */
export const financialRecords = mysqlTable("financialRecords", {
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
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type FinancialRecord = typeof financialRecords.$inferSelect;
export type InsertFinancialRecord = typeof financialRecords.$inferInsert;

/**
 * Tasks/Calendar events table
 */
export const tasks = mysqlTable("tasks", {
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
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Task = typeof tasks.$inferSelect;
export type InsertTask = typeof tasks.$inferInsert;

/**
 * Teams/Groups table for team management
 */
export const teams = mysqlTable("teams", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  members: text("members"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Team = typeof teams.$inferSelect;
export type InsertTeam = typeof teams.$inferInsert;

/**
 * Supplier Purchases table for tracking purchases from suppliers
 */
export const supplierPurchases = mysqlTable("supplierPurchases", {
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
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SupplierPurchase = typeof supplierPurchases.$inferSelect;
export type InsertSupplierPurchase = typeof supplierPurchases.$inferInsert;

/**
 * Subscriptions table for future payment integration
 */
export const subscriptions = mysqlTable("subscriptions", {
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
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Subscription = typeof subscriptions.$inferSelect;
export type InsertSubscription = typeof subscriptions.$inferInsert;


/**
 * Bank Accounts table for storing bank account information
 */
export const bankAccounts = mysqlTable("bankAccounts", {
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
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type BankAccount = typeof bankAccounts.$inferSelect;
export type InsertBankAccount = typeof bankAccounts.$inferInsert;

/**
 * Digital Wallets table for storing digital wallet information (PIX, PayPal, etc)
 */
export const digitalWallets = mysqlTable("digitalWallets", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  walletName: varchar("walletName", { length: 255 }).notNull(),
  walletType: mysqlEnum("walletType", ["pix", "paypal", "stripe", "other"]).notNull(),
  balance: decimal("balance", { precision: 12, scale: 2 }).default("0"),
  currency: varchar("currency", { length: 3 }).default("BRL"),
  isActive: boolean("isActive").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type DigitalWallet = typeof digitalWallets.$inferSelect;
export type InsertDigitalWallet = typeof digitalWallets.$inferInsert;

/**
 * Credit Cards table for storing credit card information
 */
export const creditCards = mysqlTable("creditCards", {
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
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CreditCard = typeof creditCards.$inferSelect;
export type InsertCreditCard = typeof creditCards.$inferInsert;

/**
 * Financial Transactions table for recording all money movements
 */
export const financialTransactions = mysqlTable("financialTransactions", {
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
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type FinancialTransaction = typeof financialTransactions.$inferSelect;
export type InsertFinancialTransaction = typeof financialTransactions.$inferInsert;

/**
 * Installment Plans table for tracking credit card installments
 */
export const installmentPlans = mysqlTable("installmentPlans", {
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
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type InstallmentPlan = typeof installmentPlans.$inferSelect;
export type InsertInstallmentPlan = typeof installmentPlans.$inferInsert;


/**
 * Loans table for tracking loans (given or received)
 */
export const loans = mysqlTable("loans", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  clientId: int("clientId").notNull(),
  accountId: int("accountId"), // Conta bancária associada
  type: mysqlEnum("type", ["lent", "borrowed"]).notNull(), // "Emprestei dinheiro" or "Peguei empréstimo"
  initialAmount: decimal("initialAmount", { precision: 12, scale: 2 }).notNull(),
  interestRate: decimal("interestRate", { precision: 5, scale: 2 }).default("0"), // Taxa de juros em %
  isInstallment: boolean("isInstallment").default(false), // Parcelado ou não
  numberOfInstallments: int("numberOfInstallments"), // Número de parcelas (se parcelado)
  frequency: varchar("frequency", { length: 50 }).default("monthly"), // Frequência (mensal)
  totalWithInterest: decimal("totalWithInterest", { precision: 12, scale: 2 }), // Total com juros
  totalPaid: decimal("totalPaid", { precision: 12, scale: 2 }).default("0"),
  remainingBalance: decimal("remainingBalance", { precision: 12, scale: 2 }),
  status: mysqlEnum("status", ["active", "completed", "overdue"]).default("active"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Loan = typeof loans.$inferSelect;
export type InsertLoan = typeof loans.$inferInsert;

/**
 * Loan installments table for tracking individual payments
 */
export const loanInstallments = mysqlTable("loanInstallments", {
  id: int("id").autoincrement().primaryKey(),
  loanId: int("loanId").notNull(),
  installmentNumber: int("installmentNumber").notNull(),
  dueDate: timestamp("dueDate").notNull(),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  paidAmount: decimal("paidAmount", { precision: 12, scale: 2 }).default("0"),
  status: mysqlEnum("status", ["pending", "paid", "partially_paid", "overdue"]).default("pending"),
  paidAt: timestamp("paidAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type LoanInstallment = typeof loanInstallments.$inferSelect;
export type InsertLoanInstallment = typeof loanInstallments.$inferInsert;

/**
 * Loan payments table for tracking partial/full payments
 */
export const loanPayments = mysqlTable("loanPayments", {
  id: int("id").autoincrement().primaryKey(),
  loanId: int("loanId").notNull(),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  paymentType: mysqlEnum("paymentType", ["full", "partial"]).notNull(),
  paymentDate: timestamp("paymentDate").defaultNow().notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type LoanPayment = typeof loanPayments.$inferSelect;
export type InsertLoanPayment = typeof loanPayments.$inferInsert;


/**
 * Team members table
 */
export const teamMembers = mysqlTable("teamMembers", {
  id: int("id").autoincrement().primaryKey(),
  teamId: int("teamId").notNull(),
  userId: int("userId").notNull(),
  role: mysqlEnum("memberRole", ["admin", "member"]).default("member").notNull(),
  joinedAt: timestamp("joinedAt").defaultNow().notNull(),
});

export type TeamMember = typeof teamMembers.$inferSelect;
export type InsertTeamMember = typeof teamMembers.$inferInsert;

/**
 * Team tasks table
 */
export const teamTasks = mysqlTable("teamTasks", {
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
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type TeamTask = typeof teamTasks.$inferSelect;
export type InsertTeamTask = typeof teamTasks.$inferInsert;

/**
 * Team chat messages table
 */
export const teamMessages = mysqlTable("teamMessages", {
  id: int("id").autoincrement().primaryKey(),
  teamId: int("teamId").notNull(),
  userId: int("userId").notNull(),
  message: text("message").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type TeamMessage = typeof teamMessages.$inferSelect;
export type InsertTeamMessage = typeof teamMessages.$inferInsert;


/**
 * Notifications table
 */
export const notifications = mysqlTable("notifications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  notificationType: mysqlEnum("notificationType", ["task_assigned", "task_due", "task_completed", "message", "team_invite"]).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  relatedId: int("relatedId"), // Task ID, Message ID, etc
  read: boolean("read").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;

// Map type property for backward compatibility
export interface NotificationWithType extends Notification {
  type: Notification['notificationType'];
}

/**
 * Sales Orders table for PDV - represents a complete sale transaction
 */
export const salesOrders = mysqlTable("salesOrders", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  clientId: int("clientId"), // Optional - customer can be anonymous
  sellerId: int("sellerId"), // Optional - who made the sale
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
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SalesOrder = typeof salesOrders.$inferSelect;
export type InsertSalesOrder = typeof salesOrders.$inferInsert;

/**
 * Sales Order Items table - individual items in a sales order
 */
export const salesOrderItems = mysqlTable("salesOrderItems", {
  id: int("id").autoincrement().primaryKey(),
  salesOrderId: int("salesOrderId").notNull(),
  productId: int("productId").notNull(),
  quantity: int("quantity").notNull(),
  unitPrice: decimal("unitPrice", { precision: 10, scale: 2 }).notNull(),
  discount: decimal("discount", { precision: 10, scale: 2 }).default("0"),
  discountType: mysqlEnum("discountType", ["percentage", "fixed"]).default("fixed"),
  subtotal: decimal("subtotal", { precision: 12, scale: 2 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type SalesOrderItem = typeof salesOrderItems.$inferSelect;
export type InsertSalesOrderItem = typeof salesOrderItems.$inferInsert;

/**
 * Product Favorites table - for PDV shortcuts (mosaico)
 */
export const productFavorites = mysqlTable("productFavorites", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  productId: int("productId").notNull(),
  position: int("position").default(0), // For ordering in the grid
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ProductFavorite = typeof productFavorites.$inferSelect;
export type InsertProductFavorite = typeof productFavorites.$inferInsert;

/**
 * Cash Box table - for tracking physical cash/money in hand
 */
export const cashBox = mysqlTable("cashBox", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  balance: decimal("balance", { precision: 12, scale: 2 }).default("0"),
  currency: varchar("currency", { length: 3 }).default("BRL"),
  lastUpdated: timestamp("lastUpdated").defaultNow().onUpdateNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type CashBox = typeof cashBox.$inferSelect;
export type InsertCashBox = typeof cashBox.$inferInsert;


/**
 * Expense Categories table for storing user-created expense categories
 */
export const expenseCategories = mysqlTable("expenseCategories", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  nameLower: varchar("nameLower", { length: 100 }).notNull(), // For case-insensitive duplicate checking
  icon: varchar("icon", { length: 50 }).default("tag"), // Icon name for UI
  color: varchar("color", { length: 7 }).default("#7c3aed"), // Hex color code
  usageCount: int("usageCount").default(0), // Track how many times this category is used
  isDefault: boolean("isDefault").default(false), // Mark default categories
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ExpenseCategory = typeof expenseCategories.$inferSelect;
export type InsertExpenseCategory = typeof expenseCategories.$inferInsert;
