import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { User } from "../models/User.js";

let mongoServer;

const seedDefaultAdmin = async () => {
  try {
    const adminEmail = "admin@gmail.com";
    const existing = await User.findOne({ email: adminEmail });
    if (!existing) {
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
  } catch (err) {
    console.warn(`[Database] Auto-seeding failed: ${err.message}`);
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
  } catch (error) {
    console.warn(`[Database] Primary database connection failed: ${error.message}`);
    console.log(`[Database] Falling back to a local in-memory MongoDB instance...`);
    
    try {
      mongoServer = await MongoMemoryServer.create();
      const memoryDbUri = mongoServer.getUri();
      console.log(`[Database] In-memory MongoDB started at: ${memoryDbUri}`);
      
      const conn = await mongoose.connect(memoryDbUri);
      console.log(`MongoDB Connected (In-Memory): ${conn.connection.host}`);
      
      // Auto-seed admin user in the in-memory database
      await seedDefaultAdmin();
    } catch (memError) {
      console.error(`[Database] Critical: Failed to start in-memory MongoDB: ${memError.message}`);
      process.exit(1);
    }
  }
};
