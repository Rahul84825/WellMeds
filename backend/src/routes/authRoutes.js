import express from "express";
import {
  registerUser,
  loginUser,
  forgotPassword,
  resetPassword,
  logout,
  refresh,
  getProfile,
  updateProfile,
  getSearchHistory,
  addSearchHistory,
  clearSearchHistory,
} from "../controllers/authController.js";
import { googleAuth } from "../controllers/googleAuthController.js";
import { protect, requireProfileComplete } from "../middleware/authMiddleware.js";

const router = express.Router();

// ─── Customer Authentication Endpoints ─────────────────────────────────────
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

// ─── Google Authentication ───────────────────────────────────────────────────
router.post("/google", googleAuth);

// ─── Session Management ────────────────────────────────────────────────────────
router.post("/logout", protect, logout);
router.post("/refresh", refresh);
router.get("/me", protect, getProfile);
router.put("/profile", protect, updateProfile);
router.patch("/profile", protect, updateProfile);

// ─── Search History Management ──────────────────────────────────────────────────
router.get("/search-history", protect, requireProfileComplete, getSearchHistory);
router.post("/search-history", protect, requireProfileComplete, addSearchHistory);
router.delete("/search-history", protect, requireProfileComplete, clearSearchHistory);

export default router;
