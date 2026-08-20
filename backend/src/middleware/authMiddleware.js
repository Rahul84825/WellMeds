import jwt from "jsonwebtoken";
import { User } from "../models/User.js";

export const protect = async (req, res, next) => {
  let token;

  // Read token from Authorization header or cookies
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies && req.cookies.accessToken) {
    token = req.cookies.accessToken;
  }

  if (!token) {
    return res.status(401).json({ success: false, message: "Not authorized, token is missing" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select("-password");
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Not authorized, user not found" });
    }
    next();
  } catch (error) {
    console.error("Token verification failed:", error.message);
    return res.status(401).json({ success: false, message: "Not authorized, token verification failed" });
  }
};

export const optionalProtect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies && req.cookies.accessToken) {
    token = req.cookies.accessToken;
  }

  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select("-password");
    next();
  } catch (error) {
    next();
  }
};

/**
 * requireProfileComplete
 * Verifies that an authenticated customer has a valid mobile number and completed profile.
 * Admins bypass this requirement.
 */
export const requireProfileComplete = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Not authorized, please log in.",
    });
  }

  // Admins bypass customer profile completion
  if (req.user.role === "admin") {
    return next();
  }

  const cleanMobile = req.user.mobile ? String(req.user.mobile).trim() : "";
  const isValidMobile = /^[6-9]\d{9}$/.test(cleanMobile);
  const isComplete = Boolean(isValidMobile && req.user.isProfileCompleted);

  if (!isComplete) {
    return res.status(403).json({
      success: false,
      code: "PROFILE_INCOMPLETE",
      message: "Please complete your profile before continuing.",
    });
  }

  next();
};
