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
  updatePrescriptionItems,
  checkoutPrescription,
} from "../controllers/prescriptionController.js";
import { protect } from "../middleware/authMiddleware.js";
import { admin } from "../middleware/adminMiddleware.js";
import { uploadPrescriptionFile } from "../middleware/uploadMiddleware.js";
import { uploadLimiter } from "../middleware/rateLimitMiddleware.js";

const router = express.Router();

// ── Patient: Upload ───────────────────────────────────────
router.post("/upload", protect, uploadLimiter, uploadPrescriptionFile.array("prescription", 10), uploadPrescription);

// ── Patient: Get own prescriptions ───────────────────────
router.get("/my", protect, getMyPrescriptions);

// ── Admin: Get ALL prescriptions ─────────────────────────
router.get("/all", protect, admin, getPrescriptions);

// ── Admin: Medicine Assignment, Status, Approve, Reject ───
router.put("/:id/items", protect, admin, updatePrescriptionItems);
router.put("/:id/status", protect, admin, updatePrescriptionStatus);
router.put("/:id/approve", protect, admin, approvePrescription);
router.put("/:id/reject", protect, admin, rejectPrescription);

// ── Patient: Checkout Approved Prescription ──────────────
router.post("/:id/checkout", protect, checkoutPrescription);

// ── Patient: Get / Delete single prescription ─────────────
router.get("/:id", protect, getPrescription);
router.delete("/:id", protect, deletePrescription);

export default router;
