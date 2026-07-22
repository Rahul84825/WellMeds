import { connectDB } from "../../backend/src/config/db.js";
import {
  getSitemapXml,
  getPagesSitemap,
  getProductsSitemap,
  getCategoriesSitemap,
  getMoleculesSitemap,
  getSpecialitiesSitemap,
  getSurgicalSitemap,
  getBlogSitemap,
  getRobotsTxt,
} from "../../backend/src/controllers/seoController.js";

export default async function handler(req, res) {
  try {
    await connectDB();
  } catch (err) {
    console.warn("Sitemap Serverless DB Connection Warning:", err.message);
  }

  const url = req.url || "";
  const pathname = url.split("?")[0];

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (pathname === "/sitemap.xml" || pathname === "/api/sitemap.xml") {
    return getSitemapXml(req, res);
  }
  if (pathname === "/sitemap-pages.xml" || pathname === "/api/sitemap-pages.xml") {
    return getPagesSitemap(req, res);
  }
  if (pathname === "/sitemap-products.xml" || pathname === "/api/sitemap-products.xml") {
    return getProductsSitemap(req, res);
  }
  if (pathname.startsWith("/sitemap-products-") || pathname.startsWith("/api/sitemap-products-")) {
    const pageMatch = pathname.match(/sitemap-products-(\d+)\.xml/);
    if (pageMatch) {
      req.params = req.params || {};
      req.params.page = pageMatch[1];
    }
    return getProductsSitemap(req, res);
  }
  if (pathname === "/sitemap-categories.xml" || pathname === "/api/sitemap-categories.xml") {
    return getCategoriesSitemap(req, res);
  }
  if (pathname === "/sitemap-molecules.xml" || pathname === "/api/sitemap-molecules.xml") {
    return getMoleculesSitemap(req, res);
  }
  if (pathname === "/sitemap-specialities.xml" || pathname === "/api/sitemap-specialities.xml") {
    return getSpecialitiesSitemap(req, res);
  }
  if (pathname === "/sitemap-surgical.xml" || pathname === "/api/sitemap-surgical.xml") {
    return getSurgicalSitemap(req, res);
  }
  if (pathname === "/sitemap-blog.xml" || pathname === "/api/sitemap-blog.xml") {
    return getBlogSitemap(req, res);
  }
  if (pathname === "/robots.txt" || pathname === "/api/robots.txt") {
    return getRobotsTxt(req, res);
  }

  try {
    const { default: app } = await import("../../backend/app.js");
    return app(req, res);
  } catch (err) {
    console.error("Full app fallback error:", err.message);
    return res.status(500).json({ error: "Internal Server Error", message: err.message });
  }
}
