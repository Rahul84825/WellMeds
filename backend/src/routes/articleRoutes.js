import express from "express";
import {
  getArticles,
  getFeaturedArticles,
  getArticleBySlug,
  adminGetArticles,
  adminGetArticleById,
  createArticle,
  updateArticle,
  deleteArticle,
  togglePublishArticle,
  seedArticles,
} from "../controllers/articleController.js";
import { protect } from "../middleware/authMiddleware.js";
import { admin } from "../middleware/adminMiddleware.js";

const router = express.Router();

// ──────────────────────────────────────────────
// Admin & Special Routes MUST come before /:slug
// ──────────────────────────────────────────────

// Public featured articles for hero carousel
router.get("/featured", getFeaturedArticles);

// Admin routes (protected)
router.get("/admin/all", protect, admin, adminGetArticles);
router.get("/admin/:id", protect, admin, adminGetArticleById);
router.post("/seed", protect, admin, seedArticles);

// Public list & Admin create
router.route("/")
  .get(getArticles)
  .post(protect, admin, createArticle);

// Public single article
router.get("/:slug", getArticleBySlug);

// Admin write routes on /:id
router.route("/:id")
  .put(protect, admin, updateArticle)
  .delete(protect, admin, deleteArticle);

router.put("/:id/status", protect, admin, togglePublishArticle);

export default router;
