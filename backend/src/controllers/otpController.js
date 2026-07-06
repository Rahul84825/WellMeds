import { OTP } from "../models/OTP.js";
import { User } from "../models/User.js";
import { generateToken } from "../utils/generateToken.js";
import { generateRefreshToken } from "../utils/generateRefreshToken.js";
import { sendSms, generateOtpCode, hashOtp } from "../services/otpService.js";
import otpConfig from "../config/otp.js";

// ─── Cookie Options ──────────────────────────────────────────────────────────
const getCookieOptions = (expireString) => {
  const isProduction = process.env.NODE_ENV === "production";
  let maxAge = 30 * 24 * 60 * 60 * 1000; // Default 30 days
  if (expireString && expireString.endsWith("d")) {
    const days = parseInt(expireString.slice(0, -1));
    if (!isNaN(days)) maxAge = days * 24 * 60 * 60 * 1000;
  } else if (expireString && expireString.endsWith("m")) {
    const minutes = parseInt(expireString.slice(0, -1));
    if (!isNaN(minutes)) maxAge = minutes * 60 * 1000;
  }
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    maxAge,
  };
};

// ─── Structured Security Logger (masked mobile) ───────────────────────────────
const maskMobile = (mobile) => {
  if (!mobile) return "unknown";
  const s = String(mobile);
  return s.length >= 4 ? `XXXXXX${s.slice(-4)}` : "XXXX";
};

const secLog = (tag, data = {}) => {
  const ts = new Date().toISOString();
  const parts = Object.entries(data)
    .map(([k, v]) => `${k}=${v}`)
    .join(" ");
  console.log(`[${ts}] [OTP]${tag} ${parts}`);
};

// ─── Mobile validation ────────────────────────────────────────────────────────
const isValidMobile = (mobile) => {
  // Indian 10-digit numbers (6-9 prefix) with optional +91 country code
  return /^(\+91)?[6-9]\d{9}$/.test(mobile.trim());
};

const normalizeMobile = (mobile) => {
  return mobile.trim().replace(/^\+91/, "").replace(/^0/, "");
};

/**
 * POST /api/auth/otp/send
 *
 * Rate limits (per phone, per hour):
 *   - Max OTP_RESEND_LIMIT sends (default 5)
 *   - Window resets after 1 hour from first send in that window
 *
 * Security: OTP hashed before storage. Never stored plaintext.
 */
