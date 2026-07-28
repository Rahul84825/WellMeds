import jwt from "jsonwebtoken";

/**
 * Global Maintenance Mode Middleware
 * Blocks public storefront API endpoints when MAINTENANCE_MODE=true
 * while keeping Admin panel APIs, Admin auth, and uploads 100% operational.
 */
export const maintenanceMiddleware = (req, res, next) => {
  const isMaintenance = process.env.MAINTENANCE_MODE === "true";
  if (!isMaintenance) {
    return next();
  }

  const path = req.originalUrl || req.path || "";

  // 1. Always allow Admin endpoints, Auth endpoints, Subscribe, Uploads, and Top-level SEO
  if (
    path.startsWith("/api/admin") ||
    path.startsWith("/api/auth") ||
    path === "/api/notifications/subscribe" ||
    path.startsWith("/uploads") ||
    path === "/robots.txt" ||
    path === "/sitemap.xml" ||
    path.startsWith("/sitemap-")
  ) {
    return next();
  }

  // 2. Allow authenticated requests from Admin users
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || "supersecretjwtkey1234567890!@");
      if (decoded && (decoded.role === "admin" || decoded.isAdmin)) {
        return next();
      }
    }
  } catch (err) {
    // Token verification failed or expired - proceed to block public endpoint
  }

  // 3. Log blocked public API request internally
  console.warn(`[Maintenance Mode] Blocked public API request: ${req.method} ${path}`);

  // 4. Return HTTP 503 Service Unavailable
  return res.status(503).json({
    maintenance: true,
    message: "WellMeds is currently under development. Please visit again soon.",
  });
};
