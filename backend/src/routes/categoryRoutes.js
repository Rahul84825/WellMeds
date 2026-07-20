import express from "express";
import { 
  getCategories, 
  getCategoryBySlug,
  createCategory, 
  deleteCategory,
  updateCategory 
} from "../controllers/categoryController.js";
import { protect } from "../middleware/authMiddleware.js";
import { admin } from "../middleware/adminMiddleware.js";

const router = express.Router();

router.route("/")
  .get(getCategories)
  .post(protect, admin, createCategory);

router.route("/:id")
  .get(getCategoryBySlug)
  .put(protect, admin, updateCategory)
  .delete(protect, admin, deleteCategory);

export default router;
