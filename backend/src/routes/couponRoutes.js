import express from "express";
import { applyCoupon, createCoupon, deleteCoupon } from "../controllers/couponController.js";
import { protect } from "../middleware/authMiddleware.js";
import { admin } from "../middleware/adminMiddleware.js";

const router = express.Router();

// POST /api/coupons/apply — apply coupon at checkout (any logged-in user)
router.post("/apply", protect, applyCoupon);

// POST /api/coupons — create a new coupon (admin only)
router.post("/", protect, admin, createCoupon);

// DELETE /api/coupons/:id — delete coupon (admin only)
router.delete("/:id", protect, admin, deleteCoupon);

export default router;
