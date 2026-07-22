import mongoose from "mongoose";

// Mongoose Connection for Serverless Container
const connectDB = async () => {
  if (mongoose.connection && mongoose.connection.readyState === 1) return;
  const uri = process.env.MONGODB_URI;
  if (!uri) return;
  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
  } catch (err) {
    console.warn("Sitemap DB connect warning:", err.message);
  }
};

// Mongoose Models
const ProductSchema = new mongoose.Schema({
  name: String, slug: String, description: String, image: String, images: [String], imagesData: Array,
  isDeleted: Boolean, status: String, visibility: String
}, { timestamps: true });

const CategorySchema = new mongoose.Schema({
  name: String, slug: String, description: String, image: String, banner: String,
  isActive: Boolean, status: String
}, { timestamps: true });

const MoleculeSchema = new mongoose.Schema({
  name: String, slug: String, isActive: Boolean
}, { timestamps: true });

const SpecialitySchema = new mongoose.Schema({
  name: String, slug: String, shortDescription: String, bannerImage: String, iconImage: String,
  active: Boolean
}, { timestamps: true });

const SurgicalSchema = new mongoose.Schema({
  name: String, slug: String, description: String, image: String, bannerImage: String,
  isActive: Boolean
}, { timestamps: true });

const Product = mongoose.models.Product || mongoose.model("Product", ProductSchema);
const Category = mongoose.models.Category || mongoose.model("Category", CategorySchema);
const Molecule = mongoose.models.Molecule || mongoose.model("Molecule", MoleculeSchema);
const MedicalSpeciality = mongoose.models.MedicalSpeciality || mongoose.model("MedicalSpeciality", SpecialitySchema);
const SurgicalCategory = mongoose.models.SurgicalCategory || mongoose.model("SurgicalCategory", SurgicalSchema);

// XML Helpers
const escapeXml = (str) => {
  if (!str || typeof str !== "string") return "";
  return str
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
};

const formatDate = (date) => {
  if (!date) return new Date().toISOString().split("T")[0];
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return new Date().toISOString().split("T")[0];
    return d.toISOString().split("T")[0];
  } catch (err) {
    return new Date().toISOString().split("T")[0];
  }
};

const normalizeImageUrl = (imagePath, siteUrl) => {
  if (!imagePath || typeof imagePath !== "string") return null;
  const trimmed = imagePath.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) return trimmed;
  const cleanSiteUrl = siteUrl.replace(/\/$/, "");
  const cleanPath = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  return `${cleanSiteUrl}${cleanPath}`;
};

const buildUrlNode = ({ loc, lastmod, changefreq, priority, images = [] }) => {
  let xml = `  <url>\n`;
  xml += `    <loc>${escapeXml(loc)}</loc>\n`;
  if (lastmod) xml += `    <lastmod>${formatDate(lastmod)}</lastmod>\n`;
  if (changefreq) xml += `    <changefreq>${escapeXml(changefreq)}</changefreq>\n`;
  if (priority !== undefined && priority !== null) xml += `    <priority>${priority}</priority>\n`;
  if (Array.isArray(images) && images.length > 0) {
    images.forEach((img) => {
      if (img && img.url) {
        xml += `    <image:image>\n`;
        xml += `      <image:loc>${escapeXml(img.url)}</image:loc>\n`;
        if (img.title) xml += `      <image:title>${escapeXml(img.title)}</image:title>\n`;
        if (img.caption) xml += `      <image:caption>${escapeXml(img.caption)}</image:caption>\n`;
        xml += `    </image:image>\n`;
      }
    });
  }
  xml += `  </url>\n`;
  return xml;
};

