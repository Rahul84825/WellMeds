import express from "express";
import { getNotifications, markAsRead, markAllAsRead, subscribeEmail } from "../controllers/notificationController.js";
import { protect } from "../middleware/authMiddleware.js";
import { subscribeLimiter } from "../middleware/rateLimitMiddleware.js";

const router = express.Router();

// Public subscribe endpoint for maintenance / coming soon page (with rate limiting)
router.post("/subscribe", subscribeLimiter, subscribeEmail);

router.use(protect);

router.route("/")
  .get(getNotifications)
  .put(markAllAsRead);

router.route("/:id/read")
  .put(markAsRead);

export default router;
