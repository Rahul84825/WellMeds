import mongoose from "mongoose";

export const connectDB = async (retries = 3, delayMs = 1500) => {
  if (mongoose.connection && mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }
  if (mongoose.connection && mongoose.connection.readyState === 2) {
    await new Promise((resolve) => setTimeout(resolve, 500));
    if (mongoose.connection.readyState === 1) return mongoose.connection;
  }

  const dbUrl = process.env.MONGODB_URI;

  if (!dbUrl || typeof dbUrl !== "string" || dbUrl.trim().length === 0) {
    console.warn("[Database] MONGODB_URI environment variable is missing or empty.");
    return null;
  }

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`[Database] Connecting to MongoDB (Attempt ${attempt}/${retries})...`);
      const conn = await mongoose.connect(dbUrl, {
        serverSelectionTimeoutMS: 15000,
        socketTimeoutMS: 45000,
      });
      console.log(`[Database] MongoDB Connected: ${conn.connection.host} (Database: ${conn.connection.name})`);
      return conn;
    } catch (error) {
      console.error(`[Database] Connection attempt ${attempt} failed: ${error.message}`);
      if (attempt < retries) {
        console.log(`[Database] Retrying in ${delayMs}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      } else {
        console.error(`[Database] All ${retries} connection attempts failed.`);
        return null;
      }
    }
  }
};


