import express from "express";
import { 
  placeOrder, 
  getMyOrders, 
  getOrders, 
  updateOrderStatus, 
  cancelOrder, 
  createRazorpayOrder, 
  handleWebhook, 
  getOrderStatus 
} from "../controllers/orderController.js";
import { protect, requireProfileComplete } from "../middleware/authMiddleware.js";
import { admin } from "../middleware/adminMiddleware.js";

const router = express.Router();

// Customer placing & retrieving own orders (Requires complete profile)
router.route("/")
  .post(protect, requireProfileComplete, placeOrder)
  .get(protect, requireProfileComplete, getMyOrders);

router.route("/razorpay")
  .post(protect, requireProfileComplete, createRazorpayOrder);

router.route("/status/:razorpayOrderId")
  .get(protect, requireProfileComplete, getOrderStatus);

// Public webhook endpoint for Razorpay notifications
router.route("/webhook")
  .post(handleWebhook);

// Admin route to manage all orders
router.route("/all")
  .get(protect, admin, getOrders);

// Admin update & cancel hooks
router.route("/:id/status")
  .put(protect, admin, updateOrderStatus);

router.route("/:id/cancel")
  .put(protect, requireProfileComplete, cancelOrder); // Cancelable by customer (with complete profile) or admin

export default router;
