import express from "express";
import { 
  applyCoupon, 
  createCoupon, 
  deleteCoupon, 
  getCoupons, 
  validateCouponCode 
} from "../controllers/couponController.js";
import { protect, requireProfileComplete } from "../middleware/authMiddleware.js";
import { admin } from "../middleware/adminMiddleware.js";
import { couponLimiter } from "../middleware/rateLimitMiddleware.js";

const router = express.Router();

// GET /api/coupons — get active, non-expired coupons (public)
router.get("/", getCoupons);

// POST /api/coupons/validate — validate coupon code (protect + profile complete)
router.post("/validate", protect, requireProfileComplete, couponLimiter, validateCouponCode);

// POST /api/coupons/apply — apply coupon at checkout (protect + profile complete)
router.post("/apply", protect, requireProfileComplete, couponLimiter, applyCoupon);

// POST /api/coupons — create a new coupon (admin only)
router.post("/", protect, admin, createCoupon);

// DELETE /api/coupons/:id — delete coupon (admin only)
router.delete("/:id", protect, admin, deleteCoupon);

export default router;
