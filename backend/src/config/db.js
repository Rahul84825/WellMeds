import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { User } from "../models/User.js";
import { Category } from "../models/Category.js";
import { Product } from "../models/Product.js";
import { Coupon } from "../models/Coupon.js";
import slugify from "slugify";
import { INITIAL_CATEGORIES, INITIAL_PRODUCTS, INITIAL_COUPONS } from "./initialData.js";

let mongoServer;

const seedAllDefaultData = async () => {
  try {
    // 1. Auto-seed default admin user if not existing
    const adminEmail = "admin@gmail.com";
    const existingAdmin = await User.findOne({ email: adminEmail });
    if (!existingAdmin) {
      await User.create({
        name: "WellMeds Admin",
        email: adminEmail,
        password: "admin123",
        role: "admin",
        authProvider: "local",
        isVerified: true,
      });
      console.log(`[Database] Auto-seeded default admin user: ${adminEmail}`);
    }

    // 2. Auto-seed categories if empty
    const categoryCount = await Category.countDocuments();
    if (categoryCount === 0) {
      console.log("[Database] Database has no categories. Auto-seeding categories...");
      for (const cat of INITIAL_CATEGORIES) {
        await Category.create({
          ...cat,
          slug: slugify(cat.name, { lower: true })
        });
      }
      console.log("[Database] Categories auto-seeded successfully.");
    }

    // 3. Auto-seed products if empty
    const productCount = await Product.countDocuments();
    if (productCount === 0) {
      console.log("[Database] Database has no products. Auto-seeding products...");
      for (const prod of INITIAL_PRODUCTS) {
        await Product.create({
          ...prod,
          slug: slugify(prod.name, { lower: true })
        });
      }
      console.log("[Database] Products auto-seeded successfully.");
    }

    // 4. Auto-seed coupons if empty
    const couponCount = await Coupon.countDocuments();
    if (couponCount === 0) {
      console.log("[Database] Database has no coupons. Auto-seeding coupons...");
      for (const coupon of INITIAL_COUPONS) {
        await Coupon.create(coupon);
      }
      console.log("[Database] Coupons auto-seeded successfully.");
    }
  } catch (err) {
    console.warn(`[Database] Auto-seeding default data failed: ${err.message}`);
  }
};

export const connectDB = async () => {
  const dbUrl = process.env.MONGODB_URI;
  
  try {
    console.log(`[Database] Attempting connection to MongoDB...`);
    const conn = await mongoose.connect(dbUrl, {
      serverSelectionTimeoutMS: 5000, // 5 seconds timeout
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    // Auto-seed default data if empty in the primary database
    await seedAllDefaultData();
  } catch (error) {
    console.warn(`[Database] Primary database connection failed: ${error.message}`);
    console.log(`[Database] Falling back to a local in-memory MongoDB instance...`);
    
    try {
      mongoServer = await MongoMemoryServer.create();
      const memoryDbUri = mongoServer.getUri();
      console.log(`[Database] In-memory MongoDB started at: ${memoryDbUri}`);
      
      const conn = await mongoose.connect(memoryDbUri);
      console.log(`MongoDB Connected (In-Memory): ${conn.connection.host}`);
      
      // Auto-seed default data in the in-memory database
      await seedAllDefaultData();
    } catch (memError) {
      console.error(`[Database] Critical: Failed to start in-memory MongoDB: ${memError.message}`);
      process.exit(1);
    }
  }
};
