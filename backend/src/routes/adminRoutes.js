import express from "express";
import { getDashboardStats, getUsers, updateUserRole } from "../controllers/adminController.js";
import { approvePrescription, rejectPrescription, updatePrescriptionStatus } from "../controllers/prescriptionController.js";
import { protect } from "../middleware/authMiddleware.js";
import { admin } from "../middleware/adminMiddleware.js";

const router = express.Router();

// Dashboard stats
router.get("/stats", protect, admin, getDashboardStats);

// User management
router.get("/users", protect, admin, getUsers);
router.put("/users/:id/role", protect, admin, updateUserRole);

// Prescription review
router.put("/prescriptions/:id/approve", protect, admin, approvePrescription);
router.put("/prescriptions/:id/reject", protect, admin, rejectPrescription);
router.put("/prescriptions/:id/status", protect, admin, updatePrescriptionStatus);

export default router;
