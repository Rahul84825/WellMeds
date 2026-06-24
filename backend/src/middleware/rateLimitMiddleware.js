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
