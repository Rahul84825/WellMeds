import mongoose from "mongoose";
import dotenv from "dotenv";
import { MongoMemoryServer } from "mongodb-memory-server";

dotenv.config();

let mongoServer;

export const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return;

  const dbUrl = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/wellmeds";

  try {
    console.log(`[Database] Attempting connection to ${dbUrl}...`);
    await mongoose.connect(dbUrl, {
      serverSelectionTimeoutMS: 2000, // 2 seconds timeout to fail fast if offline
    });
    console.log(`[Database] Connected successfully.`);
  } catch (error) {
    console.warn(`[Database] Primary database connection failed: ${error.message}`);
    
    if (dbUrl !== "mongodb://127.0.0.1:27017/wellmeds") {
      try {
        console.log(`[Database] Attempting local MongoDB connection (mongodb://127.0.0.1:27017/wellmeds)...`);
        await mongoose.connect("mongodb://127.0.0.1:27017/wellmeds", {
          serverSelectionTimeoutMS: 2000,
        });
        console.log(`[Database] Connected to local MongoDB.`);
        return;
      } catch (localError) {
        console.warn(`[Database] Local MongoDB connection failed: ${localError.message}`);
      }
    }

    console.log(`[Database] Falling back to a local in-memory MongoDB instance...`);
    try {
      mongoServer = await MongoMemoryServer.create();
      const memoryDbUri = mongoServer.getUri();
      console.log(`[Database] In-memory MongoDB started at: ${memoryDbUri}`);
      await mongoose.connect(memoryDbUri);
    } catch (memError) {
      console.error(`[Database] Critical: Failed to start in-memory MongoDB: ${memError.message}`);
      throw memError;
    }
  }
};

export const disconnectDB = async () => {
  if (mongoose.connection.readyState >= 1) {
    await mongoose.disconnect();
  }
  if (mongoServer) {
    await mongoServer.stop();
  }
};
