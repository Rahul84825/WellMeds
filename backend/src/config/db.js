import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { User } from "../models/User.js";
import { Category } from "../models/Category.js";
import { Product } from "../models/Product.js";
import { Coupon } from "../models/Coupon.js";
import { SurgicalCategory } from "../models/SurgicalCategory.js";
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
        const categoryDoc = await Category.findOne({ name: prod.category });
        if (!categoryDoc) {
          console.warn(`[Database] Skipping product "${prod.name}" because category "${prod.category}" does not exist.`);
          continue;
        }
        await Product.create({
          ...prod,
          category: categoryDoc._id,
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
    // 5. Auto-seed surgical categories if empty
    const surgicalCategoryCount = await SurgicalCategory.countDocuments();
    if (surgicalCategoryCount === 0) {
      console.log("[Database] Database has no surgical categories. Auto-seeding default surgical categories...");
      const defaultSurgCats = [
        { name: "Wheelchairs", slug: "wheelchairs", description: "Manual and electric wheelchairs for mobility support.", icon: "wheelchair", displayOrder: 1, isActive: true },
        { name: "Mobility Aids", slug: "mobility", description: "Walkers, canes, and crutches for assisting movement.", icon: "walking", displayOrder: 2, isActive: true },
        { name: "Hospital Beds", slug: "hospital-beds", description: "Adjustable hospital beds and accessories.", icon: "bed", displayOrder: 3, isActive: true },
        { name: "Respiratory Care", slug: "respiratory-care", description: "Oxygen concentrators, nebulizers, and CPAP machines.", icon: "lungs", displayOrder: 4, isActive: true },
        { name: "Orthopedic Supports", slug: "orthopedic-supports", description: "Braces, splints, and traction equipment.", icon: "bone", displayOrder: 5, isActive: true },
        { name: "Diagnostic Devices", slug: "diagnostic-devices", description: "Professional medical monitors and oximeters.", icon: "activity", displayOrder: 6, isActive: true }
      ];
      for (const cat of defaultSurgCats) {
        await SurgicalCategory.create(cat);
      }
      console.log("[Database] Surgical categories auto-seeded successfully.");
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
