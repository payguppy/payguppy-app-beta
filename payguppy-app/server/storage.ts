import { 
  type User, 
  type InsertUser,
  type Merchant,
  type InsertMerchant,
  type PaymentChannel,
  type InsertPaymentChannel,
  type Wallet,
  type InsertWallet,
  type Payment,
  type InsertPayment
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Merchants
  getMerchant(id: string): Promise<Merchant | undefined>;
  getMerchantsByUserId(userId: string): Promise<Merchant[]>;
  createMerchant(merchant: InsertMerchant): Promise<Merchant>;

  // Payment Channels
  getPaymentChannel(id: string): Promise<PaymentChannel | undefined>;
  getPaymentChannelsByMerchantId(merchantId: string): Promise<PaymentChannel[]>;
  createPaymentChannel(channel: InsertPaymentChannel): Promise<PaymentChannel>;
  updatePaymentChannel(id: string, updates: Partial<PaymentChannel>): Promise<PaymentChannel | undefined>;

  // Wallets
  getWallet(id: string): Promise<Wallet | undefined>;
  getWalletsByUserId(userId: string): Promise<Wallet[]>;
  createWallet(wallet: InsertWallet): Promise<Wallet>;
  updateWallet(id: string, updates: Partial<Wallet>): Promise<Wallet | undefined>;

  // Payments
  getPayment(id: string): Promise<Payment | undefined>;
  getPaymentsByMerchantId(merchantId: string): Promise<Payment[]>;
  createPayment(payment: InsertPayment): Promise<Payment>;
  updatePayment(id: string, updates: Partial<Payment>): Promise<Payment | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private merchants: Map<string, Merchant>;
  private paymentChannels: Map<string, PaymentChannel>;
  private wallets: Map<string, Wallet>;
  private payments: Map<string, Payment>;

  constructor() {
    this.users = new Map();
    this.merchants = new Map();
    this.paymentChannels = new Map();
    this.wallets = new Map();
    this.payments = new Map();
  }

  // Users
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Merchants
  async getMerchant(id: string): Promise<Merchant | undefined> {
    return this.merchants.get(id);
  }

  async getMerchantsByUserId(userId: string): Promise<Merchant[]> {
    return Array.from(this.merchants.values()).filter(
      (merchant) => merchant.userId === userId
    );
  }

  async createMerchant(insertMerchant: InsertMerchant): Promise<Merchant> {
    const id = randomUUID();
    const merchant: Merchant = { 
      ...insertMerchant, 
      id,
      description: insertMerchant.description || null,
      logoUrl: insertMerchant.logoUrl || null
    };
    this.merchants.set(id, merchant);
    return merchant;
  }

  // Payment Channels
  async getPaymentChannel(id: string): Promise<PaymentChannel | undefined> {
    return this.paymentChannels.get(id);
  }

  async getPaymentChannelsByMerchantId(merchantId: string): Promise<PaymentChannel[]> {
    return Array.from(this.paymentChannels.values()).filter(
      (channel) => channel.merchantId === merchantId
    );
  }

  async createPaymentChannel(insertChannel: InsertPaymentChannel): Promise<PaymentChannel> {
    const id = randomUUID();
    const channel: PaymentChannel = { 
      ...insertChannel, 
      id,
      currency: insertChannel.currency || "USD",
      isActive: true,
      transactionFee: insertChannel.transactionFee || "1.00",
      autoAccept: insertChannel.autoAccept || false,
      createdAt: new Date()
    };
    this.paymentChannels.set(id, channel);
    return channel;
  }

  async updatePaymentChannel(id: string, updates: Partial<PaymentChannel>): Promise<PaymentChannel | undefined> {
    const existing = this.paymentChannels.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...updates };
    this.paymentChannels.set(id, updated);
    return updated;
  }

  // Wallets
  async getWallet(id: string): Promise<Wallet | undefined> {
    return this.wallets.get(id);
  }

  async getWalletsByUserId(userId: string): Promise<Wallet[]> {
    return Array.from(this.wallets.values()).filter(
      (wallet) => wallet.userId === userId
    );
  }

  async createWallet(insertWallet: InsertWallet): Promise<Wallet> {
    const id = randomUUID();
    const wallet: Wallet = { 
      ...insertWallet, 
      id,
      isConnected: false,
      balance: "0"
    };
    this.wallets.set(id, wallet);
    return wallet;
  }

  async updateWallet(id: string, updates: Partial<Wallet>): Promise<Wallet | undefined> {
    const existing = this.wallets.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...updates };
    this.wallets.set(id, updated);
    return updated;
  }

  // Payments
  async getPayment(id: string): Promise<Payment | undefined> {
    return this.payments.get(id);
  }

  async getPaymentsByMerchantId(merchantId: string): Promise<Payment[]> {
    return Array.from(this.payments.values()).filter(
      (payment) => payment.merchantId === merchantId
    );
  }

  async createPayment(insertPayment: InsertPayment): Promise<Payment> {
    const id = randomUUID();
    const payment: Payment = { 
      ...insertPayment, 
      id,
      status: "pending",
      memo: insertPayment.memo || null,
      txHash: null,
      walletAddress: insertPayment.walletAddress || null,
      createdAt: new Date()
    };
    this.payments.set(id, payment);
    return payment;
  }

  async updatePayment(id: string, updates: Partial<Payment>): Promise<Payment | undefined> {
    const existing = this.payments.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...updates };
    this.payments.set(id, updated);
    return updated;
  }
}

export const storage = new MemStorage();
