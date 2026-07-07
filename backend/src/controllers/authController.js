import { User } from "../models/User.js";
import { generateToken } from "../utils/generateToken.js";
import { generateRefreshToken } from "../utils/generateRefreshToken.js";
import jwt from "jsonwebtoken";

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

// ─── Security Logger ─────────────────────────────────────────────────────────
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
  console.log(`[${ts}] [AUTH]${tag} ${parts}`);
};

// ─── Logout ──────────────────────────────────────────────────────────────────
export const logout = async (req, res, next) => {
  try {
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");

    if (req.user) {
      secLog("[LOGOUT]", { userId: req.user._id });
      req.user.refreshToken = "";
      await req.user.save();
    }

    res.status(200).json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    next(error);
  }
};

// ─── Refresh (Sliding Window) ─────────────────────────────────────────────────
export const refresh = async (req, res, next) => {
  const token = req.cookies.refreshToken || req.body.refreshToken;

  if (!token) {
    return res.status(401).json({ success: false, message: "Session expired. Please log in again." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id);

    if (!user || user.refreshToken !== token) {
      return res.status(401).json({ success: false, message: "Invalid or expired refresh token" });
    }

    // Issue new access + refresh tokens (sliding window — extends session on activity)
    const newAccessToken = generateToken(user._id);
    const newRefreshToken = generateRefreshToken(user._id);

    // Persist rotated refresh token
    user.refreshToken = newRefreshToken;
    await user.save();

    secLog("[TOKEN_REFRESH]", { userId: user._id });

    // Update both cookies
    res.cookie("accessToken", newAccessToken, getCookieOptions(process.env.JWT_EXPIRE, req));
    res.cookie("refreshToken", newRefreshToken, getCookieOptions(process.env.JWT_REFRESH_EXPIRE, req));

    res.status(200).json({
      success: true,
      token: newAccessToken,
    });
  } catch (error) {
    console.error("[AUTH][TOKEN_REFRESH][FAIL]", error.message);
    res.status(401).json({ success: false, message: "Session expired, please log in again" });
  }
};

// ─── Get Profile ──────────────────────────────────────────────────────────────
export const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email || null,
        mobile: user.mobile || null,
        role: user.role,
        avatar: user.avatar,
        authProvider: user.authProvider,
        isVerified: user.isVerified,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─── Update Profile ────────────────────────────────────────────────────────────
export const updateProfile = async (req, res, next) => {
  const { name, email, avatar, address, gender, dob } = req.body;

  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (name && name.trim()) user.name = name.trim();
    if (avatar !== undefined) user.avatar = avatar;
    if (email && email.trim()) user.email = email.trim().toLowerCase();
    if (address !== undefined) user.address = address;
    if (gender !== undefined) user.gender = gender;
    if (dob !== undefined) user.dob = dob;

    await user.save();

    secLog("[PROFILE_UPDATE]", { userId: user._id });

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email || null,
        mobile: user.mobile || null,
        role: user.role,
        avatar: user.avatar,
        authProvider: user.authProvider,
      },
    });
  } catch (error) {
    next(error);
  }
};
