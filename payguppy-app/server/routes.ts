import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertMerchantSchema, 
  insertPaymentChannelSchema, 
  insertWalletSchema, 
  insertPaymentSchema 
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Merchants
  app.get("/api/merchants", async (req, res) => {
    try {
      const userId = req.query.userId as string;
      if (!userId) {
        return res.status(400).json({ message: "userId is required" });
      }
      
      const merchants = await storage.getMerchantsByUserId(userId);
      res.json(merchants);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch merchants" });
    }
  });

  app.post("/api/merchants", async (req, res) => {
    try {
      const validatedData = insertMerchantSchema.parse(req.body);
      const merchant = await storage.createMerchant(validatedData);
      res.status(201).json(merchant);
    } catch (error) {
      res.status(400).json({ message: "Invalid merchant data" });
    }
  });

  // Payment Channels
  app.get("/api/payment-channels", async (req, res) => {
    try {
      const merchantId = req.query.merchantId as string;
      if (!merchantId) {
        return res.status(400).json({ message: "merchantId is required" });
      }
      
      const channels = await storage.getPaymentChannelsByMerchantId(merchantId);
      res.json(channels);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch payment channels" });
    }
  });

  app.post("/api/payment-channels", async (req, res) => {
    try {
      const validatedData = insertPaymentChannelSchema.parse(req.body);
      const channel = await storage.createPaymentChannel(validatedData);
      res.status(201).json(channel);
    } catch (error) {
      res.status(400).json({ message: "Invalid payment channel data" });
    }
  });

  app.patch("/api/payment-channels/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const channel = await storage.updatePaymentChannel(id, updates);
      
      if (!channel) {
        return res.status(404).json({ message: "Payment channel not found" });
      }
      
      res.json(channel);
    } catch (error) {
      res.status(500).json({ message: "Failed to update payment channel" });
    }
  });

  // Wallets
  app.get("/api/wallets", async (req, res) => {
    try {
      const userId = req.query.userId as string;
      if (!userId) {
        return res.status(400).json({ message: "userId is required" });
      }
      
      const wallets = await storage.getWalletsByUserId(userId);
      res.json(wallets);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch wallets" });
    }
  });

  app.post("/api/wallets", async (req, res) => {
    try {
      const validatedData = insertWalletSchema.parse(req.body);
      const wallet = await storage.createWallet(validatedData);
      res.status(201).json(wallet);
    } catch (error) {
      res.status(400).json({ message: "Invalid wallet data" });
    }
  });

  app.patch("/api/wallets/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const wallet = await storage.updateWallet(id, updates);
      
      if (!wallet) {
        return res.status(404).json({ message: "Wallet not found" });
      }
      
      res.json(wallet);
    } catch (error) {
      res.status(500).json({ message: "Failed to update wallet" });
    }
  });

  // Payments
  app.get("/api/payments", async (req, res) => {
    try {
      const merchantId = req.query.merchantId as string;
      if (!merchantId) {
        return res.status(400).json({ message: "merchantId is required" });
      }
      
      const payments = await storage.getPaymentsByMerchantId(merchantId);
      res.json(payments);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch payments" });
    }
  });

  app.post("/api/payments", async (req, res) => {
    try {
      const validatedData = insertPaymentSchema.parse(req.body);
      const payment = await storage.createPayment(validatedData);
      res.status(201).json(payment);
    } catch (error) {
      res.status(400).json({ message: "Invalid payment data" });
    }
  });

  app.patch("/api/payments/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const payment = await storage.updatePayment(id, updates);
      
      if (!payment) {
        return res.status(404).json({ message: "Payment not found" });
      }
      
      res.json(payment);
    } catch (error) {
      res.status(500).json({ message: "Failed to update payment" });
    }
  });

  // Generate payment QR code data
  app.post("/api/generate-payment", async (req, res) => {
    try {
      const { merchantId, channelId, amount, currency } = req.body;
      
      if (!merchantId || !channelId || !amount) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      const orderId = `ORD${Date.now()}${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      
      const paymentData = {
        orderId,
        merchantId,
        channelId,
        amount,
        currency: currency || "USD",
        timestamp: Date.now()
      };

      res.json(paymentData);
    } catch (error) {
      res.status(500).json({ message: "Failed to generate payment" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
