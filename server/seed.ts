import { db } from "./db";
import { dataBundles, paymentSettings, admins } from "@shared/schema";
import bcrypt from "bcrypt";
import { eq } from "drizzle-orm";

async function seed() {
  console.log("🌱 Starting database seeding...");

  try {
    // Create admin account (vesta/vesta)
    console.log("Creating admin account...");
    const existingAdmin = await db.select().from(admins).where(eq(admins.username, "vesta"));
    
    if (existingAdmin.length === 0) {
      const hashedPassword = await bcrypt.hash("vesta", 10);
      await db.insert(admins).values({
        username: "vesta",
        password: hashedPassword,
      });
      console.log("✓ Admin account created (username: vesta, password: vesta)");
    } else {
      console.log("✓ Admin account already exists");
    }

    // Create initial payment settings
    console.log("Creating payment settings...");
    const existingSettings = await db.select().from(paymentSettings).limit(1);
    
    if (existingSettings.length === 0) {
      await db.insert(paymentSettings).values({
        accountNumber: "8121320468",
        bankName: "Moniepoint",
        accountName: "Keno",
      });
      console.log("✓ Payment settings created");
    } else {
      console.log("✓ Payment settings already exist");
    }

    // Create data bundles
    console.log("Creating data bundles...");
    const existingBundles = await db.select().from(dataBundles).limit(1);
    
    if (existingBundles.length === 0) {
      const bundles = [
        // 9mobile (cheapest)
        { network: "9mobile", dataAmount: "500MB", validity: "30 days", price: "120" },
        { network: "9mobile", dataAmount: "1GB", validity: "30 days", price: "200" },
        { network: "9mobile", dataAmount: "2GB", validity: "30 days", price: "380" },
        { network: "9mobile", dataAmount: "3GB", validity: "30 days", price: "550" },
        { network: "9mobile", dataAmount: "5GB", validity: "30 days", price: "900" },
        { network: "9mobile", dataAmount: "10GB", validity: "30 days", price: "1700" },
        { network: "9mobile", dataAmount: "15GB", validity: "30 days", price: "2500" },
        { network: "9mobile", dataAmount: "20GB", validity: "30 days", price: "3200" },
        
        // MTN
        { network: "MTN", dataAmount: "500MB", validity: "30 days", price: "150" },
        { network: "MTN", dataAmount: "1GB", validity: "30 days", price: "250" },
        { network: "MTN", dataAmount: "2GB", validity: "30 days", price: "480" },
        { network: "MTN", dataAmount: "3GB", validity: "30 days", price: "700" },
        { network: "MTN", dataAmount: "5GB", validity: "30 days", price: "1100" },
        { network: "MTN", dataAmount: "10GB", validity: "30 days", price: "2100" },
        { network: "MTN", dataAmount: "20GB", validity: "30 days", price: "4000" },
        { network: "MTN", dataAmount: "40GB", validity: "30 days", price: "7500" },
        
        // Glo
        { network: "Glo", dataAmount: "1GB", validity: "30 days", price: "230" },
        { network: "Glo", dataAmount: "2GB", validity: "30 days", price: "400" },
        { network: "Glo", dataAmount: "3GB", validity: "30 days", price: "600" },
        { network: "Glo", dataAmount: "5GB", validity: "30 days", price: "950" },
        { network: "Glo", dataAmount: "10GB", validity: "30 days", price: "1800" },
        { network: "Glo", dataAmount: "15GB", validity: "30 days", price: "2600" },
        { network: "Glo", dataAmount: "25GB", validity: "30 days", price: "4200" },
        
        // Airtel
        { network: "Airtel", dataAmount: "750MB", validity: "14 days", price: "200" },
        { network: "Airtel", dataAmount: "1.5GB", validity: "30 days", price: "350" },
        { network: "Airtel", dataAmount: "3GB", validity: "30 days", price: "650" },
        { network: "Airtel", dataAmount: "6GB", validity: "30 days", price: "1200" },
        { network: "Airtel", dataAmount: "10GB", validity: "30 days", price: "1900" },
        { network: "Airtel", dataAmount: "15GB", validity: "30 days", price: "2800" },
        { network: "Airtel", dataAmount: "25GB", validity: "30 days", price: "4500" },
      ];

      await db.insert(dataBundles).values(bundles);
      console.log(`✓ Created ${bundles.length} data bundles`);
    } else {
      console.log("✓ Data bundles already exist");
    }

    console.log("✅ Database seeding completed successfully!");
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    throw error;
  } finally {
    process.exit(0);
  }
}

seed();
