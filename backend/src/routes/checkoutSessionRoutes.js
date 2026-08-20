import express from "express";
import { protect, requireProfileComplete } from "../middleware/authMiddleware.js";
import {
  initSession,
  getSessionStatus,
  getCartRxStatus,
  modifyCart,
} from "../controllers/checkoutSessionController.js";

const router = express.Router();

router.use(protect, requireProfileComplete);

router.post("/init", initSession);
router.get("/status", getSessionStatus);
router.get("/rx-status", getCartRxStatus);
router.post("/modify-cart", modifyCart);

export default router;

