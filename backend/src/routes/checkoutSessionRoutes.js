import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  initSession,
  getSessionStatus,
  getCartRxStatus,
  modifyCart,
} from "../controllers/checkoutSessionController.js";

const router = express.Router();

router.post("/init", protect, initSession);
router.get("/status", protect, getSessionStatus);
router.get("/rx-status", protect, getCartRxStatus);
router.post("/modify-cart", protect, modifyCart);

export default router;

