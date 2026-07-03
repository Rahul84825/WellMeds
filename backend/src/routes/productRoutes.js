import express from "express";
import { getProducts, getProduct, createProduct, updateProduct, deleteProduct } from "../controllers/productController.js";
import { protect } from "../middleware/authMiddleware.js";
import { admin } from "../middleware/adminMiddleware.js";
import { searchLimiter } from "../middleware/rateLimitMiddleware.js";

const router = express.Router();

router.route("/")
  .get(searchLimiter, getProducts)
  .post(protect, admin, createProduct);

router.route("/:id")
  .get(getProduct)
  .put(protect, admin, updateProduct)
  .delete(protect, admin, deleteProduct);

export default router;
