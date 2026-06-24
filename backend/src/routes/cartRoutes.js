import express from "express";
import { getCart, addToCart, updateQuantity, removeFromCart, clearCart } from "../controllers/cartController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.route("/")
  .get(getCart)
  .post(addToCart)
  .put(updateQuantity)
  .delete(clearCart);

router.route("/:productId")
  .delete(removeFromCart);

export default router;
