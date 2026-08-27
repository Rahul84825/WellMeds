import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import { notFound } from "./src/middleware/notFoundMiddleware.js";
import { errorHandler } from "./src/middleware/errorMiddleware.js";
import { globalLimiter } from "./src/middleware/rateLimitMiddleware.js";
import { preventMongoInjection, preventXSS } from "./src/middleware/securityMiddleware.js";
import { responseCompressor } from "./src/middleware/compressionMiddleware.js";

// Routes Import
import authRoutes from "./src/routes/authRoutes.js";
import productRoutes from "./src/routes/productRoutes.js";
import categoryRoutes from "./src/routes/categoryRoutes.js";
import orderRoutes from "./src/routes/orderRoutes.js";
import prescriptionRoutes from "./src/routes/prescriptionRoutes.js";
import couponRoutes from "./src/routes/couponRoutes.js";
import cartRoutes from "./src/routes/cartRoutes.js";
import adminRoutes from "./src/routes/adminRoutes.js";
import notificationRoutes from "./src/routes/notificationRoutes.js";
import specialityRoutes from "./src/routes/specialityRoutes.js";
import moleculeRoutes from "./src/routes/moleculeRoutes.js";
import surgicalCategoryRoutes from "./src/routes/surgicalCategoryRoutes.js";
import surgicalProductRoutes from "./src/routes/surgicalProductRoutes.js";
import megaMenuRoutes from "./src/routes/megaMenuRoutes.js";
import contactRoutes from "./src/routes/contactRoutes.js";
import locationRoutes from "./src/routes/locationRoutes.js";
import addressRoutes from "./src/routes/addressRoutes.js";
import deliveryRuleRoutes from "./src/routes/deliveryRuleRoutes.js";
import articleRoutes from "./src/routes/articleRoutes.js";


const app = express();
app.set("trust proxy", 1);

// Mount Response Gzip Compression Middleware (Before Routes)
app.use(responseCompressor);

// Security Middlewares
app.use(helmet({
  crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
  crossOriginResourcePolicy: { policy: "cross-origin" }, // Allows loading local file uploads in frontend
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://checkout.razorpay.com", "https://api.mapbox.com"],
      workerSrc: ["'self'", "blob:"],
      connectSrc: ["'self'", "https://api.razorpay.com", "https://*.mapbox.com", "https://events.mapbox.com"],
      frameSrc: ["'self'", "https://api.razorpay.com"],
      imgSrc: ["'self'", "data:", "blob:", "https://res.cloudinary.com", "https://lh3.googleusercontent.com", "https://*.mapbox.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://api.mapbox.com"],
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


// Dynamic & Resilient CORS configuration
const defaultOrigins = [
  "https://wellmeds.in",
  "https://www.wellmeds.in",
  "http://wellmeds.in",
  "http://www.wellmeds.in",
  "https://wellmeds.onrender.com",
  "http://localhost:5173",
  "http://localhost:3000",
  "http://localhost:4173",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:3000",
];

const parseEnvOrigins = (...envVars) => {
  const list = [];
  envVars.forEach((val) => {
    if (val) {
      val.split(",").forEach((item) => {
        const trimmed = item.trim().replace(/\/+$/, "");
        if (trimmed) {
          list.push(trimmed);
          if (trimmed.startsWith("https://www.")) {
            list.push(trimmed.replace("https://www.", "https://"));
          } else if (trimmed.startsWith("https://")) {
            list.push(trimmed.replace("https://", "https://www."));
          } else if (trimmed.startsWith("http://www.")) {
            list.push(trimmed.replace("http://www.", "http://"));
          } else if (trimmed.startsWith("http://")) {
            list.push(trimmed.replace("http://", "http://www."));
          }
        }
      });
    }
  });
  return list;
};

const allowedOriginsSet = new Set([
  ...defaultOrigins,
  ...parseEnvOrigins(process.env.CLIENT_URL, process.env.FRONTEND_URL),
]);

const isOriginAllowed = (origin) => {
  if (!origin) return true; // Allow non-browser, server-to-server, mobile app, Postman, curl requests
  const cleanOrigin = origin.trim().replace(/\/+$/, "");

  if (allowedOriginsSet.has(cleanOrigin)) return true;

  // Match wellmeds.in or subdomains
  if (/^https?:\/\/(.+\.)?wellmeds\.in$/i.test(cleanOrigin)) return true;

  // Match Vercel deployments
  if (/^https?:\/\/(.+\.)?vercel\.app$/i.test(cleanOrigin)) return true;

  // Match Render deployments
  if (/^https?:\/\/(.+\.)?onrender\.com$/i.test(cleanOrigin)) return true;

  if (process.env.NODE_ENV === "development") return true;

  return false;
};

const corsOptions = {
  origin: (origin, callback) => {
    if (isOriginAllowed(origin)) {
      callback(null, true);
    } else {
      callback(null, false);
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "Accept",
    "Origin",
    "Access-Control-Allow-Origin",
    "Access-Control-Allow-Headers",
  ],
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

app.use(globalLimiter);
app.use(express.json({
  verify: (req, res, buf) => {
    if (req.originalUrl && req.originalUrl.includes("/webhook")) {
      req.rawBody = buf.toString();
    }
  }
}));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(process.env.COOKIE_SECRET || "default_cookie_secret_wellmeds_123"));

// Input Validation & Sanitization Middlewares (Runs after body parsers)
app.use(preventMongoInjection);
app.use(preventXSS);

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Serve uploaded prescription/product images statically with long-term disk cache headers
app.use("/uploads", express.static("uploads", {
  maxAge: "30d",
  immutable: true,
  etag: true,
}));

import seoRoutes from "./src/routes/seoRoutes.js";
import { maintenanceMiddleware } from "./src/middleware/maintenanceMiddleware.js";

// Top-level SEO endpoints (/sitemap.xml, /robots.txt, and /api/sitemap.xml, /api/robots.txt)
app.use("/", seoRoutes);
app.use("/api", seoRoutes);

// Global Maintenance Mode Protection Middleware
app.use(maintenanceMiddleware);

import checkoutSessionRoutes from "./src/routes/checkoutSessionRoutes.js";

// Routes Mapping
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/prescriptions", prescriptionRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/checkout-session", checkoutSessionRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/specialities", specialityRoutes);
app.use("/api/molecules", moleculeRoutes);
app.use("/api/surgical-categories", surgicalCategoryRoutes);
app.use("/api/surgical-products", surgicalProductRoutes);
app.use("/api/megamenu", megaMenuRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/location", locationRoutes);
app.use("/api/addresses", addressRoutes);
app.use("/api/delivery-rules", deliveryRuleRoutes);
app.use("/api/articles", articleRoutes);


// Unmatched catches & Error boundaries
app.use(notFound);
app.use(errorHandler);

export default app;
