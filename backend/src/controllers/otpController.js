import { OTP } from "../models/OTP.js";
import { User } from "../models/User.js";
import { generateToken } from "../utils/generateToken.js";
import { generateRefreshToken } from "../utils/generateRefreshToken.js";
import { sendSms, generateOtpCode, hashOtp } from "../services/otpService.js";
import otpConfig from "../config/otp.js";

// ─── Cookie Options ──────────────────────────────────────────────────────────
const getCookieOptions = (expireString) => {
  const isProduction = process.env.NODE_ENV === "production";
  let maxAge = 7 * 24 * 60 * 60 * 1000;
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

// ─── Validate mobile number format ──────────────────────────────────────────
const isValidMobile = (mobile) => {
  // Accept 10-digit Indian numbers or E.164 format (+91XXXXXXXXXX)
  return /^(\+91)?[6-9]\d{9}$/.test(mobile.trim());
};

// ─── Normalize mobile to consistent 10-digit format ─────────────────────────
const normalizeMobile = (mobile) => {
  return mobile.trim().replace(/^\+91/, "").replace(/^0/, "");
};

/**
 * POST /api/auth/otp/send
 * Step 1: Validate mobile → check rate limits → generate OTP → hash → store → send SMS
 *
 * Body: { mobile, name?, email? }
 * - mobile: required
 * - name, email: optional (used only if creating a new user)
 */
export const sendOtp = async (req, res, next) => {
  try {
    const { mobile, name, email } = req.body;

    // ── Validation ──────────────────────────────────────────────────────────
    if (!mobile) {
      return res.status(400).json({ success: false, message: "Mobile number is required" });
    }

    if (!isValidMobile(mobile)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid 10-digit Indian mobile number",
      });
    }

    const normalizedMobile = normalizeMobile(mobile);

    // ── Rate Limit: max OTP_RESEND_LIMIT sends per hour ──────────────────────
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const existingOtp = await OTP.findOne({ mobile: normalizedMobile });

    if (existingOtp) {
      // Reset the window if it's been more than an hour since first send
      if (existingOtp.windowStart < oneHourAgo) {
        // Window expired — reset counter
        await OTP.deleteOne({ _id: existingOtp._id });
      } else if (existingOtp.sendCount >= otpConfig.resendLimitPerHour) {
        const waitMinutes = Math.ceil(
          (60 * 60 * 1000 - (Date.now() - existingOtp.windowStart.getTime())) / 60000
        );
        return res.status(429).json({
          success: false,
          message: `Too many OTP requests. Please wait ${waitMinutes} minute(s) before requesting again.`,
        });
      }
    }

    // ── Check if user already exists (to decide UX flow) ────────────────────
    const existingUser = await User.findOne({ mobile: normalizedMobile });

    // ── Generate OTP ─────────────────────────────────────────────────────────
    // Dev bypass: allow 000000 as test OTP in development only
    const isDevBypass =
      process.env.NODE_ENV !== "production" &&
      process.env.ENABLE_DEV_OTP_BYPASS === "true";

    const otpCode = isDevBypass ? "000000" : generateOtpCode(otpConfig.length);
    const hashedOtpCode = hashOtp(otpCode, normalizedMobile);
    const expiresAt = new Date(Date.now() + otpConfig.expiryMinutes * 60 * 1000);

    // ── Upsert OTP record (replace any existing for this mobile) ─────────────
    await OTP.findOneAndUpdate(
      { mobile: normalizedMobile },
      {
        mobile: normalizedMobile,
        hashedOtp: hashedOtpCode,
        expiresAt,
        attempts: 0,
        $inc: { sendCount: existingOtp ? 1 : 0 },
        $setOnInsert: { sendCount: 1, windowStart: new Date() },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // ── Send SMS ─────────────────────────────────────────────────────────────
    await sendSms(normalizedMobile, otpCode);

    return res.status(200).json({
      success: true,
      message: `OTP sent to +91${normalizedMobile}`,
      isExistingUser: !!existingUser,
      // In development with console provider, include OTP in response for easy testing
      ...(process.env.NODE_ENV !== "production" && { devOtp: otpCode }),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/otp/verify
 * Step 2: Validate OTP → create or find user → issue JWT → auto-login
 *
 * Body: { mobile, otp, name?, email? }
 */
export const verifyOtp = async (req, res, next) => {
  try {
    const { mobile, otp, name, email } = req.body;

    // ── Validation ──────────────────────────────────────────────────────────
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

    // ── Fetch OTP record (with hashedOtp selected) ───────────────────────────
    const otpRecord = await OTP.findOne({ mobile: normalizedMobile }).select("+hashedOtp");

    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: "OTP not found or has expired. Please request a new OTP.",
      });
    }

    // ── Check expiry ─────────────────────────────────────────────────────────
    if (otpRecord.expiresAt < new Date()) {
      await OTP.deleteOne({ _id: otpRecord._id });
      return res.status(400).json({
        success: false,
        message: "OTP has expired. Please request a new one.",
      });
    }

    // ── Check max attempts ───────────────────────────────────────────────────
    if (otpRecord.attempts >= otpConfig.maxAttempts) {
      await OTP.deleteOne({ _id: otpRecord._id });
      return res.status(429).json({
        success: false,
        message: "Maximum OTP attempts reached. Please request a new OTP.",
      });
    }

    // ── Hash the submitted OTP and compare ───────────────────────────────────
    const submittedHash = hashOtp(String(otp), normalizedMobile);

    if (submittedHash !== otpRecord.hashedOtp) {
      // Increment attempts counter
      otpRecord.attempts += 1;
      await otpRecord.save();

      const remainingAttempts = otpConfig.maxAttempts - otpRecord.attempts;
      return res.status(400).json({
        success: false,
        message: `Incorrect OTP. ${remainingAttempts} attempt(s) remaining.`,
        remainingAttempts,
      });
    }

    // ── OTP is correct — delete it immediately (prevent replay attacks) ──────
    await OTP.deleteOne({ _id: otpRecord._id });

    // ── Find or create user ──────────────────────────────────────────────────
    let user = await User.findOne({ mobile: normalizedMobile });

    if (!user) {
      // New user — create account
      const userData = {
        mobile: normalizedMobile,
        authProvider: "phone",
        isVerified: true, // Phone OTP = verified by definition
        role: "customer",
        lastLogin: new Date(),
      };

      // Only add name/email if provided (they're optional for phone auth)
      if (name && name.trim()) userData.name = name.trim();
      if (email && email.trim()) userData.email = email.trim().toLowerCase();

      // If name not provided, set a default (can be updated from profile)
      if (!userData.name) userData.name = `User ${normalizedMobile.slice(-4)}`;

      user = await User.create(userData);
    } else {
      // Existing user — update last login only, ignore any submitted name/email
      user.lastLogin = new Date();
      // Mark as verified in case they were created through a different flow
      user.isVerified = true;
      await user.save();
    }

    // ── Generate JWT tokens ───────────────────────────────────────────────────
    const accessToken = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    user.refreshToken = refreshToken;
    await user.save();

    // ── Set cookies ───────────────────────────────────────────────────────────
    res.cookie("accessToken", accessToken, getCookieOptions(process.env.JWT_EXPIRE));
    res.cookie("refreshToken", refreshToken, getCookieOptions(process.env.JWT_REFRESH_EXPIRE));

    return res.status(200).json({
      success: true,
      message: user.createdAt.getTime() === user.updatedAt.getTime()
        ? "Account created and logged in successfully!"
        : "Logged in successfully!",
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
