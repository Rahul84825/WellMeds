import { User } from "../models/User.js";
import { generateToken } from "../utils/generateToken.js";
import { generateRefreshToken } from "../utils/generateRefreshToken.js";
import jwt from "jsonwebtoken";

// Cookie options helper
const getCookieOptions = (expireString) => {
  const isProduction = process.env.NODE_ENV === "production";

  let maxAge = 7 * 24 * 60 * 60 * 1000; // Default 7 days
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

export const logout = async (req, res, next) => {
  try {
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");

    if (req.user) {
      req.user.refreshToken = "";
      await req.user.save();
    }

    res.status(200).json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    next(error);
  }
};

export const refresh = async (req, res, next) => {
  let token = req.cookies.refreshToken || req.body.refreshToken;

  if (!token) {
    return res.status(401).json({ success: false, message: "Session expired. Please log in again." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id);

    if (!user || user.refreshToken !== token) {
      return res.status(401).json({ success: false, message: "Invalid or expired refresh token" });
    }

    const newAccessToken = generateToken(user._id);
    res.cookie("accessToken", newAccessToken, getCookieOptions(process.env.JWT_EXPIRE));

    res.status(200).json({
      success: true,
      token: newAccessToken,
    });
  } catch (error) {
    console.error("Refresh token validation failed:", error.message);
    res.status(401).json({ success: false, message: "Session expired, please log in again" });
  }
};

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
