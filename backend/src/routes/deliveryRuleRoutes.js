import express from "express";
import {
  calculateDeliveryFee,
  getDeliveryRules,
  createDeliveryRule,
} from "../controllers/deliveryRuleController.js";
import { protect } from "../middleware/authMiddleware.js";
import { admin } from "../middleware/adminMiddleware.js";

const router = express.Router();

router.post("/calculate", calculateDeliveryFee);

// Admin routes for dynamic delivery pricing management
router.route("/")
  .get(protect, admin, getDeliveryRules)
  .post(protect, admin, createDeliveryRule);

export default router;
