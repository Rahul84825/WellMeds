import express from "express";
import { getProducts, getProduct, createProduct, updateProduct, deleteProduct, getProductBrands } from "../controllers/productController.js";
import { protect } from "../middleware/authMiddleware.js";
import { admin } from "../middleware/adminMiddleware.js";

const router = express.Router();

router.route("/")
  .get(getProducts)
  .post(protect, admin, createProduct);

router.get("/brands", getProductBrands);

router.route("/:id")
  .get(getProduct)
  .put(protect, admin, updateProduct)
  .delete(protect, admin, deleteProduct);

export default router;
