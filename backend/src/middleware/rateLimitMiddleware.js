import rateLimit from "express-rate-limit";

// Limit sensitive auth routes to 20 requests per 15 minutes
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: {
    success: false,
    message: "Too many authentication requests from this IP, please try again after 15 minutes"
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// General request limiter for overall system
export const globalLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 200,
  message: {
    success: false,
    message: "Too many requests, please slow down"
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Limit file uploads to 10 uploads per 10 minutes to prevent resource abuse
export const uploadLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 10,
  message: {
    success: false,
    message: "Too many file upload requests from this IP, please try again after 10 minutes"
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Limit coupon validation/application to 15 attempts per 10 minutes to prevent code brute-forcing
export const couponLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 15,
  message: {
    success: false,
    message: "Too many coupon validation attempts, please try again after 10 minutes"
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Limit heavy catalog searches to 60 queries per minute to prevent search DDoS
export const searchLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 60,
  message: {
    success: false,
    message: "Too many search requests, please slow down"
  },
  standardHeaders: true,
  legacyHeaders: false,
});
