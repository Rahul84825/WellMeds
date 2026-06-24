import express from "express";
import { googleLogin, logout, refresh, getProfile, updateProfile } from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authLimiter } from "../middleware/rateLimitMiddleware.js";

const router = express.Router();

// Unified Google Login
router.post("/google", authLimiter, googleLogin);

// Token and Session Management
router.post("/logout", protect, logout);
router.post("/refresh", refresh);
router.get("/me", protect, getProfile);
router.put("/profile", protect, updateProfile);

export default router;
