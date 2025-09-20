import { sql } from "drizzle-orm";
import { pgTable, text, varchar, decimal, timestamp, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
});

export const accounts = pgTable("accounts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  type: text("type").notNull(), 
  balance: decimal("balance", { precision: 12, scale: 2 }).notNull().default("0"),
  accountNumber: text("account_number").notNull(),
});

export const transactions = pgTable("transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  accountId: varchar("account_id").notNull().references(() => accounts.id),
  type: text("type").notNull(), 
  category: text("category").notNull(),
  description: text("description").notNull(),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  date: timestamp("date").notNull().defaultNow(),
});

export const investments = pgTable("investments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  symbol: text("symbol").notNull(),
  name: text("name").notNull(),
  shares: decimal("shares", { precision: 12, scale: 4 }).notNull(),
  purchasePrice: decimal("purchase_price", { precision: 12, scale: 2 }).notNull(),
  currentPrice: decimal("current_price", { precision: 12, scale: 2 }).notNull(),
  purchaseDate: timestamp("purchase_date").notNull().defaultNow(),
});

export const loans = pgTable("loans", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  type: text("type").notNull(), 
  principal: decimal("principal", { precision: 12, scale: 2 }).notNull(),
  interestRate: decimal("interest_rate", { precision: 5, scale: 4 }).notNull(),
  termMonths: integer("term_months").notNull(),
  monthlyPayment: decimal("monthly_payment", { precision: 12, scale: 2 }).notNull(),
  remainingBalance: decimal("remaining_balance", { precision: 12, scale: 2 }).notNull(),
  startDate: timestamp("start_date").notNull().defaultNow(),
});

export const notifications = pgTable("notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  type: text("type").notNull(), 
  title: text("title").notNull(),
  message: text("message").notNull(),
  data: text("data"), 
  read: integer("read").notNull().default(0), 
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const availableAssets = pgTable("available_assets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  symbol: text("symbol").notNull().unique(),
  name: text("name").notNull(),
  type: text("type").notNull(), 
  sector: text("sector"),
  currentPrice: decimal("current_price", { precision: 10, scale: 2 }).notNull(),
  description: text("description"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").default(sql`now()`).notNull(),
  updatedAt: timestamp("updated_at").default(sql`now()`).notNull(),
});

export const investmentTransactions = pgTable("investment_transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  symbol: text("symbol").notNull(),
  transactionType: text("transaction_type").notNull(), 
  shares: decimal("shares", { precision: 10, scale: 4 }).notNull(),
  pricePerShare: decimal("price_per_share", { precision: 10, scale: 2 }).notNull(),
  totalAmount: decimal("total_amount", { precision: 12, scale: 2 }).notNull(),
  accountId: varchar("account_id").notNull().references(() => accounts.id),
  createdAt: timestamp("created_at").default(sql`now()`).notNull(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
});

export const insertAccountSchema = createInsertSchema(accounts).omit({
  id: true,
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
});

export const insertInvestmentSchema = createInsertSchema(investments).omit({
  id: true,
});

export const insertLoanSchema = createInsertSchema(loans).omit({
  id: true,
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
});

export const insertAvailableAssetSchema = createInsertSchema(availableAssets).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertInvestmentTransactionSchema = createInsertSchema(investmentTransactions).omit({
  id: true,
  createdAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertAccount = z.infer<typeof insertAccountSchema>;
export type Account = typeof accounts.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Transaction = typeof transactions.$inferSelect;
export type InsertInvestment = z.infer<typeof insertInvestmentSchema>;
export type Investment = typeof investments.$inferSelect;
export type InsertLoan = z.infer<typeof insertLoanSchema>;
export type Loan = typeof loans.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type Notification = typeof notifications.$inferSelect;
export type InsertAvailableAsset = z.infer<typeof insertAvailableAssetSchema>;
export type AvailableAsset = typeof availableAssets.$inferSelect;
export type InsertInvestmentTransaction = z.infer<typeof insertInvestmentTransactionSchema>;
export type InvestmentTransaction = typeof investmentTransactions.$inferSelect;

export type DashboardSummary = {
  totalBalance: string;
  totalInvestments: string;
  monthlyExpenses: string;
  activeLoanBalance: string;
  investmentGrowth: string;
  expenseVariation: string;
};
