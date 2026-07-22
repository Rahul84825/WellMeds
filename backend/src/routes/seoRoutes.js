import express from "express";
import { getSitemapXml, getRobotsTxt } from "../controllers/seoController.js";

const router = express.Router();

router.get("/sitemap.xml", getSitemapXml);
router.get("/robots.txt", getRobotsTxt);

export default router;
