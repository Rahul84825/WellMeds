import app from "../../backend/app.js";
import { connectDB } from "../../backend/src/config/db.js";

export default async function handler(req, res) {
  try {
    await connectDB();
  } catch (err) {
    console.warn("Vercel Serverless DB Connection Warning:", err.message);
  }
  return app(req, res);
}
