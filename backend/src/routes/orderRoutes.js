import express from "express";
import { placeOrder, getMyOrders, getOrders, updateOrderStatus, cancelOrder } from "../controllers/orderController.js";
import { protect } from "../middleware/authMiddleware.js";
import { admin } from "../middleware/adminMiddleware.js";

const router = express.Router();

// Customer placing & retrieving own orders
router.route("/")
  .post(protect, placeOrder)
  .get(protect, getMyOrders);

// Admin route to manage all orders
router.route("/all")
  .get(protect, admin, getOrders);

// Admin update & cancel hooks
router.route("/:id/status")
  .put(protect, admin, updateOrderStatus);

router.route("/:id/cancel")
  .put(protect, cancelOrder); // Cancelable by customer or admin

export default router;
