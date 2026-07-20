import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

export const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) {
    return {
      connection: mongoose.connection,
      host: mongoose.connection.host,
      dbName: mongoose.connection.name,
      isAtlas: (process.env.MONGODB_URI || "").includes("mongodb.net") || mongoose.connection.host.includes("mongodb.net"),
    };
  }

  const dbUrl = process.env.MONGODB_URI;

  if (!dbUrl || typeof dbUrl !== "string" || dbUrl.trim().length === 0) {
    console.error("\n❌ MONGODB_URI environment variable is missing or empty.");
    console.error("Import cancelled.");
    console.error("No data was imported.\n");
    process.exit(1);
  }

  const isAtlas = dbUrl.includes("mongodb.net");

  try {
    console.log(`[Database] Connecting to ${isAtlas ? "MongoDB Atlas" : "MongoDB"}...`);
    const conn = await mongoose.connect(dbUrl, {
      serverSelectionTimeoutMS: 10000, // 10 seconds timeout for cloud TLS connection
    });

    const host = conn.connection.host;
    const dbName = conn.connection.name;

    console.log(`[Database] Connected successfully to host: ${host} (Database: ${dbName})`);

    return {
      connection: conn.connection,
      host,
      dbName,
      isAtlas,
    };
  } catch (error) {
    console.error(`\n❌ Could not connect to MongoDB Atlas.`);
    console.error(`Import cancelled.`);
    console.error(`Reason: ${error.message}`);
    console.error(`No data was imported.\n`);
    process.exit(1);
  }
};

export const disconnectDB = async () => {
  if (mongoose.connection.readyState >= 1) {
    await mongoose.disconnect();
  }
};

