import app from "../../backend/app.js";
import { connectDB } from "../../backend/src/config/db.js";

app.use(async (req, res, next) => {
  try {
    await connectDB();
  } catch (err) {
    console.warn("Vercel Serverless DB Connection Warning:", err.message);
  }
  next();
});

export default app;
