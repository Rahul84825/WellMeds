import {
  generateSitemapIndex,
  generatePagesSitemap,
  generateProductsSitemap,
  generateCategoriesSitemap,
  generateMoleculesSitemap,
  generateSpecialitiesSitemap,
  generateSurgicalSitemap,
  generateBlogSitemap,
} from "../services/sitemapService.js";

const DEFAULT_SITE_URL = process.env.SITE_URL || "https://wellmeds.in";

const sendXmlResponse = (res, xml, statusCode = 200) => {
  res.setHeader("Content-Type", "application/xml; charset=utf-8");
  res.setHeader("Cache-Control", "public, max-age=3600, s-maxage=3600");
  res.status(statusCode).send(xml);
};

const sendXmlErrorResponse = (res, errorMsg, statusCode = 500) => {
  res.setHeader("Content-Type", "application/xml; charset=utf-8");
  const xmlError = `<?xml version="1.0" encoding="UTF-8"?>\n<error>\n  <message>${errorMsg}</message>\n</error>`;
  res.status(statusCode).send(xmlError);
};

/**
 * GET /sitemap.xml
 * Sitemap Index referencing all dynamic sub-sitemaps
 */
export const getSitemapXml = async (req, res, next) => {
  try {
    const siteUrl = DEFAULT_SITE_URL.replace(/\/$/, "");
    const xml = await generateSitemapIndex(siteUrl);
    sendXmlResponse(res, xml);
  } catch (error) {
    console.error("Error generating Sitemap Index:", error);
    sendXmlErrorResponse(res, "Internal error generating sitemap index");
  }
};

/**
 * GET /sitemap-pages.xml
 * Static Pages Sitemap
 */
export const getPagesSitemap = async (req, res, next) => {
  try {
    const siteUrl = DEFAULT_SITE_URL.replace(/\/$/, "");
    const xml = await generatePagesSitemap(siteUrl);
    sendXmlResponse(res, xml);
  } catch (error) {
    console.error("Error generating Pages Sitemap:", error);
    sendXmlErrorResponse(res, "Internal error generating pages sitemap");
  }
};

/**
 * GET /sitemap-products.xml or GET /sitemap-products-:page.xml
 * Dynamic Product Sitemap with pagination support & image extensions
 */
export const getProductsSitemap = async (req, res, next) => {
  try {
    const siteUrl = DEFAULT_SITE_URL.replace(/\/$/, "");
    const page = parseInt(req.params.page || "1", 10);
    const { xml } = await generateProductsSitemap(siteUrl, page);
    sendXmlResponse(res, xml);
  } catch (error) {
    console.error("Error generating Products Sitemap:", error);
    sendXmlErrorResponse(res, "Internal error generating products sitemap");
  }
};

/**
 * GET /sitemap-categories.xml
 * Dynamic Category Sitemap
 */
export const getCategoriesSitemap = async (req, res, next) => {
  try {
    const siteUrl = DEFAULT_SITE_URL.replace(/\/$/, "");
    const xml = await generateCategoriesSitemap(siteUrl);
    sendXmlResponse(res, xml);
  } catch (error) {
    console.error("Error generating Categories Sitemap:", error);
    sendXmlErrorResponse(res, "Internal error generating categories sitemap");
  }
};

/**
 * GET /sitemap-molecules.xml
 * Dynamic Molecule Sitemap
 */
export const getMoleculesSitemap = async (req, res, next) => {
  try {
    const siteUrl = DEFAULT_SITE_URL.replace(/\/$/, "");
    const xml = await generateMoleculesSitemap(siteUrl);
    sendXmlResponse(res, xml);
  } catch (error) {
    console.error("Error generating Molecules Sitemap:", error);
    sendXmlErrorResponse(res, "Internal error generating molecules sitemap");
  }
};

/**
 * GET /sitemap-specialities.xml
 * Dynamic Medical Speciality Sitemap
 */
export const getSpecialitiesSitemap = async (req, res, next) => {
  try {
    const siteUrl = DEFAULT_SITE_URL.replace(/\/$/, "");
    const xml = await generateSpecialitiesSitemap(siteUrl);
    sendXmlResponse(res, xml);
  } catch (error) {
    console.error("Error generating Specialities Sitemap:", error);
    sendXmlErrorResponse(res, "Internal error generating specialities sitemap");
  }
};

/**
 * GET /sitemap-surgical.xml
 * Dynamic Surgical Category Sitemap
 */
export const getSurgicalSitemap = async (req, res, next) => {
  try {
    const siteUrl = DEFAULT_SITE_URL.replace(/\/$/, "");
    const xml = await generateSurgicalSitemap(siteUrl);
    sendXmlResponse(res, xml);
  } catch (error) {
    console.error("Error generating Surgical Sitemap:", error);
    sendXmlErrorResponse(res, "Internal error generating surgical sitemap");
  }
};

/**
 * GET /sitemap-blog.xml
 * Dynamic Blog Sitemap (returns 404 or empty XML if no blogs exist)
 */
export const getBlogSitemap = async (req, res, next) => {
  try {
    const siteUrl = DEFAULT_SITE_URL.replace(/\/$/, "");
    const { xml, hasBlogs } = await generateBlogSitemap(siteUrl);
    if (!hasBlogs) {
      return sendXmlErrorResponse(res, "No blog sitemap available", 404);
    }
    sendXmlResponse(res, xml);
  } catch (error) {
    console.error("Error generating Blog Sitemap:", error);
    sendXmlErrorResponse(res, "Internal error generating blog sitemap");
  }
};

/**
 * GET /robots.txt
 * Production-ready robots.txt file referencing sitemap.xml
 */
export const getRobotsTxt = (req, res) => {
  const siteUrl = DEFAULT_SITE_URL.replace(/\/$/, "");

  const robots = `# Production Robots.txt for WellMeds
User-agent: *
Allow: /

# Exclude Admin, API, and Private Patient Endpoints
Disallow: /admin
Disallow: /admin/*
Disallow: /api/*
Disallow: /cart
Disallow: /checkout
Disallow: /profile
Disallow: /orders
Disallow: /login
Disallow: /register
Disallow: /verify-email
Disallow: /reset-password
Disallow: /forgot-password

# Sitemap Reference
Sitemap: ${siteUrl}/sitemap.xml
`;

  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.setHeader("Cache-Control", "public, max-age=86400, s-maxage=86400");
  res.status(200).send(robots);
};
