import express from "express";
import { 
  getSpecialities, 
  getSpecialityBySlug, 
  adminGetSpecialities, 
  createSpeciality, 
  updateSpeciality, 
  deleteSpeciality 
} from "../controllers/specialityController.js";
import { protect } from "../middleware/authMiddleware.js";
import { admin } from "../middleware/adminMiddleware.js";

const router = express.Router();

// ──────────────────────────────────────────────
// IMPORTANT: Admin routes MUST come before /:slug
// to prevent Express matching "admin" as a slug.
// ──────────────────────────────────────────────

// Admin Routes (protected — registered first to avoid /:slug collision)
router.route("/admin/all").get(protect, admin, adminGetSpecialities);

// Public Routes
router.route("/").get(getSpecialities).post(protect, admin, createSpeciality);
router.route("/:slug").get(getSpecialityBySlug);

// Admin write routes on /:id
router.route("/:id")
  .put(protect, admin, updateSpeciality)
  .delete(protect, admin, deleteSpeciality);

export default router;
