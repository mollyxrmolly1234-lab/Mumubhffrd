import {
  users,
  admins,
  paymentSettings,
  fundingRequests,
  transactions,
  dataBundles,
  dataPurchases,
  airtimePurchases,
  telegramOtps,
  type User,
  type InsertUser,
  type Admin,
  type InsertAdmin,
  type PaymentSettings,
  type InsertPaymentSettings,
  type FundingRequest,
  type Transaction,
  type DataBundle,
  type InsertDataBundle,
  type DataPurchase,
  type InsertDataPurchase,
  type AirtimePurchase,
  type InsertAirtimePurchase,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";
import bcrypt from "bcrypt";

export interface IStorage {
  // User management
  createUser(user: InsertUser): Promise<User>;
  getUserById(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByPhoneNumber(phoneNumber: string): Promise<User | undefined>;
  updateUserBalance(userId: string, newBalance: string): Promise<void>;
  updateUserReferrals(userId: string, count: number, earnings: string): Promise<void>;
  verifyUserCredentials(username: string, password: string): Promise<User | null>;

  // Admin management
  createAdmin(admin: InsertAdmin): Promise<Admin>;
  getAdminByUsername(username: string): Promise<Admin | undefined>;
  verifyAdminCredentials(username: string, password: string): Promise<Admin | null>;

  // Payment settings
  getPaymentSettings(): Promise<PaymentSettings | undefined>;
  updatePaymentSettings(settings: InsertPaymentSettings): Promise<PaymentSettings>;

  // Funding requests
  createFundingRequest(userId: string, amount: number): Promise<FundingRequest>;
  getFundingRequestById(id: string): Promise<FundingRequest | undefined>;
  getPendingFundingRequests(): Promise<FundingRequest[]>;
  confirmFundingRequest(id: string, adminId: string): Promise<void>;
  rejectFundingRequest(id: string): Promise<void>;

  // Transactions
  createTransaction(userId: string, type: string, amount: string, description: string, balanceBefore: string, balanceAfter: string): Promise<Transaction>;
  getUserTransactions(userId: string, limit?: number): Promise<Transaction[]>;

  // Data bundles
  createDataBundle(bundle: InsertDataBundle): Promise<DataBundle>;
  getAllDataBundles(): Promise<DataBundle[]>;
  getDataBundleById(id: string): Promise<DataBundle | undefined>;

  // Data purchases
  createDataPurchase(purchase: InsertDataPurchase): Promise<DataPurchase>;
  getUserDataPurchases(userId: string): Promise<DataPurchase[]>;

  // Airtime purchases
  createAirtimePurchase(purchase: InsertAirtimePurchase): Promise<AirtimePurchase>;
  getUserAirtimePurchases(userId: string): Promise<AirtimePurchase[]>;
}

export class DatabaseStorage implements IStorage {
  // User management
  async createUser(insertUser: InsertUser): Promise<User> {
    const hashedPassword = await bcrypt.hash(insertUser.password, 10);
    const referralCode = this.generateReferralCode();

    const [user] = await db
      .insert(users)
      .values({
        ...insertUser,
        password: hashedPassword,
        referralCode,
        telegramVerified: true, // Set after OTP verification
      })
      .returning();

    return user;
  }

  async getUserById(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByPhoneNumber(phoneNumber: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.phoneNumber, phoneNumber));
    return user || undefined;
  }

  async updateUserBalance(userId: string, newBalance: string): Promise<void> {
    await db.update(users).set({ balance: newBalance }).where(eq(users.id, userId));
  }

  async updateUserReferrals(userId: string, count: number, earnings: string): Promise<void> {
    await db
      .update(users)
      .set({ referralCount: count, referralEarnings: earnings })
      .where(eq(users.id, userId));
  }

  async verifyUserCredentials(username: string, password: string): Promise<User | null> {
    const user = await this.getUserByUsername(username);
    if (!user) return null;

    const isValid = await bcrypt.compare(password, user.password);
    return isValid ? user : null;
  }

  // Admin management
  async createAdmin(insertAdmin: InsertAdmin): Promise<Admin> {
    const hashedPassword = await bcrypt.hash(insertAdmin.password, 10);

    const [admin] = await db
      .insert(admins)
      .values({
        ...insertAdmin,
        password: hashedPassword,
      })
      .returning();

    return admin;
  }

  async getAdminByUsername(username: string): Promise<Admin | undefined> {
    const [admin] = await db.select().from(admins).where(eq(admins.username, username));
    return admin || undefined;
  }

  async verifyAdminCredentials(username: string, password: string): Promise<Admin | null> {
    const admin = await this.getAdminByUsername(username);
    if (!admin) return null;

    const isValid = await bcrypt.compare(password, admin.password);
    return isValid ? admin : null;
  }

  // Payment settings
  async getPaymentSettings(): Promise<PaymentSettings | undefined> {
    const [settings] = await db.select().from(paymentSettings).limit(1);
    return settings || undefined;
  }

  async updatePaymentSettings(settings: InsertPaymentSettings): Promise<PaymentSettings> {
    const existing = await this.getPaymentSettings();

    if (existing) {
      const [updated] = await db
        .update(paymentSettings)
        .set({ ...settings, updatedAt: new Date() })
        .where(eq(paymentSettings.id, existing.id))
        .returning();
      return updated;
    } else {
      const [created] = await db.insert(paymentSettings).values(settings).returning();
      return created;
    }
  }

  // Funding requests
  async createFundingRequest(userId: string, amount: number): Promise<FundingRequest> {
    const [request] = await db
      .insert(fundingRequests)
      .values({
        userId,
        amount: amount.toString(),
      })
      .returning();

    return request;
  }

  async getFundingRequestById(id: string): Promise<FundingRequest | undefined> {
    const [request] = await db.select().from(fundingRequests).where(eq(fundingRequests.id, id));
    return request || undefined;
  }

  async getPendingFundingRequests(): Promise<FundingRequest[]> {
    return await db
      .select()
      .from(fundingRequests)
      .where(eq(fundingRequests.status, "pending"))
      .orderBy(desc(fundingRequests.createdAt));
  }

  async confirmFundingRequest(id: string, adminId: string): Promise<void> {
    const request = await this.getFundingRequestById(id);
    if (!request || request.status !== "pending") {
      throw new Error("Invalid funding request");
    }

    const user = await this.getUserById(request.userId);
    if (!user) {
      throw new Error("User not found");
    }

    const currentBalance = parseFloat(user.balance);
    const amount = parseFloat(request.amount);
    const newBalance = (currentBalance + amount).toFixed(2);

    // Update funding request
    await db
      .update(fundingRequests)
      .set({
        status: "confirmed",
        confirmedAt: new Date(),
        confirmedBy: adminId,
      })
      .where(eq(fundingRequests.id, id));

    // Update user balance
    await this.updateUserBalance(user.id, newBalance);

    // Create transaction record
    await this.createTransaction(
      user.id,
      "funding",
      amount.toString(),
      "Account Top-up",
      user.balance,
      newBalance
    );
  }

  async rejectFundingRequest(id: string): Promise<void> {
    await db
      .update(fundingRequests)
      .set({ status: "rejected" })
      .where(eq(fundingRequests.id, id));
  }

  // Transactions
  async createTransaction(
    userId: string,
    type: string,
    amount: string,
    description: string,
    balanceBefore: string,
    balanceAfter: string
  ): Promise<Transaction> {
    const [transaction] = await db
      .insert(transactions)
      .values({
        userId,
        type,
        amount,
        description,
        balanceBefore,
        balanceAfter,
      })
      .returning();

    return transaction;
  }

  async getUserTransactions(userId: string, limit: number = 50): Promise<Transaction[]> {
    return await db
      .select()
      .from(transactions)
      .where(eq(transactions.userId, userId))
      .orderBy(desc(transactions.createdAt))
      .limit(limit);
  }

  // Data bundles
  async createDataBundle(bundle: InsertDataBundle): Promise<DataBundle> {
    const [created] = await db.insert(dataBundles).values(bundle).returning();
    return created;
  }

  async getAllDataBundles(): Promise<DataBundle[]> {
    return await db.select().from(dataBundles).where(eq(dataBundles.isActive, true));
  }

  async getDataBundleById(id: string): Promise<DataBundle | undefined> {
    const [bundle] = await db.select().from(dataBundles).where(eq(dataBundles.id, id));
    return bundle || undefined;
  }

  // Data purchases
  async createDataPurchase(purchase: InsertDataPurchase): Promise<DataPurchase> {
    const [created] = await db.insert(dataPurchases).values(purchase).returning();
    return created;
  }

  async getUserDataPurchases(userId: string): Promise<DataPurchase[]> {
    return await db
      .select()
      .from(dataPurchases)
      .where(eq(dataPurchases.userId, userId))
      .orderBy(desc(dataPurchases.createdAt));
  }

  // Airtime purchases
  async createAirtimePurchase(purchase: InsertAirtimePurchase): Promise<AirtimePurchase> {
    const [created] = await db.insert(airtimePurchases).values(purchase).returning();
    return created;
  }

  async getUserAirtimePurchases(userId: string): Promise<AirtimePurchase[]> {
    return await db
      .select()
      .from(airtimePurchases)
      .where(eq(airtimePurchases.userId, userId))
      .orderBy(desc(airtimePurchases.createdAt));
  }

  // Helper methods
  private generateReferralCode(): string {
    return Math.random().toString(36).substring(2, 10).toUpperCase();
  }
}

export const storage = new DatabaseStorage();
