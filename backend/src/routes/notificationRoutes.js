import express from "express";
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  subscribeEmail,
  getVapidPublicKey,
  subscribePush,
  unsubscribePush,
  getNotificationPreferences,
  updateNotificationPreferences,
} from "../controllers/notificationController.js";
import { protect, requireProfileComplete } from "../middleware/authMiddleware.js";
import { subscribeLimiter } from "../middleware/rateLimitMiddleware.js";

const router = express.Router();

// Public endpoint to retrieve public VAPID key (Private key is NEVER exposed)
router.get("/vapid-public-key", getVapidPublicKey);

// Dual-purpose subscribe dispatcher:
// 1. If payload contains endpoint/keys -> Web Push subscription (requires auth)
// 2. If payload contains email -> Maintenance / Coming Soon email waitlist (public with rate limiting)
router.post("/subscribe", (req, res, next) => {
  if (req.body && (req.body.endpoint || req.body.keys)) {
    return protect(req, res, () => {
      return subscribePush(req, res, next);
    });
  }
  return subscribeLimiter(req, res, () => {
    return subscribeEmail(req, res, next);
  });
});

// Explicit Web Push subscription & unsubscription endpoints (Authenticated)
router.post("/push-subscribe", protect, subscribePush);
router.delete("/unsubscribe", protect, unsubscribePush);
router.post("/unsubscribe", protect, unsubscribePush);

// User notification preferences
router.route("/preferences")
  .get(protect, getNotificationPreferences)
  .put(protect, updateNotificationPreferences);

// In-App Notification history & read status (Requires profile completion for customers)
router.use(protect, requireProfileComplete);

router.route("/")
  .get(getNotifications)
  .put(markAllAsRead);

router.route("/:id/read")
  .put(markAsRead);

export default router;
