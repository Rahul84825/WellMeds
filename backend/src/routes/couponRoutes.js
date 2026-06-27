import express from "express";
import { 
  applyCoupon, 
  createCoupon, 
  deleteCoupon, 
  getCoupons, 
  validateCouponCode 
} from "../controllers/couponController.js";
import { protect } from "../middleware/authMiddleware.js";
import { admin } from "../middleware/adminMiddleware.js";

const router = express.Router();

// GET /api/coupons — get active, non-expired coupons (public)
router.get("/", getCoupons);

// POST /api/coupons/validate — validate coupon code (protect)
router.post("/validate", protect, validateCouponCode);

// POST /api/coupons/apply — apply coupon at checkout (any logged-in user)
router.post("/apply", protect, applyCoupon);

// POST /api/coupons — create a new coupon (admin only)
router.post("/", protect, admin, createCoupon);

// DELETE /api/coupons/:id — delete coupon (admin only)
router.delete("/:id", protect, admin, deleteCoupon);

export default router;
