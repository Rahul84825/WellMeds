import express from "express";
import { logout, refresh, getProfile, updateProfile, getSearchHistory, addSearchHistory, clearSearchHistory } from "../controllers/authController.js";
import { sendOtp, verifyOtp } from "../controllers/otpController.js";
import { protect } from "../middleware/authMiddleware.js";
import { otpSendLimiter, otpVerifyLimiter } from "../middleware/rateLimitMiddleware.js";

const router = express.Router();

// ─── OTP Authentication (Primary auth method) ────────────────────────────────
router.post("/otp/send", otpSendLimiter, sendOtp);
router.post("/otp/verify", otpVerifyLimiter, verifyOtp);

// ─── Session Management ────────────────────────────────────────────────────────
router.post("/logout", protect, logout);
router.post("/refresh", refresh);
router.get("/me", protect, getProfile);
router.put("/profile", protect, updateProfile);

// ─── Search History Management ──────────────────────────────────────────────────
router.get("/search-history", protect, getSearchHistory);
router.post("/search-history", protect, addSearchHistory);
router.delete("/search-history", protect, clearSearchHistory);

export default router;
