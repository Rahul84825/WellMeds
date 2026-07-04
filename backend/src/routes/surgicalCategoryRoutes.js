import express from "express";
import { 
  getSurgicalCategories,
  getSurgicalCategoryBySlug,
  adminGetSurgicalCategories,
  createSurgicalCategory,
  updateSurgicalCategory,
  deleteSurgicalCategory,
  bulkReorderSurgicalCategories
} from "../controllers/surgicalCategoryController.js";
import { protect } from "../middleware/authMiddleware.js";
import { admin } from "../middleware/adminMiddleware.js";

const router = express.Router();

// Admin Bulk Reorder Route
router.route("/reorder").put(protect, admin, bulkReorderSurgicalCategories);

// Admin Get All Paginated Route
router.route("/admin/all").get(protect, admin, adminGetSurgicalCategories);

// Public Category List & Admin Create
router.route("/")
  .get(getSurgicalCategories)
  .post(protect, admin, createSurgicalCategory);

// Public Category Details
router.route("/:slug").get(getSurgicalCategoryBySlug);

// Admin Edit & Delete
router.route("/:id")
  .put(protect, admin, updateSurgicalCategory)
  .delete(protect, admin, deleteSurgicalCategory);

export default router;