const wrapUrlSet = (urlNodesXml) => {
  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n`;
  xml += `        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n`;
  xml += urlNodesXml || "";
  xml += `</urlset>`;
  return xml;
};

const wrapSitemapIndex = (sitemaps) => {
  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
  sitemaps.forEach((sm) => {
    xml += `  <sitemap>\n`;
    xml += `    <loc>${escapeXml(sm.loc)}</loc>\n`;
    xml += `    <lastmod>${formatDate(sm.lastmod)}</lastmod>\n`;
    xml += `  </sitemap>\n`;
  });
  xml += `</sitemapindex>`;
  return xml;
};

// Sitemap Generators
const generatePagesSitemap = (siteUrl) => {
  const cleanSiteUrl = siteUrl.replace(/\/$/, "");
  const pages = [
    { url: "/", priority: "1.0", changefreq: "daily" },
    { url: "/categories", priority: "0.9", changefreq: "daily" },
    { url: "/super-speciality", priority: "0.8", changefreq: "weekly" },
    { url: "/molecules", priority: "0.8", changefreq: "weekly" },
    { url: "/wellness", priority: "0.8", changefreq: "weekly" },
    { url: "/surgical", priority: "0.8", changefreq: "weekly" },
    { url: "/surgical/all", priority: "0.8", changefreq: "weekly" },
    { url: "/surgical/categories", priority: "0.8", changefreq: "weekly" },
    { url: "/search", priority: "0.6", changefreq: "monthly" },
    { url: "/about", priority: "0.6", changefreq: "monthly" },
    { url: "/contact", priority: "0.6", changefreq: "monthly" },
    { url: "/upload-prescription", priority: "0.6", changefreq: "monthly" },
    { url: "/imported-medicines", priority: "0.6", changefreq: "monthly" },
    { url: "/patient-assistance-program", priority: "0.6", changefreq: "monthly" },
    { url: "/offers", priority: "0.6", changefreq: "monthly" },
    { url: "/how-we-keep-you-safe", priority: "0.6", changefreq: "monthly" },
    { url: "/privacy-policy", priority: "0.4", changefreq: "monthly" },
    { url: "/terms-and-conditions", priority: "0.4", changefreq: "monthly" },
    { url: "/refund-policy", priority: "0.4", changefreq: "monthly" },
    { url: "/shipping-policy", priority: "0.4", changefreq: "monthly" },
  ];
  const today = new Date();
  let urlNodes = "";
  pages.forEach((page) => {
    urlNodes += buildUrlNode({
      loc: `${cleanSiteUrl}${page.url}`,
      lastmod: today,
      changefreq: page.changefreq,
      priority: page.priority,
    });
  });
  return wrapUrlSet(urlNodes);
};

const generateProductsSitemap = async (siteUrl, page = 1) => {
  const cleanSiteUrl = siteUrl.replace(/\/$/, "");
  let products = [];
  try {
    const filter = { slug: { $exists: true, $ne: "" }, isDeleted: { $ne: true }, status: { $ne: "Disabled" }, visibility: { $ne: "Hidden" } };
    products = await Product.find(filter).select("slug updatedAt createdAt name description image images imagesData").sort({ updatedAt: -1 }).limit(50000).lean();
  } catch (err) {}
  let urlNodes = "";
  products.forEach((p) => {
    if (!p.slug) return;
    const imageList = [];
    const norm = normalizeImageUrl(p.image, cleanSiteUrl);
    if (norm) imageList.push({ url: norm, title: p.name, caption: p.description || "" });
    urlNodes += buildUrlNode({ loc: `${cleanSiteUrl}/products/${p.slug}`, lastmod: p.updatedAt || p.createdAt, changefreq: "weekly", priority: 0.8, images: imageList });
  });
  return wrapUrlSet(urlNodes);
};

const generateCategoriesSitemap = async (siteUrl) => {
  const cleanSiteUrl = siteUrl.replace(/\/$/, "");
  let categories = [];
  try {
    const filter = { slug: { $exists: true, $ne: "" }, isActive: { $ne: false }, status: { $ne: "Inactive" } };
    categories = await Category.find(filter).select("slug updatedAt createdAt name description image banner").sort({ updatedAt: -1 }).lean();
  } catch (err) {}
  let urlNodes = "";
  categories.forEach((c) => {
    if (!c.slug) return;
    const imageList = [];
    const norm = normalizeImageUrl(c.image || c.banner, cleanSiteUrl);
    if (norm) imageList.push({ url: norm, title: c.name, caption: c.description || "" });
    urlNodes += buildUrlNode({ loc: `${cleanSiteUrl}/category/${c.slug}`, lastmod: c.updatedAt || c.createdAt, changefreq: "daily", priority: 0.9, images: imageList });
  });
  return wrapUrlSet(urlNodes);
};

const generateMoleculesSitemap = async (siteUrl) => {
  const cleanSiteUrl = siteUrl.replace(/\/$/, "");
  let molecules = [];
  try {
    const filter = { slug: { $exists: true, $ne: "" }, isActive: { $ne: false } };
    molecules = await Molecule.find(filter).select("slug updatedAt createdAt name").sort({ updatedAt: -1 }).lean();
  } catch (err) {}
  let urlNodes = "";
  molecules.forEach((m) => {
    if (!m.slug) return;
    urlNodes += buildUrlNode({ loc: `${cleanSiteUrl}/molecule/${m.slug}`, lastmod: m.updatedAt || m.createdAt, changefreq: "weekly", priority: 0.8 });
  });
  return wrapUrlSet(urlNodes);
};

const generateSpecialitiesSitemap = async (siteUrl) => {
  const cleanSiteUrl = siteUrl.replace(/\/$/, "");
  let specialities = [];
  try {
    const filter = { slug: { $exists: true, $ne: "" }, active: { $ne: false } };
    specialities = await MedicalSpeciality.find(filter).select("slug updatedAt createdAt name shortDescription bannerImage iconImage").sort({ updatedAt: -1 }).lean();
  } catch (err) {}
  let urlNodes = "";
  specialities.forEach((s) => {
    if (!s.slug) return;
    const imageList = [];
    const norm = normalizeImageUrl(s.bannerImage || s.iconImage, cleanSiteUrl);
    if (norm) imageList.push({ url: norm, title: s.name, caption: s.shortDescription || "" });
    urlNodes += buildUrlNode({ loc: `${cleanSiteUrl}/speciality/${s.slug}`, lastmod: s.updatedAt || s.createdAt, changefreq: "weekly", priority: 0.8, images: imageList });
  });
  return wrapUrlSet(urlNodes);
};

const generateSurgicalSitemap = async (siteUrl) => {
  const cleanSiteUrl = siteUrl.replace(/\/$/, "");
  let surgicalCategories = [];
  try {
    const filter = { slug: { $exists: true, $ne: "" }, isActive: { $ne: false } };
    surgicalCategories = await SurgicalCategory.find(filter).select("slug updatedAt createdAt name description image bannerImage").sort({ updatedAt: -1 }).lean();
  } catch (err) {}
  let urlNodes = "";
  surgicalCategories.forEach((sc) => {
    if (!sc.slug) return;
    const imageList = [];
    const norm = normalizeImageUrl(sc.image || sc.bannerImage, cleanSiteUrl);
    if (norm) imageList.push({ url: norm, title: sc.name, caption: sc.description || "" });
    urlNodes += buildUrlNode({ loc: `${cleanSiteUrl}/surgical/${sc.slug}`, lastmod: sc.updatedAt || sc.createdAt, changefreq: "weekly", priority: 0.8, images: imageList });
  });
  return wrapUrlSet(urlNodes);
};

const generateSitemapIndex = async (siteUrl) => {
  const cleanSiteUrl = siteUrl.replace(/\/$/, "");
  const sitemaps = [
    { loc: `${cleanSiteUrl}/sitemap-pages.xml`, lastmod: new Date() },
    { loc: `${cleanSiteUrl}/sitemap-products.xml`, lastmod: new Date() },
    { loc: `${cleanSiteUrl}/sitemap-categories.xml`, lastmod: new Date() },
    { loc: `${cleanSiteUrl}/sitemap-molecules.xml`, lastmod: new Date() },
    { loc: `${cleanSiteUrl}/sitemap-specialities.xml`, lastmod: new Date() },
    { loc: `${cleanSiteUrl}/sitemap-surgical.xml`, lastmod: new Date() },
    { loc: `${cleanSiteUrl}/sitemap-blog.xml`, lastmod: new Date() },
  ];
  return wrapSitemapIndex(sitemaps);
};

const getRobotsTxt = (siteUrl) => {
  const cleanSiteUrl = siteUrl.replace(/\/$/, "");
  return `# Production Robots.txt for WellMeds
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

Sitemap: ${cleanSiteUrl}/sitemap.xml
`;
};

// Vercel Serverless Function Handler
export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    await connectDB();
  } catch (err) {}

  const url = req.url || "";
  const pathname = url.split("?")[0];
  const host = req.headers ? req.headers.host : "";
  const proto = (req.headers && req.headers["x-forwarded-proto"]) || "https";
  let siteUrl = "https://wellmeds.in";
  if (process.env.SITE_URL) {
    siteUrl = process.env.SITE_URL;
  } else if (host && !host.includes("localhost")) {
    siteUrl = `${proto}://${host}`;
  }

  const sendXml = (xmlStr) => {
    res.setHeader("Content-Type", "application/xml; charset=utf-8");
    res.setHeader("Cache-Control", "public, max-age=3600, s-maxage=3600");
    return res.status(200).send(xmlStr);
  };

  const sendText = (textStr) => {
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader("Cache-Control", "public, max-age=86400, s-maxage=86400");
    return res.status(200).send(textStr);
  };

  if (pathname === "/sitemap.xml" || pathname === "/api/sitemap.xml") {
    return sendXml(await generateSitemapIndex(siteUrl));
  }
  if (pathname === "/sitemap-pages.xml" || pathname === "/api/sitemap-pages.xml") {
    return sendXml(generatePagesSitemap(siteUrl));
  }
  if (pathname === "/sitemap-products.xml" || pathname === "/api/sitemap-products.xml" || pathname.startsWith("/sitemap-products-") || pathname.startsWith("/api/sitemap-products-")) {
    return sendXml(await generateProductsSitemap(siteUrl));
  }
  if (pathname === "/sitemap-categories.xml" || pathname === "/api/sitemap-categories.xml") {
    return sendXml(await generateCategoriesSitemap(siteUrl));
  }
  if (pathname === "/sitemap-molecules.xml" || pathname === "/api/sitemap-molecules.xml") {
    return sendXml(await generateMoleculesSitemap(siteUrl));
  }
  if (pathname === "/sitemap-specialities.xml" || pathname === "/api/sitemap-specialities.xml") {
    return sendXml(await generateSpecialitiesSitemap(siteUrl));
  }
  if (pathname === "/sitemap-surgical.xml" || pathname === "/api/sitemap-surgical.xml") {
    return sendXml(await generateSurgicalSitemap(siteUrl));
  }
  if (pathname === "/sitemap-blog.xml" || pathname === "/api/sitemap-blog.xml") {
    return sendXml(wrapUrlSet(""));
  }
  if (pathname === "/robots.txt" || pathname === "/api/robots.txt") {
    return sendText(getRobotsTxt(siteUrl));
  }

  return sendXml(await generateSitemapIndex(siteUrl));
}
