import jwt from "jsonwebtoken";
import { User } from "../models/User.js";

/**
 * Global Maintenance Mode Middleware
 * Blocks public storefront API endpoints when MAINTENANCE_MODE=true
 * while keeping Admin panel APIs, Admin auth, and uploads 100% operational.
 *
 * Token resolution mirrors authMiddleware.js:
 *   1. Authorization: Bearer <token>  (used by some admin SDK calls)
 *   2. req.cookies.accessToken        (primary — set by the backend on login)
 */
export const maintenanceMiddleware = async (req, res, next) => {
  const isMaintenance = process.env.MAINTENANCE_MODE === "true";
  if (!isMaintenance) {
    return next();
  }

  const path = req.originalUrl || req.path || "";

  // 1. Always allow Admin endpoints, Auth endpoints, Subscribe, Contact, Uploads, and Top-level SEO
  if (
    path.startsWith("/api/admin") ||
    path.startsWith("/api/auth") ||
    path === "/api/notifications/subscribe" ||
    path.startsWith("/api/contact") ||
    path.startsWith("/uploads") ||
    path === "/robots.txt" ||
    path === "/sitemap.xml" ||
    path.startsWith("/sitemap-")
  ) {
    return next();
  }

  // 2. Try to extract token from Authorization header OR cookie (same as authMiddleware)
  let token = null;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies && req.cookies.accessToken) {
    token = req.cookies.accessToken;
  }

  // 3. If a token exists, verify it and check if the user is admin
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      // Look up the user role from the database (JWT payload only contains id)
      const user = await User.findById(decoded.id).select("role").lean();
      if (user && user.role === "admin") {
        return next();
      }
    } catch (err) {
      // Token expired or invalid — fall through to block
    }
  }

  // 4. Log blocked public API request internally (never exposed to client)
  console.warn(`[Maintenance Mode] Blocked public API request: ${req.method} ${path}`);

  // 5. Return HTTP 503 Service Unavailable
  return res.status(503).json({
    maintenance: true,
    message: "WellMeds is currently under development. Please visit again soon.",
  });
};

