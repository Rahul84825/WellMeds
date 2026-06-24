import express from "express";
import {
  uploadPrescription,
  getMyPrescriptions,
  getPrescription,
  deletePrescription,
  getPrescriptions,
  updatePrescriptionStatus,
  approvePrescription,
  rejectPrescription,
} from "../controllers/prescriptionController.js";
import { protect } from "../middleware/authMiddleware.js";
import { admin } from "../middleware/adminMiddleware.js";
import { upload } from "../middleware/uploadMiddleware.js";

const router = express.Router();

// ─────────────────────────────────────────────────────────
// IMPORTANT: Route ordering matters in Express.
// Specific string routes (/upload, /my, /all) MUST come
// before parameterised routes (/:id) to avoid shadowing.
// ─────────────────────────────────────────────────────────

// ── Patient: Upload ───────────────────────────────────────
router.post("/upload", protect, upload.single("prescription"), uploadPrescription);

// ── Patient: Get own prescriptions ───────────────────────
router.get("/my", protect, getMyPrescriptions);

// ── Admin: Get ALL prescriptions (with ?status=&search=) ─
// NOTE: must be before /:id so "/all" isn't treated as an ID
router.get("/all", protect, admin, getPrescriptions);

// ── Admin: Status, Approve, Reject by ID ─────────────────
router.put("/:id/status", protect, admin, updatePrescriptionStatus);
router.put("/:id/approve", protect, admin, approvePrescription);
router.put("/:id/reject", protect, admin, rejectPrescription);

// ── Patient: Get / Delete single prescription ─────────────
// These come LAST because /:id is a wildcard param
router.get("/:id", protect, getPrescription);
router.delete("/:id", protect, deletePrescription);

export default router;
