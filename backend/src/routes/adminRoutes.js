import express from "express";
import { 
  getDashboardStats, 
  getUsers, 
  updateUserRole, 
  uploadAdminImage 
} from "../controllers/adminController.js";
import { approvePrescription, rejectPrescription, updatePrescriptionStatus } from "../controllers/prescriptionController.js";
import { 
  adminGetCoupons, 
  adminCreateCoupon, 
  adminUpdateCoupon, 
  adminDeleteCoupon 
} from "../controllers/couponController.js";
import { protect } from "../middleware/authMiddleware.js";
import { admin } from "../middleware/adminMiddleware.js";
import { uploadImage } from "../middleware/uploadMiddleware.js";
import { uploadLimiter } from "../middleware/rateLimitMiddleware.js";

const router = express.Router();

// Upload image (admin only)
router.post("/upload", protect, admin, uploadLimiter, uploadImage.single("image"), uploadAdminImage);

// Dashboard stats
router.get("/stats", protect, admin, getDashboardStats);

// User management
router.get("/users", protect, admin, getUsers);
router.put("/users/:id/role", protect, admin, updateUserRole);

// Prescription review
router.put("/prescriptions/:id/approve", protect, admin, approvePrescription);
router.put("/prescriptions/:id/reject", protect, admin, rejectPrescription);
router.put("/prescriptions/:id/status", protect, admin, updatePrescriptionStatus);

// Coupon management (admin only)
router.get("/coupons", protect, admin, adminGetCoupons);
router.post("/coupons", protect, admin, adminCreateCoupon);
router.put("/coupons/:id", protect, admin, adminUpdateCoupon);
router.delete("/coupons/:id", protect, admin, adminDeleteCoupon);

export default router;
