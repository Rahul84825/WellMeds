import { OAuth2Client } from "google-auth-library";
import { User } from "../models/User.js";
import { generateToken } from "../utils/generateToken.js";
import { generateRefreshToken } from "../utils/generateRefreshToken.js";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const getCookieOptions = (expireString, req) => {
  const isSecure =
    process.env.NODE_ENV === "production" ||
    (req && (req.secure || req.headers["x-forwarded-proto"] === "https"));

  let maxAge = 30 * 24 * 60 * 60 * 1000; // Default 30 days
  if (expireString && expireString.endsWith("d")) {
    const days = parseInt(expireString.slice(0, -1));
    if (!isNaN(days)) maxAge = days * 24 * 60 * 60 * 1000;
  }
  return {
    httpOnly: true,
    secure: isSecure,
    sameSite: isSecure ? "none" : "lax",
    maxAge,
    path: "/",
  };
};

/**
 * POST /api/auth/google
 * Validates Google ID Token server-side -> Finds or Creates User -> Issues JWT.
 */
export const googleAuth = async (req, res, next) => {
  try {
    const { idToken, credential } = req.body;
    const tokenToVerify = idToken || credential;

    if (!tokenToVerify) {
      return res.status(400).json({
        success: false,
        message: "Google ID Token is required",
      });
    }

    let payload;
    try {
      const ticket = await client.verifyIdToken({
        idToken: tokenToVerify,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      payload = ticket.getPayload();
    } catch (verifyError) {
      console.error("[AUTH][GOOGLE][VERIFY_FAILED]", verifyError.message);
      return res.status(401).json({
        success: false,
        message: "Invalid or expired Google authentication token.",
      });
    }

    if (!payload || !payload.email) {
      return res.status(400).json({
        success: false,
        message: "Google account does not provide a valid email.",
      });
    }

    const googleId = payload.sub;
    const email = payload.email.toLowerCase().trim();
    const name = payload.name || `User ${googleId.slice(-4)}`;
    const picture = payload.picture || "";

    // 1. Check if user exists by googleId
    let user = await User.findOne({ googleId });

    if (!user) {
      // 2. Account linking: Check if user exists by email
      user = await User.findOne({ email });

      if (user) {
        user.googleId = googleId;
        if (!user.avatar && picture) user.avatar = picture;
        if (!user.name || user.name.startsWith("User ")) user.name = name;
        user.isVerified = true;
        if (user.authProvider === "phone") user.authProvider = "google";
        user.lastLogin = new Date();
        await user.save();
      } else {
        // Create new user record
        user = await User.create({
          name,
          email,
          googleId,
          authProvider: "google",
          avatar: picture,
          isVerified: true,
          role: "customer",
          lastLogin: new Date(),
        });
      }
    } else {
      user.lastLogin = new Date();
      if (!user.avatar && picture) user.avatar = picture;
      await user.save();
    }

    const requiresMobile = !user.mobile || !user.mobile.trim();

    // Issue JWT access + refresh tokens
    const accessToken = generateToken(user._id, user.role);
    const refreshToken = generateRefreshToken(user._id, user.role);
    await User.updateOne({ _id: user._id }, { $set: { refreshToken } });

    const accessExpire = user.role === "admin" ? "30d" : "7d";
    const refreshExpire = user.role === "admin" ? "90d" : "30d";
    res.cookie("accessToken", accessToken, getCookieOptions(accessExpire, req));
    res.cookie("refreshToken", refreshToken, getCookieOptions(refreshExpire, req));

    return res.status(200).json({
      success: true,
      message: "Google authentication successful",
      requiresMobile,
      token: accessToken,
      refreshToken: refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile || null,
        role: user.role,
        avatar: user.avatar || "",
        authProvider: user.authProvider,
        isProfileCompleted: user.isProfileCompleted || !requiresMobile,
      },
    });
  } catch (error) {
    next(error);
  }
};
