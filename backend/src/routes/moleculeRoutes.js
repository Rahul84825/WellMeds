import express from "express";
import { 
  getMolecules, 
  getMoleculeBySlug, 
  adminGetMolecules, 
  createMolecule, 
  updateMolecule, 
  deleteMolecule 
} from "../controllers/moleculeController.js";
import { protect } from "../middleware/authMiddleware.js";
import { admin } from "../middleware/adminMiddleware.js";

const router = express.Router();

// ──────────────────────────────────────────────
// IMPORTANT: Admin routes MUST come before /:slug
// to prevent Express matching "admin" as a slug.
// ──────────────────────────────────────────────

// Admin list route (paginated)
router.route("/admin/all").get(protect, admin, adminGetMolecules);

// Public list & Admin create routes
router.route("/")
  .get(getMolecules)
  .post(protect, admin, createMolecule);

// Public detail route by slug
router.route("/:slug").get(getMoleculeBySlug);

// Admin modify routes by ID
router.route("/:id")
  .put(protect, admin, updateMolecule)
  .delete(protect, admin, deleteMolecule);

export default router;