export const sendOtp = async (req, res, next) => {
  try {
    const { mobile, name, email } = req.body;

    if (!mobile) {
      return res.status(400).json({ success: false, message: "Mobile number is required" });
    }

    if (!isValidMobile(mobile)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid 10-digit mobile number starting with 6, 7, 8, or 9.",
      });
    }

    const normalizedMobile = normalizeMobile(mobile);

    // ── Per-phone rate limiting (fixed two-step approach) ─────────────────────
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    let existingOtp = await OTP.findOne({ mobile: normalizedMobile });

    if (existingOtp) {
      const windowExpired = existingOtp.windowStart < oneHourAgo;

      if (windowExpired) {
        // Reset window — delete old record, fresh start
        await OTP.deleteOne({ _id: existingOtp._id });
        existingOtp = null;
        secLog("[RATE_WINDOW_RESET]", { mobile: maskMobile(normalizedMobile) });
      } else if (existingOtp.sendCount >= otpConfig.resendLimitPerHour) {
        const waitMs = 60 * 60 * 1000 - (Date.now() - existingOtp.windowStart.getTime());
        const waitMinutes = Math.ceil(waitMs / 60000);
        secLog("[RATE_LIMIT]", { mobile: maskMobile(normalizedMobile), sendCount: existingOtp.sendCount });
        return res.status(429).json({
          success: false,
          message: `Too many OTP requests. Please try again after ${waitMinutes} minute(s).`,
          retryAfterMinutes: waitMinutes,
        });
      }
    }

    // ── Check if existing user ────────────────────────────────────────────────
    const existingUser = await User.findOne({ mobile: normalizedMobile });

    // ── Generate OTP ──────────────────────────────────────────────────────────
    const isDevBypass =
      process.env.NODE_ENV !== "production" &&
      process.env.ENABLE_DEV_OTP_BYPASS === "true";

    const otpCode = isDevBypass ? "000000" : generateOtpCode(otpConfig.length);
    const hashedOtpCode = hashOtp(otpCode, normalizedMobile);
    const expiresAt = new Date(Date.now() + otpConfig.expiryMinutes * 60 * 1000);

    secLog("[SEND]", {
      mobile: maskMobile(normalizedMobile),
      isExistingUser: !!existingUser,
      provider: otpConfig.provider,
    });

    // ── Upsert OTP record (correct two-step — avoids $inc upsert race) ────────
    if (existingOtp) {
      // Update existing record: reset hash/expiry/attempts, increment send counter
      existingOtp.hashedOtp = hashedOtpCode;
      existingOtp.expiresAt = expiresAt;
      existingOtp.attempts = 0;
      existingOtp.sendCount = existingOtp.sendCount + 1;
      await existingOtp.save();
    } else {
      // Create new record with window start
      await OTP.create({
        mobile: normalizedMobile,
        hashedOtp: hashedOtpCode,
        expiresAt,
        attempts: 0,
        sendCount: 1,
        windowStart: new Date(),
      });
    }

    // ── Send SMS via provider ─────────────────────────────────────────────────
    await sendSms(normalizedMobile, otpCode);

    return res.status(200).json({
      success: true,
      message: `OTP sent to +91 ${normalizedMobile}`,
      isExistingUser: !!existingUser,
      expiresInMinutes: otpConfig.expiryMinutes,
      // Include OTP in response body ONLY in development for easy testing
      ...(process.env.NODE_ENV !== "production" && { devOtp: otpCode }),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/otp/verify
 *
 * Validates OTP → finds or creates user → issues JWT access + refresh tokens.
 * OTP is deleted immediately after correct verification (prevents replay attacks).
 * After 3 wrong attempts, the OTP record is also deleted (forces new send).
 */
export const verifyOtp = async (req, res, next) => {
  try {
    const { mobile, otp, name, email } = req.body;

    if (!mobile || !otp) {
      return res.status(400).json({ success: false, message: "Mobile and OTP are required" });
    }

    if (String(otp).length !== otpConfig.length) {
      return res.status(400).json({
        success: false,
        message: `OTP must be ${otpConfig.length} digits`,
      });
    }

    const normalizedMobile = normalizeMobile(mobile);

    // ── Fetch OTP record ──────────────────────────────────────────────────────
    const otpRecord = await OTP.findOne({ mobile: normalizedMobile }).select("+hashedOtp");

    if (!otpRecord) {
      secLog("[VERIFY][NO_RECORD]", { mobile: maskMobile(normalizedMobile) });
      return res.status(400).json({
        success: false,
        message: "OTP has expired or was not sent. Please request a new OTP.",
      });
    }

    // ── Check expiry ──────────────────────────────────────────────────────────
    if (otpRecord.expiresAt < new Date()) {
      await OTP.deleteOne({ _id: otpRecord._id });
      secLog("[VERIFY][EXPIRED]", { mobile: maskMobile(normalizedMobile) });
      return res.status(400).json({
        success: false,
        message: "OTP has expired. Please request a new one.",
      });
    }

    // ── Check max attempts BEFORE comparing ───────────────────────────────────
    if (otpRecord.attempts >= otpConfig.maxAttempts) {
      await OTP.deleteOne({ _id: otpRecord._id });
      secLog("[VERIFY][MAX_ATTEMPTS]", { mobile: maskMobile(normalizedMobile), attempts: otpRecord.attempts });
      return res.status(429).json({
        success: false,
        message: "Too many incorrect attempts. Please request a new OTP.",
      });
    }

    // ── Hash submitted OTP and compare ───────────────────────────────────────
    const submittedHash = hashOtp(String(otp), normalizedMobile);

    if (submittedHash !== otpRecord.hashedOtp) {
      otpRecord.attempts += 1;
      const remainingAttempts = otpConfig.maxAttempts - otpRecord.attempts;

      if (remainingAttempts <= 0) {
        // Lock out: delete OTP record
        await OTP.deleteOne({ _id: otpRecord._id });
        secLog("[VERIFY][FAIL][LOCKED]", { mobile: maskMobile(normalizedMobile) });
        return res.status(429).json({
          success: false,
          message: "Too many incorrect attempts. Please request a new OTP.",
          remainingAttempts: 0,
        });
      }

      await otpRecord.save();
      secLog("[VERIFY][FAIL]", {
        mobile: maskMobile(normalizedMobile),
        attempts: otpRecord.attempts,
        remainingAttempts,
      });

      return res.status(400).json({
        success: false,
        message: `Incorrect OTP. ${remainingAttempts} attempt${remainingAttempts !== 1 ? "s" : ""} remaining.`,
        remainingAttempts,
      });
    }

    // ── OTP correct — delete immediately to prevent replay ────────────────────
    await OTP.deleteOne({ _id: otpRecord._id });

    // ── Find or create user ───────────────────────────────────────────────────
    let user = await User.findOne({ mobile: normalizedMobile });
    let isNewUser = false;

    if (!user) {
      isNewUser = true;
      const userData = {
        mobile: normalizedMobile,
        authProvider: "phone",
        isVerified: true,
        role: "customer",
        lastLogin: new Date(),
      };

      if (name && name.trim()) userData.name = name.trim();
      if (email && email.trim()) userData.email = email.trim().toLowerCase();
      if (!userData.name) userData.name = `User ${normalizedMobile.slice(-4)}`;

      user = await User.create(userData);
      secLog("[REGISTER]", { userId: user._id, mobile: maskMobile(normalizedMobile) });
    } else {
      user.lastLogin = new Date();
      user.isVerified = true;
      await user.save();
      secLog("[LOGIN]", { userId: user._id, mobile: maskMobile(normalizedMobile) });
    }

    // ── Issue JWT tokens ──────────────────────────────────────────────────────
    const accessToken = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    user.refreshToken = refreshToken;
    await user.save();

    // ── Set HttpOnly cookies ──────────────────────────────────────────────────
    res.cookie("accessToken", accessToken, getCookieOptions(process.env.JWT_EXPIRE));
    res.cookie("refreshToken", refreshToken, getCookieOptions(process.env.JWT_REFRESH_EXPIRE));

    return res.status(200).json({
      success: true,
      isNewUser,
      message: isNewUser ? "Account created and logged in successfully!" : "Logged in successfully!",
      token: accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email || null,
        mobile: user.mobile,
        role: user.role,
        avatar: user.avatar || "",
        authProvider: user.authProvider,
      },
    });
  } catch (error) {
    next(error);
  }
};
