import express from "express";
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
} from "../controllers/seoController.js";

const router = express.Router();

// Sitemap Index
router.get("/sitemap.xml", getSitemapXml);

// Child Sitemaps
router.get("/sitemap-pages.xml", getPagesSitemap);
router.get("/sitemap-products.xml", getProductsSitemap);
router.get("/sitemap-products-:page.xml", getProductsSitemap);
router.get("/sitemap-categories.xml", getCategoriesSitemap);
router.get("/sitemap-molecules.xml", getMoleculesSitemap);
router.get("/sitemap-specialities.xml", getSpecialitiesSitemap);
router.get("/sitemap-surgical.xml", getSurgicalSitemap);
router.get("/sitemap-blog.xml", getBlogSitemap);

// Production Robots.txt
router.get("/robots.txt", getRobotsTxt);

export default router;
