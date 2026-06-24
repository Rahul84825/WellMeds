import express from "express";
import { 
  googleLogin, 
  logout, 
  refresh, 
  getProfile, 
  updateProfile,
  register,
  verifyEmail,
  login,
  forgotPassword,
  resetPassword
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authLimiter } from "../middleware/rateLimitMiddleware.js";

const router = express.Router();

// Google Authentication
router.post("/google", authLimiter, googleLogin);

// Email & Password Authentication
router.post("/register", authLimiter, register);
router.post("/login", authLimiter, login);
router.post("/verify-email", verifyEmail);
router.post("/forgot-password", authLimiter, forgotPassword);
router.post("/reset-password", authLimiter, resetPassword);

// Token and Session Management
router.post("/logout", protect, logout);
router.post("/refresh", refresh);
router.get("/me", protect, getProfile);
router.put("/profile", protect, updateProfile);

export default router;
