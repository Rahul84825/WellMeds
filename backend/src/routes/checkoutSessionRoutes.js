import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  initSession,
  getSessionStatus,
  modifyCart,
} from "../controllers/checkoutSessionController.js";

const router = express.Router();

router.post("/init", protect, initSession);
router.get("/status", protect, getSessionStatus);
router.post("/modify-cart", protect, modifyCart);

export default router;
