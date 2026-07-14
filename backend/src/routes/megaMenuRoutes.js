import express from "express";
import {
  getMegaMenu,
  getAdminMegaMenu,
  createMegaMenuItem,
  updateMegaMenuItem,
  deleteMegaMenuItem,
  reorderMegaMenuItems
} from "../controllers/megaMenuController.js";
import { protect } from "../middleware/authMiddleware.js";
import { admin } from "../middleware/adminMiddleware.js";

const router = express.Router();

// Public routes
router.get("/", getMegaMenu);

// Admin-protected routes
router.get("/admin", protect, admin, getAdminMegaMenu);
router.post("/admin", protect, admin, createMegaMenuItem);
router.put("/admin/reorder", protect, admin, reorderMegaMenuItems);
router.put("/admin/:id", protect, admin, updateMegaMenuItem);
router.delete("/admin/:id", protect, admin, deleteMegaMenuItem);

export default router;
