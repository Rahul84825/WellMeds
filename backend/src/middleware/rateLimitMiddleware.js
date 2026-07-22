import rateLimit from "express-rate-limit";

// Limit overall auth routes
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    success: false,
    message: "Too many authentication requests from this IP, please try again after 15 minutes",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// OTP Send: max 10 per hour per IP (per-mobile limit is enforced in controller)
export const otpSendLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  message: {
    success: false,
    message: "Too many OTP requests from this IP. Please try again after 1 hour.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// OTP Verify: max 15 attempts per 15 minutes per IP
export const otpVerifyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  message: {
    success: false,
    message: "Too many OTP verification attempts. Please try again after 15 minutes.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// General request limiter for overall system (GET read requests are bypassed to allow seamless catalog browsing)
export const globalLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 1500,
  skip: (req) => {
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

// Limit file uploads to 100 uploads per 10 minutes to prevent resource abuse
export const uploadLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 100,
  message: {
    success: false,
    message: "Too many file upload requests from this IP, please try again after 10 minutes",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Limit coupon validation/application to 30 attempts per 10 minutes
export const couponLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 30,
  message: {
    success: false,
    message: "Too many coupon validation attempts, please try again after 10 minutes",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Limit heavy catalog searches
export const searchLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 300,
  message: {
    success: false,
    message: "Too many search requests, please slow down",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
