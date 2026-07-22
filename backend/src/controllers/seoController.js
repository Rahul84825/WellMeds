import { Product } from "../models/Product.js";
import { Category } from "../models/Category.js";
import { SurgicalCategory } from "../models/SurgicalCategory.js";
import { Molecule } from "../models/Molecule.js";
import { MedicalSpeciality } from "../models/MedicalSpeciality.js";

const DEFAULT_SITE_URL = process.env.SITE_URL || "https://wellmeds.com";

export const getSitemapXml = async (req, res, next) => {
  try {
    const siteUrl = DEFAULT_SITE_URL.replace(/\/$/, "");

    // Fetch dynamic content slugs & timestamps concurrently
    const [products, categories, surgicalCategories, molecules, specialities] = await Promise.all([
      Product.find({}).select("slug updatedAt").lean(),
      Category.find({}).select("slug updatedAt").lean(),
      SurgicalCategory.find({}).select("slug updatedAt").lean(),
      Molecule.find({}).select("slug updatedAt").lean(),
      MedicalSpeciality.find({}).select("slug updatedAt").lean(),
    ]);

    const staticRoutes = [
      { url: "/", priority: "1.0", changefreq: "daily" },
      { url: "/categories", priority: "0.8", changefreq: "weekly" },
      { url: "/surgical/all", priority: "0.8", changefreq: "weekly" },
      { url: "/surgical/categories", priority: "0.8", changefreq: "weekly" },
      { url: "/molecules", priority: "0.8", changefreq: "weekly" },
      { url: "/super-speciality", priority: "0.8", changefreq: "weekly" },
      { url: "/wellness", priority: "0.8", changefreq: "weekly" },
      { url: "/surgical", priority: "0.8", changefreq: "weekly" },
      { url: "/imported-medicines", priority: "0.7", changefreq: "weekly" },
      { url: "/patient-assistance-program", priority: "0.7", changefreq: "monthly" },
      { url: "/offers", priority: "0.7", changefreq: "daily" },
      { url: "/how-we-keep-you-safe", priority: "0.6", changefreq: "monthly" },
      { url: "/about", priority: "0.6", changefreq: "monthly" },
      { url: "/contact", priority: "0.6", changefreq: "monthly" },
    ];

    const todayIso = new Date().toISOString().split("T")[0];

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemap.org/schemas/sitemap/0.9">\n`;

    // 1. Static Routes
    staticRoutes.forEach((route) => {
      xml += `  <url>\n`;
      xml += `    <loc>${siteUrl}${route.url}</loc>\n`;
      xml += `    <lastmod>${todayIso}</lastmod>\n`;
      xml += `    <changefreq>${route.changefreq}</changefreq>\n`;
      xml += `    <priority>${route.priority}</priority>\n`;
      xml += `  </url>\n`;
    });

    // 2. Product URLs
    products.forEach((p) => {
      if (p.slug) {
        const lastMod = p.updatedAt ? new Date(p.updatedAt).toISOString().split("T")[0] : todayIso;
        xml += `  <url>\n`;
        xml += `    <loc>${siteUrl}/products/${p.slug}</loc>\n`;
        xml += `    <lastmod>${lastMod}</lastmod>\n`;
        xml += `    <changefreq>daily</changefreq>\n`;
        xml += `    <priority>0.9</priority>\n`;
        xml += `  </url>\n`;
      }
    });

    // 3. Category URLs
    categories.forEach((c) => {
      if (c.slug) {
        const lastMod = c.updatedAt ? new Date(c.updatedAt).toISOString().split("T")[0] : todayIso;
        xml += `  <url>\n`;
        xml += `    <loc>${siteUrl}/category/${c.slug}</loc>\n`;
        xml += `    <lastmod>${lastMod}</lastmod>\n`;
        xml += `    <changefreq>weekly</changefreq>\n`;
        xml += `    <priority>0.8</priority>\n`;
        xml += `  </url>\n`;
      }
    });

    // 4. Surgical Category URLs
    surgicalCategories.forEach((sc) => {
      if (sc.slug) {
        const lastMod = sc.updatedAt ? new Date(sc.updatedAt).toISOString().split("T")[0] : todayIso;
        xml += `  <url>\n`;
        xml += `    <loc>${siteUrl}/surgical/${sc.slug}</loc>\n`;
        xml += `    <lastmod>${lastMod}</lastmod>\n`;
        xml += `    <changefreq>weekly</changefreq>\n`;
        xml += `    <priority>0.8</priority>\n`;
        xml += `  </url>\n`;
      }
    });

    // 5. Molecule URLs
    molecules.forEach((m) => {
      if (m.slug) {
        const lastMod = m.updatedAt ? new Date(m.updatedAt).toISOString().split("T")[0] : todayIso;
        xml += `  <url>\n`;
        xml += `    <loc>${siteUrl}/molecule/${m.slug}</loc>\n`;
        xml += `    <lastmod>${lastMod}</lastmod>\n`;
        xml += `    <changefreq>weekly</changefreq>\n`;
        xml += `    <priority>0.7</priority>\n`;
        xml += `  </url>\n`;
      }
    });

    // 6. Speciality URLs
    specialities.forEach((s) => {
      if (s.slug) {
        const lastMod = s.updatedAt ? new Date(s.updatedAt).toISOString().split("T")[0] : todayIso;
        xml += `  <url>\n`;
        xml += `    <loc>${siteUrl}/speciality/${s.slug}</loc>\n`;
        xml += `    <lastmod>${lastMod}</lastmod>\n`;
        xml += `    <changefreq>weekly</changefreq>\n`;
        xml += `    <priority>0.7</priority>\n`;
        xml += `  </url>\n`;
      }
    });

    xml += `</urlset>`;

    res.setHeader("Content-Type", "application/xml; charset=utf-8");
    res.setHeader("Cache-Control", "public, max-age=86400, s-maxage=86400"); // Cache for 24h
    res.status(200).send(xml);
  } catch (error) {
    next(error);
  }
};

export const getRobotsTxt = (req, res) => {
  const siteUrl = DEFAULT_SITE_URL.replace(/\/$/, "");

  const robots = `# Production Robots.txt for WellMeds
User-agent: *
Allow: /
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

Sitemap: ${siteUrl}/sitemap.xml
`;

  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.setHeader("Cache-Control", "public, max-age=86400, s-maxage=86400");
  res.status(200).send(robots);
};
