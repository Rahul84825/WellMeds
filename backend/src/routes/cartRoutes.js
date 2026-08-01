import express from "express";
import { getCart, addToCart, updateQuantity, removeFromCart, clearCart } from "../controllers/cartController.js";
import { protect } from "../middleware/authMiddleware.js";
import { checkCartLock } from "../middleware/cartLockMiddleware.js";

const router = express.Router();

router.use(protect);

router.route("/")
  .get(getCart)
  .post(checkCartLock, addToCart)
  .put(checkCartLock, updateQuantity)
  .delete(checkCartLock, clearCart);

router.route("/:productId")
  .delete(checkCartLock, removeFromCart);

export default router;
