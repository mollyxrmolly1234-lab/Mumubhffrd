import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupTelegramWebhook, requestOTP, verifyOTP } from "./telegram";
import {
  insertUserSchema,
  insertFundingRequestSchema,
  insertDataPurchaseSchema,
  insertAirtimePurchaseSchema,
  insertPaymentSettingsSchema,
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup Telegram webhook
  setupTelegramWebhook(app);

  // ============ Authentication Routes ============

  // Register new user
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { otp, referralCode, ...userData } = req.body;

      // Validate input
      const validatedData = insertUserSchema.parse(userData);

      // Verify OTP
      const isValidOTP = await verifyOTP(validatedData.phoneNumber, otp);
      if (!isValidOTP) {
        return res.status(400).json({ error: "Invalid or expired OTP" });
      }

      // Check if phone number already exists
      const existingUser = await storage.getUserByPhoneNumber(validatedData.phoneNumber);
      if (existingUser) {
        return res.status(400).json({ error: "Phone number already registered" });
      }

      // Check if username already exists
      const existingUsername = await storage.getUserByUsername(validatedData.username);
      if (existingUsername) {
        return res.status(400).json({ error: "Username already taken" });
      }

      // Handle referral
      let referredBy = null;
      if (referralCode) {
        const referrer = await storage.getUserByUsername(referralCode);
        if (!referrer) {
          // Try to find by referral code
          const allUsers = await storage.getUserTransactions("dummy"); // This is a hack, we need a better way
          // For now, we'll skip referral validation
        }
        referredBy = referralCode;
      }

      // Create user
      const user = await storage.createUser({
        ...validatedData,
        referredBy,
      });

      // If user was referred, update referrer's count
      if (referredBy) {
        // This will be handled in a separate endpoint for tracking referrals
      }

      // Create session (simplified - in production use proper session management)
      res.json({
        success: true,
        user: {
          id: user.id,
          username: user.username,
          phoneNumber: user.phoneNumber,
          balance: user.balance,
          referralCode: user.referralCode,
        },
      });
    } catch (error: any) {
      console.error("Registration error:", error);
      res.status(400).json({ error: error.message || "Registration failed" });
    }
  });

  // Request OTP
  app.post("/api/auth/request-otp", async (req, res) => {
    try {
      const { phoneNumber } = req.body;

      if (!phoneNumber || !phoneNumber.match(/^\+234\d{10}$/)) {
        return res.status(400).json({ error: "Invalid phone number" });
      }

      const result = await requestOTP(phoneNumber);
      res.json(result);
    } catch (error: any) {
      console.error("OTP request error:", error);
      res.status(500).json({ error: "Failed to send OTP" });
    }
  });

  // Login
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({ error: "Username and password required" });
      }

      const user = await storage.verifyUserCredentials(username, password);
      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      res.json({
        success: true,
        user: {
          id: user.id,
          username: user.username,
          phoneNumber: user.phoneNumber,
          balance: user.balance,
          referralCode: user.referralCode,
          referralCount: user.referralCount,
          referralEarnings: user.referralEarnings,
        },
      });
    } catch (error: any) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Login failed" });
    }
  });

  // Admin login
  app.post("/api/admin/login", async (req, res) => {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({ error: "Username and password required" });
      }

      const admin = await storage.verifyAdminCredentials(username, password);
      if (!admin) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      res.json({
        success: true,
        admin: {
          id: admin.id,
          username: admin.username,
        },
      });
    } catch (error: any) {
      console.error("Admin login error:", error);
      res.status(500).json({ error: "Login failed" });
    }
  });

  // ============ User Routes ============

  // Get user profile
  app.get("/api/user/:id", async (req, res) => {
    try {
      const user = await storage.getUserById(req.params.id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      res.json({
        id: user.id,
        username: user.username,
        phoneNumber: user.phoneNumber,
        balance: user.balance,
        referralCode: user.referralCode,
        referralCount: user.referralCount,
        referralEarnings: user.referralEarnings,
      });
    } catch (error: any) {
      res.status(500).json({ error: "Failed to fetch user" });
    }
  });

  // Get user transactions
  app.get("/api/user/:id/transactions", async (req, res) => {
    try {
      const transactions = await storage.getUserTransactions(req.params.id);
      res.json(transactions);
    } catch (error: any) {
      res.status(500).json({ error: "Failed to fetch transactions" });
    }
  });

  // ============ Funding Routes ============

  // Create funding request
  app.post("/api/funding/request", async (req, res) => {
    try {
      const { userId, amount } = req.body;
      const validatedData = insertFundingRequestSchema.parse({ userId, amount });

      const request = await storage.createFundingRequest(userId, validatedData.amount);
      res.json(request);
    } catch (error: any) {
      console.error("Funding request error:", error);
      res.status(400).json({ error: error.message || "Failed to create funding request" });
    }
  });

  // Get pending funding requests (admin)
  app.get("/api/admin/funding/pending", async (req, res) => {
    try {
      const requests = await storage.getPendingFundingRequests();
      res.json(requests);
    } catch (error: any) {
      res.status(500).json({ error: "Failed to fetch funding requests" });
    }
  });

  // Confirm funding request (admin)
  app.post("/api/admin/funding/:id/confirm", async (req, res) => {
    try {
      const { adminId } = req.body;
      await storage.confirmFundingRequest(req.params.id, adminId);
      res.json({ success: true });
    } catch (error: any) {
      console.error("Funding confirmation error:", error);
      res.status(400).json({ error: error.message || "Failed to confirm funding" });
    }
  });

  // Reject funding request (admin)
  app.post("/api/admin/funding/:id/reject", async (req, res) => {
    try {
      await storage.rejectFundingRequest(req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(400).json({ error: "Failed to reject funding" });
    }
  });

  // ============ Payment Settings Routes (Admin) ============

  // Get payment settings
  app.get("/api/admin/payment-settings", async (req, res) => {
    try {
      const settings = await storage.getPaymentSettings();
      res.json(settings || {});
    } catch (error: any) {
      res.status(500).json({ error: "Failed to fetch payment settings" });
    }
  });

  // Update payment settings
  app.post("/api/admin/payment-settings", async (req, res) => {
    try {
      const validatedData = insertPaymentSettingsSchema.parse(req.body);
      const settings = await storage.updatePaymentSettings(validatedData);
      res.json(settings);
    } catch (error: any) {
      console.error("Payment settings update error:", error);
      res.status(400).json({ error: error.message || "Failed to update payment settings" });
    }
  });

  // ============ Data Bundle Routes ============

  // Get all data bundles
  app.get("/api/data-bundles", async (req, res) => {
    try {
      const bundles = await storage.getAllDataBundles();
      res.json(bundles);
    } catch (error: any) {
      res.status(500).json({ error: "Failed to fetch data bundles" });
    }
  });

  // Purchase data bundle
  app.post("/api/data/purchase", async (req, res) => {
    try {
      const validatedData = insertDataPurchaseSchema.parse(req.body);

      // Get bundle details
      const bundle = await storage.getDataBundleById(validatedData.bundleId);
      if (!bundle) {
        return res.status(404).json({ error: "Bundle not found" });
      }

      // Get user and check balance
      const user = await storage.getUserById(validatedData.userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const price = parseFloat(bundle.price);
      const currentBalance = parseFloat(user.balance);

      if (currentBalance < price) {
        return res.status(400).json({ error: "Insufficient balance" });
      }

      // Deduct from balance
      const newBalance = (currentBalance - price).toFixed(2);

      // Create purchase record
      const purchase = await storage.createDataPurchase({
        ...validatedData,
        network: bundle.network,
        dataAmount: bundle.dataAmount,
        price: bundle.price,
      });

      // Update balance
      await storage.updateUserBalance(user.id, newBalance);

      // Create transaction record
      await storage.createTransaction(
        user.id,
        "data_purchase",
        `-${price.toFixed(2)}`,
        `${bundle.network} ${bundle.dataAmount} Data`,
        user.balance,
        newBalance
      );

      res.json({ success: true, purchase });
    } catch (error: any) {
      console.error("Data purchase error:", error);
      res.status(400).json({ error: error.message || "Failed to purchase data" });
    }
  });

  // ============ Airtime Routes ============

  // Purchase airtime
  app.post("/api/airtime/purchase", async (req, res) => {
    try {
      const validatedData = insertAirtimePurchaseSchema.parse(req.body);

      // Get user and check balance
      const user = await storage.getUserById(validatedData.userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const amount = parseFloat(validatedData.amount.toString());
      const currentBalance = parseFloat(user.balance);

      if (currentBalance < amount) {
        return res.status(400).json({ error: "Insufficient balance" });
      }

      // Deduct from balance
      const newBalance = (currentBalance - amount).toFixed(2);

      // Create purchase record
      const purchase = await storage.createAirtimePurchase(validatedData);

      // Update balance
      await storage.updateUserBalance(user.id, newBalance);

      // Create transaction record
      await storage.createTransaction(
        user.id,
        "airtime_purchase",
        `-${amount.toFixed(2)}`,
        `${validatedData.network} ₦${amount} Airtime`,
        user.balance,
        newBalance
      );

      res.json({ success: true, purchase });
    } catch (error: any) {
      console.error("Airtime purchase error:", error);
      res.status(400).json({ error: error.message || "Failed to purchase airtime" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
