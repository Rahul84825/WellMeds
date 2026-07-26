import mongoose from "mongoose";

export const connectDB = async () => {
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
  
  try {
    console.log(`[Database] Connecting to MongoDB...`);
    const conn = await mongoose.connect(dbUrl, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`[Database] MongoDB Connected: ${conn.connection.host} (Database: ${conn.connection.name})`);
    return conn;
  } catch (error) {
    console.error(`[Database] Connection warning/failure: ${error.message}`);
    return null;
  }
};


