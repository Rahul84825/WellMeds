import { OTP } from "../models/OTP.js";
import { User } from "../models/User.js";
import { generateToken } from "../utils/generateToken.js";
import { generateRefreshToken } from "../utils/generateRefreshToken.js";
import { sendSms, generateOtpCode, hashOtp } from "../services/otpService.js";
import otpConfig from "../config/otp.js";

// ─── Cookie Options ──────────────────────────────────────────────────────────
const getCookieOptions = (expireString, req) => {
  const isSecure = process.env.NODE_ENV === "production" || 
                   (req && (req.secure || req.headers["x-forwarded-proto"] === "https"));

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
    secure: isSecure,
    sameSite: isSecure ? "none" : "lax",
    maxAge,
    path: "/",
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
    const existingUser = await User.findOne({ mobile: normalizedMobile });

    const isDevBypass =
      process.env.NODE_ENV !== "production" &&
      process.env.ENABLE_DEV_OTP_BYPASS === "true";

    const otpCode = isDevBypass ? "000000" : generateOtpCode(otpConfig.length);
    const hashedOtpCode = hashOtp(otpCode, normalizedMobile);
    const expiresAt = new Date(Date.now() + otpConfig.expiryMinutes * 60 * 1000);

    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    let otpDoc = await OTP.findOne({ mobile: normalizedMobile });

    if (otpDoc) {
      // 1. Check firstSendAt window (windowStart/firstSendAt)
      // If the window has expired, reset window and start sendCount at 1
      const firstSendTime = otpDoc.firstSendAt || otpDoc.windowStart || now;
      const isWindowExpired = firstSendTime < oneHourAgo;

      if (isWindowExpired) {
        otpDoc.firstSendAt = now;
        otpDoc.windowStart = now;
        otpDoc.sendCount = 1;
      } else {
        // 2. Enforce max OTP/hour limit (e.g. 5 sends)
        if (otpDoc.sendCount >= otpConfig.resendLimitPerHour) {
          const waitMs = 60 * 60 * 1000 - (now.getTime() - firstSendTime.getTime());
          const waitMinutes = Math.ceil(waitMs / 60000);
          secLog("[RATE_LIMIT]", { mobile: maskMobile(normalizedMobile), sendCount: otpDoc.sendCount });
          return res.status(429).json({
            success: false,
            message: `Too many OTP requests. Please try again after ${waitMinutes} minute(s).`,
            retryAfterMinutes: waitMinutes,
          });
        }
        // Increment sendCount normally
        otpDoc.sendCount += 1;
      }

      // Reuse the same document, regenerate OTP hash, expiresAt, and reset attempts
      otpDoc.hashedOtp = hashedOtpCode;
      otpDoc.otpHash = hashedOtpCode;
      otpDoc.expiresAt = expiresAt;
      otpDoc.attempts = 0;
      await otpDoc.save();
      secLog("[RESEND]", { mobile: maskMobile(normalizedMobile), sendCount: otpDoc.sendCount });
    } else {
      // 3. Create a completely new OTP document
      await OTP.create({
        mobile: normalizedMobile,
        hashedOtp: hashedOtpCode,
        otpHash: hashedOtpCode,
        expiresAt,
        attempts: 0,
        sendCount: 1,
        firstSendAt: now,
        windowStart: now,
      });
      secLog("[SEND]", { mobile: maskMobile(normalizedMobile), sendCount: 1 });
    }

    // ── Send SMS via provider ─────────────────────────────────────────────────
    await sendSms(normalizedMobile, otpCode);

    return res.status(200).json({
      success: true,
      message: `OTP sent to +91 ${normalizedMobile}`,
      isExistingUser: !!existingUser,
      expiresInMinutes: otpConfig.expiryMinutes,
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

    // ── Step 1: Validate input ────────────────────────────────────────────────
    console.log("[OTP][VERIFY] received mobile:", mobile ? maskMobile(normalizeMobile(mobile)) : "MISSING");
    console.log("[OTP][VERIFY] received otp:", otp ? `${String(otp).length} digits` : "MISSING");

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

    // ── Step 2: Fetch OTP record ──────────────────────────────────────────────
    const otpRecord = await OTP.findOne({ mobile: normalizedMobile }).select("+hashedOtp +otpHash");
    console.log("[OTP][VERIFY] otp document found:", !!otpRecord);

    if (!otpRecord) {
      secLog("[VERIFY][NO_RECORD]", { mobile: maskMobile(normalizedMobile) });
      return res.status(400).json({
        success: false,
        message: "OTP has expired or was not sent. Please request a new OTP.",
      });
    }

    // ── Step 3: Check expiry ──────────────────────────────────────────────────
    const isExpired = otpRecord.expiresAt < new Date();
    console.log("[OTP][VERIFY] otp expired:", isExpired, "expiresAt:", otpRecord.expiresAt);

    if (isExpired) {
      await OTP.deleteOne({ _id: otpRecord._id });
      secLog("[VERIFY][EXPIRED]", { mobile: maskMobile(normalizedMobile) });
      return res.status(400).json({
        success: false,
        message: "OTP has expired. Please request a new one.",
      });
    }

    // ── Step 4: Check max attempts BEFORE comparing ───────────────────────────
    if (otpRecord.attempts >= otpConfig.maxAttempts) {
      await OTP.deleteOne({ _id: otpRecord._id });
      secLog("[VERIFY][MAX_ATTEMPTS]", { mobile: maskMobile(normalizedMobile), attempts: otpRecord.attempts });
      return res.status(429).json({
        success: false,
        message: "Too many incorrect attempts. Please request a new OTP.",
      });
    }

    // ── Step 5: Hash submitted OTP and compare ────────────────────────────────
    const submittedHash = hashOtp(String(otp), normalizedMobile);
    const otpMatched = submittedHash === otpRecord.hashedOtp || submittedHash === otpRecord.otpHash;
    console.log("[OTP][VERIFY] otp matched:", otpMatched);

    if (!otpMatched) {
      otpRecord.attempts += 1;
      const remainingAttempts = otpConfig.maxAttempts - otpRecord.attempts;

      if (remainingAttempts <= 0) {
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

    // ── Step 6: Find existing user by phone ───────────────────────────────────
    let user = await User.findOne({ mobile: normalizedMobile });
    console.log("[OTP][VERIFY] existing user found:", !!user, user ? `id=${user._id}` : "");
    let isNewUser = false;

    if (!user) {
      // ── Step 7a: Create new user ────────────────────────────────────────────
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

      try {
        user = await User.create(userData);
        console.log("[OTP][VERIFY] new user created: id=", user._id);
        secLog("[REGISTER]", { userId: user._id, mobile: maskMobile(normalizedMobile) });
      } catch (createErr) {
        // E11000: user was concurrently created (race) or already exists under a different lookup
        if (createErr.code === 11000) {
          console.error("[OTP][VERIFY] E11000 on create — falling back to findOne. Full error:", createErr);
          // The duplicate field tells us the user already exists — log them in instead
          const dupKey = Object.keys(createErr.keyPattern || {})[0] || "unknown";
          console.log("[OTP][VERIFY] duplicate key field:", dupKey);

          // Re-fetch by mobile (the definitive identifier for OTP auth)
          user = await User.findOne({ mobile: normalizedMobile });
          if (!user && dupKey === "email") {
            // Rare case: email duplicate but different mobile — find by email
            const normalizedEmail = userData.email;
            user = await User.findOne({ email: normalizedEmail });
          }

          if (!user) {
            // Cannot resolve the conflict — surface a clean 500
            console.error("[OTP][VERIFY] Could not resolve duplicate user after E11000");
            return res.status(500).json({
              success: false,
              message: "We couldn't complete sign in. Please try again.",
            });
          }

          isNewUser = false; // treat as existing login
          console.log("[OTP][VERIFY] resolved to existing user: id=", user._id);
        } else {
          throw createErr; // unexpected error — re-throw for generic handler
        }
      }
    } else {
      // ── Step 7b: Update existing user ──────────────────────────────────────
      user.lastLogin = new Date();
      user.isVerified = true;

      // If the user didn't have a name yet, set it now
      if (!user.name && name && name.trim()) user.name = name.trim();

      // Update email only if the user has none and the provided email isn't already taken
      if (!user.email && email && email.trim()) {
        const emailLower = email.trim().toLowerCase();
        const emailOwner = await User.findOne({ email: emailLower });
        if (!emailOwner || emailOwner._id.equals(user._id)) {
          user.email = emailLower;
        }
      }

      await user.save();
      secLog("[LOGIN]", { userId: user._id, mobile: maskMobile(normalizedMobile) });
    }

    // ── Step 8: Issue JWT tokens ──────────────────────────────────────────────
    const accessToken = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);
    console.log("[OTP][VERIFY] jwt issued: userId=", user._id);

    // Use updateOne to avoid triggering full schema validation / unique-index re-check
    // This is safe because we only touch the refreshToken field.
    await User.updateOne({ _id: user._id }, { $set: { refreshToken } });

    // ── Set HttpOnly cookies ──────────────────────────────────────────────────
    res.cookie("accessToken", accessToken, getCookieOptions(process.env.JWT_EXPIRE, req));
    res.cookie("refreshToken", refreshToken, getCookieOptions(process.env.JWT_REFRESH_EXPIRE, req));

    const statusCode = isNewUser ? 201 : 200;

    return res.status(statusCode).json({
      success: true,
      isNewUser,
      message: isNewUser ? "Account created and logged in successfully!" : "Logged in successfully!",
      token: accessToken,
      refreshToken: refreshToken,
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
    // Print full error to server logs regardless of environment
    console.error("[OTP][VERIFY][UNHANDLED_ERROR] Full error:", error);
    next(error);
  }
};
