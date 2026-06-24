import express from "express";
import { getWishlist, toggleWishlist } from "../controllers/wishlistController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.route("/")
  .get(getWishlist)
  .post(toggleWishlist);

// Alias route for frontend convenience: POST /api/wishlist/toggle
router.post("/toggle", toggleWishlist);

export default router;
