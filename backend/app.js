import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import { notFound } from "./src/middleware/notFoundMiddleware.js";
import { errorHandler } from "./src/middleware/errorMiddleware.js";
import { globalLimiter } from "./src/middleware/rateLimitMiddleware.js";
import { preventMongoInjection, preventXSS } from "./src/middleware/securityMiddleware.js";

// Routes Import
import authRoutes from "./src/routes/authRoutes.js";
import productRoutes from "./src/routes/productRoutes.js";
import categoryRoutes from "./src/routes/categoryRoutes.js";
import orderRoutes from "./src/routes/orderRoutes.js";
import prescriptionRoutes from "./src/routes/prescriptionRoutes.js";
import couponRoutes from "./src/routes/couponRoutes.js";
import cartRoutes from "./src/routes/cartRoutes.js";
import wishlistRoutes from "./src/routes/wishlistRoutes.js";
import adminRoutes from "./src/routes/adminRoutes.js";
import specialityRoutes from "./src/routes/specialityRoutes.js";
import moleculeRoutes from "./src/routes/moleculeRoutes.js";
import surgicalCategoryRoutes from "./src/routes/surgicalCategoryRoutes.js";

const app = express();


// Security Middlewares
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }, // Allows loading local file uploads in frontend
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://apis.google.com"],
      connectSrc: ["'self'", "https://oauth2.googleapis.com"],
      imgSrc: ["'self'", "data:", "https://res.cloudinary.com", "https://lh3.googleusercontent.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
  hidePoweredBy: true,
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
  frameguard: {
    action: "deny",
  },
  noSniff: true,
  referrerPolicy: {
    policy: "strict-origin-when-cross-origin",
  },
}));

// Dynamic CORS configuration
const allowedOrigins = process.env.CLIENT_URL 
  ? process.env.CLIENT_URL.split(",").map(o => o.trim()) 
  : ["http://localhost:5173"];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, or postman)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === "development") {
      return callback(null, true);
    }
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
}));

app.use(globalLimiter);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(process.env.COOKIE_SECRET));

// Input Validation & Sanitization Middlewares (Runs after body parsers)
app.use(preventMongoInjection);
app.use(preventXSS);

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Serve uploaded prescription/product images statically
app.use("/uploads", express.static("uploads"));

// Routes Mapping
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/prescriptions", prescriptionRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/specialities", specialityRoutes);
app.use("/api/molecules", moleculeRoutes);
app.use("/api/surgical-categories", surgicalCategoryRoutes);

// Unmatched catches & Error boundaries
app.use(notFound);
app.use(errorHandler);

export default app;
