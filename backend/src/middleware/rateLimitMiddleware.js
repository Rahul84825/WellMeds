import rateLimit from "express-rate-limit";

// Helper to skip rate limiting during development & local testing
const isDevOrLocal = (req) => {
  if (process.env.NODE_ENV === "development") return true;
  const ip = req.ip || req.connection?.remoteAddress || "";
  return ip === "127.0.0.1" || ip === "::1" || ip === "::ffff:127.0.0.1";
};

// Limit overall auth routes
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  skip: isDevOrLocal,
  message: {
    success: false,
    message: "Too many authentication requests from this IP, please try again after 15 minutes",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// OTP Send: max 30 per hour per IP (per-mobile limit is enforced in controller)
export const otpSendLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 30,
  skip: isDevOrLocal,
  message: {
    success: false,
    message: "Too many OTP requests from this IP. Please try again after 1 hour.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// OTP Verify: max 30 attempts per 15 minutes per IP
export const otpVerifyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  skip: isDevOrLocal,
  message: {
    success: false,
    message: "Too many OTP verification attempts. Please try again after 15 minutes.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// General request limiter for overall system (GET read requests & local requests are bypassed)
export const globalLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 3000,
  skip: (req) => {
    if (isDevOrLocal(req)) return true;
    const url = req.originalUrl || req.url || "";
    // Allow read-only GET requests, sitemaps, and robots.txt
    return req.method === "GET" || url.includes("sitemap") || url.includes("robots.txt");
  },
  message: {
    success: false,
    message: "Too many requests, please slow down",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Limit file uploads
export const uploadLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 100,
  skip: isDevOrLocal,
  message: {
    success: false,
    message: "Too many file upload requests from this IP, please try again after 10 minutes",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Limit coupon validation/application
export const couponLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 50,
  skip: isDevOrLocal,
  message: {
    success: false,
    message: "Too many coupon validation attempts, please try again after 10 minutes",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Limit coming-soon / maintenance page email subscription attempts
export const subscribeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  skip: isDevOrLocal,
  message: {
    success: false,
    message: "Too many subscription requests from this IP. Please try again after 15 minutes.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Limit heavy catalog searches
export const searchLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 500,
  skip: isDevOrLocal,
  message: {
    success: false,
    message: "Too many search requests, please slow down",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
