import { Product } from "../models/Product.js";
import { Category } from "../models/Category.js";
import { Molecule } from "../models/Molecule.js";
import { MedicalSpeciality } from "../models/MedicalSpeciality.js";
import { SurgicalCategory } from "../models/SurgicalCategory.js";
import mongoose from "mongoose";

/**
 * Escapes special XML characters to prevent XML parsing errors.
 * @param {string} str 
 * @returns {string}
 */
export const escapeXml = (str) => {
  if (!str || typeof str !== "string") return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
};

/**
 * Formats a Date object or timestamp into YYYY-MM-DD format as specified by XML Sitemap Protocol.
 * @param {Date|string|number} date 
 * @returns {string} YYYY-MM-DD
 */
export const formatDate = (date) => {
  if (!date) return new Date().toISOString().split("T")[0];
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return new Date().toISOString().split("T")[0];
    return d.toISOString().split("T")[0];
  } catch (err) {
    return new Date().toISOString().split("T")[0];
  }
};

/**
 * Converts image paths to valid absolute HTTPS/HTTP URLs.
 * @param {string} imagePath 
 * @param {string} siteUrl 
 * @returns {string|null}
 */
export const normalizeImageUrl = (imagePath, siteUrl) => {
  if (!imagePath || typeof imagePath !== "string") return null;
  const trimmed = imagePath.trim();
  if (!trimmed) return null;

  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }

  const cleanSiteUrl = siteUrl.replace(/\/$/, "");
  const cleanPath = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  return `${cleanSiteUrl}${cleanPath}`;
};

/**
 * Builds an individual <url> XML block with optional Google Image extensions.
 * @param {Object} params
 * @returns {string}
 */
export const buildUrlNode = ({ loc, lastmod, changefreq, priority, images = [] }) => {
  let xml = `  <url>\n`;
  xml += `    <loc>${escapeXml(loc)}</loc>\n`;
  if (lastmod) {
    xml += `    <lastmod>${formatDate(lastmod)}</lastmod>\n`;
  }
  if (changefreq) {
    xml += `    <changefreq>${escapeXml(changefreq)}</changefreq>\n`;
  }
  if (priority !== undefined && priority !== null) {
    xml += `    <priority>${priority}</priority>\n`;
  }

  if (Array.isArray(images) && images.length > 0) {
    images.forEach((img) => {
      if (img && img.url) {
        xml += `    <image:image>\n`;
        xml += `      <image:loc>${escapeXml(img.url)}</image:loc>\n`;
        if (img.title) {
          xml += `      <image:title>${escapeXml(img.title)}</image:title>\n`;
        }
        if (img.caption) {
          xml += `      <image:caption>${escapeXml(img.caption)}</image:caption>\n`;
        }
        xml += `    </image:image>\n`;
      }
    });
  }

  xml += `  </url>\n`;
  return xml;
};

/**
 * Wraps url nodes in <urlset> with Google Image XML schema namespaces.
 * @param {string} urlNodesXml 
 * @returns {string}
 */
export const wrapUrlSet = (urlNodesXml) => {
  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemap.org/schemas/sitemap/0.9"\n`;
  xml += `        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n`;
  xml += urlNodesXml;
  xml += `</urlset>`;
  return xml;
};

/**
 * Wraps sitemap nodes in <sitemapindex>.
 * @param {Array<{loc: string, lastmod?: string|Date}>} sitemaps 
 * @returns {string}
 */
