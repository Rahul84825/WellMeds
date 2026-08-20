import express from "express";
import {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/productController.js";
import { protect } from "../middleware/authMiddleware.js";
import { admin } from "../middleware/adminMiddleware.js";
import { searchLimiter } from "../middleware/rateLimitMiddleware.js";

const router = express.Router();

// Middleware to preset isSurgical filter on query
const presetSurgicalQuery = (req, res, next) => {
  req.query.isSurgical = "true";
  next();
};

const presetSurgicalBody = (req, res, next) => {
  req.body.isSurgical = true;
  next();
};

router
  .route("/")
  .get(searchLimiter, presetSurgicalQuery, getProducts)
  .post(protect, admin, presetSurgicalBody, createProduct);

router
  .route("/:id")
  .get(getProduct)
  .put(protect, admin, presetSurgicalBody, updateProduct)
  .delete(protect, admin, deleteProduct);

export default router;
