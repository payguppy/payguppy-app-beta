import { sql } from "drizzle-orm";
import { pgTable, text, varchar, decimal, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
});

export const merchants = pgTable("merchants", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  logoUrl: text("logo_url"),
});

export const paymentChannels = pgTable("payment_channels", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  merchantId: varchar("merchant_id").notNull(),
  name: text("name").notNull(),
  walletAddress: text("wallet_address").notNull(),
  currency: text("currency").notNull().default("USD"),
  isActive: boolean("is_active").notNull().default(true),
  transactionFee: decimal("transaction_fee", { precision: 5, scale: 2 }).default("1.00"),
  autoAccept: boolean("auto_accept").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const wallets = pgTable("wallets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  name: text("name").notNull(),
  address: text("address").notNull(),
  network: text("network").notNull(),
  walletType: text("wallet_type").notNull(), // software, hardware, multisig
  isConnected: boolean("is_connected").notNull().default(false),
  balance: decimal("balance", { precision: 20, scale: 8 }).default("0"),
});

export const payments = pgTable("payments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  orderId: text("order_id").notNull().unique(),
  merchantId: varchar("merchant_id").notNull(),
  channelId: varchar("channel_id").notNull(),
  amount: decimal("amount", { precision: 20, scale: 8}).notNull(),
  currency: text("currency").notNull(),
  blockchain: text("blockchain").notNull(),
  token: text("token").notNull(),
  status: text("status").notNull().default("pending"), // pending, completed, failed
  memo: text("memo"),
  txHash: text("tx_hash"),
  walletAddress: text("wallet_address"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
});

export const insertMerchantSchema = createInsertSchema(merchants).pick({
  userId: true,
  name: true,
  description: true,
  logoUrl: true,
});

export const insertPaymentChannelSchema = createInsertSchema(paymentChannels).pick({
  merchantId: true,
  name: true,
  walletAddress: true,
  currency: true,
  transactionFee: true,
  autoAccept: true,
});

export const insertWalletSchema = createInsertSchema(wallets).pick({
  userId: true,
  name: true,
  address: true,
  network: true,
  walletType: true,
});

export const insertPaymentSchema = createInsertSchema(payments).pick({
  orderId: true,
  merchantId: true,
  channelId: true,
  amount: true,
  currency: true,
  blockchain: true,
  token: true,
  memo: true,
  walletAddress: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertMerchant = z.infer<typeof insertMerchantSchema>;
export type Merchant = typeof merchants.$inferSelect;

export type InsertPaymentChannel = z.infer<typeof insertPaymentChannelSchema>;
export type PaymentChannel = typeof paymentChannels.$inferSelect;

export type InsertWallet = z.infer<typeof insertWalletSchema>;
export type Wallet = typeof wallets.$inferSelect;

export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type Payment = typeof payments.$inferSelect;