export const wrapSitemapIndex = (sitemaps) => {
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

/**
 * Generate Static Pages Sitemap XML.
 * @param {string} siteUrl 
 * @returns {string}
 */
export const generatePagesSitemap = async (siteUrl) => {
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

/**
 * Generate Product Sitemap XML with pagination support and Google Image extensions.
 * @param {string} siteUrl 
 * @param {number} page 1-indexed
 * @param {number} limit max 50000
 * @returns {Promise<{ xml: string, totalProducts: number }>}
 */
export const generateProductsSitemap = async (siteUrl, page = 1, limit = 50000) => {
  const cleanSiteUrl = siteUrl.replace(/\/$/, "");
  const skip = (Math.max(1, page) - 1) * limit;

  // Filter out deleted/hidden products
  const filter = {
    slug: { $exists: true, $ne: "" },
    isDeleted: { $ne: true },
    status: { $ne: "Disabled" },
    visibility: { $ne: "Hidden" },
  };

  const [products, totalProducts] = await Promise.all([
    Product.find(filter)
      .select("slug updatedAt createdAt name description image images imagesData")
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Product.countDocuments(filter),
  ]);

  let urlNodes = "";

  products.forEach((p) => {
    if (!p.slug) return;

    // Collect valid image URLs
    const imageList = [];
    const seenUrls = new Set();

    // 1. Check imagesData
    if (Array.isArray(p.imagesData)) {
      p.imagesData.forEach((imgObj) => {
        const norm = normalizeImageUrl(imgObj.url, cleanSiteUrl);
        if (norm && !seenUrls.has(norm)) {
          seenUrls.add(norm);
          imageList.push({
            url: norm,
            title: imgObj.title || imgObj.alt || p.name,
            caption: imgObj.caption || p.description || "",
          });
        }
      });
    }

    // 2. Check images array
    if (Array.isArray(p.images)) {
      p.images.forEach((imgUrl) => {
        const norm = normalizeImageUrl(imgUrl, cleanSiteUrl);
        if (norm && !seenUrls.has(norm)) {
          seenUrls.add(norm);
          imageList.push({
            url: norm,
            title: p.name,
            caption: p.description || "",
          });
        }
      });
    }

    // 3. Check primary image string
    if (p.image) {
      const norm = normalizeImageUrl(p.image, cleanSiteUrl);
      if (norm && !seenUrls.has(norm)) {
        seenUrls.add(norm);
        imageList.push({
          url: norm,
          title: p.name,
          caption: p.description || "",
        });
      }
    }

    urlNodes += buildUrlNode({
      loc: `${cleanSiteUrl}/products/${p.slug}`,
      lastmod: p.updatedAt || p.createdAt,
      changefreq: "weekly",
      priority: 0.8,
      images: imageList,
    });
  });

  return {
    xml: wrapUrlSet(urlNodes),
    totalProducts,
  };
};

/**
 * Generate Category Sitemap XML.
 * @param {string} siteUrl 
 * @returns {Promise<string>}
 */
export const generateCategoriesSitemap = async (siteUrl) => {
  const cleanSiteUrl = siteUrl.replace(/\/$/, "");

  const filter = {
    slug: { $exists: true, $ne: "" },
    isActive: { $ne: false },
    status: { $ne: "Inactive" },
  };

  const categories = await Category.find(filter)
    .select("slug updatedAt createdAt name description image banner")
    .sort({ updatedAt: -1 })
    .lean();

  let urlNodes = "";

  categories.forEach((c) => {
    if (!c.slug) return;

    const imageList = [];
    const normImage = normalizeImageUrl(c.image || c.banner, cleanSiteUrl);
    if (normImage) {
      imageList.push({
        url: normImage,
        title: c.name,
        caption: c.description || "",
      });
    }

    urlNodes += buildUrlNode({
      loc: `${cleanSiteUrl}/category/${c.slug}`,
      lastmod: c.updatedAt || c.createdAt,
      changefreq: "daily",
      priority: 0.9,
      images: imageList,
    });
  });

  return wrapUrlSet(urlNodes);
};

/**
 * Generate Molecule Sitemap XML.
 * @param {string} siteUrl 
 * @returns {Promise<string>}
 */
export const generateMoleculesSitemap = async (siteUrl) => {
  const cleanSiteUrl = siteUrl.replace(/\/$/, "");

  const filter = {
    slug: { $exists: true, $ne: "" },
    isActive: { $ne: false },
  };

  const molecules = await Molecule.find(filter)
    .select("slug updatedAt createdAt name")
    .sort({ updatedAt: -1 })
    .lean();

  let urlNodes = "";

  molecules.forEach((m) => {
    if (!m.slug) return;

    urlNodes += buildUrlNode({
      loc: `${cleanSiteUrl}/molecule/${m.slug}`,
      lastmod: m.updatedAt || m.createdAt,
      changefreq: "weekly",
      priority: 0.8,
    });
  });

  return wrapUrlSet(urlNodes);
};

/**
 * Generate Speciality Sitemap XML.
 * @param {string} siteUrl 
 * @returns {Promise<string>}
 */
export const generateSpecialitiesSitemap = async (siteUrl) => {
  const cleanSiteUrl = siteUrl.replace(/\/$/, "");

  const filter = {
    slug: { $exists: true, $ne: "" },
    active: { $ne: false },
  };

  const specialities = await MedicalSpeciality.find(filter)
    .select("slug updatedAt createdAt name shortDescription bannerImage iconImage")
    .sort({ updatedAt: -1 })
    .lean();

  let urlNodes = "";

  specialities.forEach((s) => {
    if (!s.slug) return;

    const imageList = [];
    const normImage = normalizeImageUrl(s.bannerImage || s.iconImage, cleanSiteUrl);
    if (normImage) {
      imageList.push({
        url: normImage,
        title: s.name,
        caption: s.shortDescription || "",
      });
    }

    urlNodes += buildUrlNode({
      loc: `${cleanSiteUrl}/speciality/${s.slug}`,
      lastmod: s.updatedAt || s.createdAt,
      changefreq: "weekly",
      priority: 0.8,
      images: imageList,
    });
  });

  return wrapUrlSet(urlNodes);
};

/**
 * Generate Surgical Category Sitemap XML.
 * @param {string} siteUrl 
 * @returns {Promise<string>}
 */
export const generateSurgicalSitemap = async (siteUrl) => {
  const cleanSiteUrl = siteUrl.replace(/\/$/, "");

  const filter = {
    slug: { $exists: true, $ne: "" },
    isActive: { $ne: false },
  };

  const surgicalCategories = await SurgicalCategory.find(filter)
    .select("slug updatedAt createdAt name description image bannerImage")
    .sort({ updatedAt: -1 })
    .lean();

  let urlNodes = "";

  surgicalCategories.forEach((sc) => {
    if (!sc.slug) return;

    const imageList = [];
    const normImage = normalizeImageUrl(sc.image || sc.bannerImage, cleanSiteUrl);
    if (normImage) {
      imageList.push({
        url: normImage,
        title: sc.name,
        caption: sc.description || "",
      });
    }

    urlNodes += buildUrlNode({
      loc: `${cleanSiteUrl}/surgical/${sc.slug}`,
      lastmod: sc.updatedAt || sc.createdAt,
      changefreq: "weekly",
      priority: 0.8,
      images: imageList,
    });
  });

  return wrapUrlSet(urlNodes);
};

/**
 * Generate Blog Sitemap XML (if Blog model exists).
 * @param {string} siteUrl 
 * @returns {Promise<{ xml: string, hasBlogs: boolean }>}
 */
export const generateBlogSitemap = async (siteUrl) => {
  const cleanSiteUrl = siteUrl.replace(/\/$/, "");

  // Check dynamically if a Blog model is registered in Mongoose
  if (!mongoose.models.Blog) {
    return { xml: wrapUrlSet(""), hasBlogs: false };
  }

  try {
    const BlogModel = mongoose.models.Blog;
    const filter = { slug: { $exists: true, $ne: "" }, status: "published" };

    const blogs = await BlogModel.find(filter)
      .select("slug updatedAt createdAt title excerpt featuredImage")
      .sort({ updatedAt: -1 })
      .lean();

    if (!blogs || blogs.length === 0) {
      return { xml: wrapUrlSet(""), hasBlogs: false };
    }

    let urlNodes = "";
    blogs.forEach((b) => {
      if (!b.slug) return;

      const imageList = [];
      const normImage = normalizeImageUrl(b.featuredImage, cleanSiteUrl);
      if (normImage) {
        imageList.push({
          url: normImage,
          title: b.title,
          caption: b.excerpt || "",
        });
      }

      urlNodes += buildUrlNode({
        loc: `${cleanSiteUrl}/blog/${b.slug}`,
        lastmod: b.updatedAt || b.createdAt,
        changefreq: "weekly",
        priority: 0.7,
        images: imageList,
      });
    });

    return { xml: wrapUrlSet(urlNodes), hasBlogs: true };
  } catch (err) {
    return { xml: wrapUrlSet(""), hasBlogs: false };
  }
};

/**
 * Generate Sitemap Index XML referencing all available dynamic sitemaps.
 * @param {string} siteUrl 
 * @returns {Promise<string>}
 */
export const generateSitemapIndex = async (siteUrl) => {
  const cleanSiteUrl = siteUrl.replace(/\/$/, "");
  const sitemaps = [];

  // 1. Static Pages Sitemap (Always included)
  sitemaps.push({
    loc: `${cleanSiteUrl}/sitemap-pages.xml`,
    lastmod: new Date(),
  });

  // 2. Product Sitemap(s) - check latest updated timestamp and total count
  try {
    const productFilter = {
      slug: { $exists: true, $ne: "" },
      isDeleted: { $ne: true },
      status: { $ne: "Disabled" },
      visibility: { $ne: "Hidden" },
    };
    const latestProduct = await Product.findOne(productFilter)
      .select("updatedAt createdAt")
      .sort({ updatedAt: -1 })
      .lean();

    const productCount = await Product.countDocuments(productFilter);

    if (productCount > 0) {
      const limit = 50000;
      const pageCount = Math.ceil(productCount / limit);

      if (pageCount === 1) {
        sitemaps.push({
          loc: `${cleanSiteUrl}/sitemap-products.xml`,
          lastmod: latestProduct?.updatedAt || latestProduct?.createdAt || new Date(),
        });
      } else {
        for (let p = 1; p <= pageCount; p++) {
          sitemaps.push({
            loc: `${cleanSiteUrl}/sitemap-products-${p}.xml`,
            lastmod: latestProduct?.updatedAt || latestProduct?.createdAt || new Date(),
          });
        }
      }
    }
  } catch (err) {
    console.error("Sitemap Index: Error checking products", err);
  }

  // 3. Category Sitemap
  try {
    const categoryFilter = {
      slug: { $exists: true, $ne: "" },
      isActive: { $ne: false },
      status: { $ne: "Inactive" },
    };
    const latestCategory = await Category.findOne(categoryFilter)
      .select("updatedAt createdAt")
      .sort({ updatedAt: -1 })
      .lean();

    if (latestCategory) {
      sitemaps.push({
        loc: `${cleanSiteUrl}/sitemap-categories.xml`,
        lastmod: latestCategory.updatedAt || latestCategory.createdAt,
      });
    }
  } catch (err) {
    console.error("Sitemap Index: Error checking categories", err);
  }

  // 4. Molecule Sitemap
  try {
    const moleculeFilter = { slug: { $exists: true, $ne: "" }, isActive: { $ne: false } };
    const latestMolecule = await Molecule.findOne(moleculeFilter)
      .select("updatedAt createdAt")
      .sort({ updatedAt: -1 })
      .lean();

    if (latestMolecule) {
      sitemaps.push({
        loc: `${cleanSiteUrl}/sitemap-molecules.xml`,
        lastmod: latestMolecule.updatedAt || latestMolecule.createdAt,
      });
    }
  } catch (err) {
    console.error("Sitemap Index: Error checking molecules", err);
  }

  // 5. Speciality Sitemap
  try {
    const specialityFilter = { slug: { $exists: true, $ne: "" }, active: { $ne: false } };
    const latestSpeciality = await MedicalSpeciality.findOne(specialityFilter)
      .select("updatedAt createdAt")
      .sort({ updatedAt: -1 })
      .lean();

    if (latestSpeciality) {
      sitemaps.push({
        loc: `${cleanSiteUrl}/sitemap-specialities.xml`,
        lastmod: latestSpeciality.updatedAt || latestSpeciality.createdAt,
      });
    }
  } catch (err) {
    console.error("Sitemap Index: Error checking specialities", err);
  }

  // 6. Surgical Category Sitemap
  try {
    const surgicalFilter = { slug: { $exists: true, $ne: "" }, isActive: { $ne: false } };
    const latestSurgical = await SurgicalCategory.findOne(surgicalFilter)
      .select("updatedAt createdAt")
      .sort({ updatedAt: -1 })
      .lean();

    if (latestSurgical) {
      sitemaps.push({
        loc: `${cleanSiteUrl}/sitemap-surgical.xml`,
        lastmod: latestSurgical.updatedAt || latestSurgical.createdAt,
      });
    }
  } catch (err) {
    console.error("Sitemap Index: Error checking surgical categories", err);
  }

  // 7. Blog Sitemap (if present)
  try {
    const { hasBlogs } = await generateBlogSitemap(cleanSiteUrl);
    if (hasBlogs) {
      sitemaps.push({
        loc: `${cleanSiteUrl}/sitemap-blog.xml`,
        lastmod: new Date(),
      });
    }
  } catch (err) {
    // Ignore blog error
  }

  return wrapSitemapIndex(sitemaps);
};
