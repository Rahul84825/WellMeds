import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      unique: true,
      sparse: true, // Sparse: allows multiple documents without email (phone-auth users)
      trim: true,
      lowercase: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, "Please fill a valid email address"],
    },
    // Mobile number for OTP authentication
    mobile: {
      type: String,
      unique: true,
      sparse: true, // Sparse: won't break existing users that don't have mobile
      trim: true,
      index: true,
      match: [/^[6-9]\d{9}$/, "Please enter a valid 10-digit Indian mobile number"],
    },
    // Password kept for backward compatibility with existing data — not used in new flow
    password: {
      type: String,
      select: false,
    },
    // Google OAuth fields — kept for backward compatibility with existing data
    googleId: {
      type: String,
      unique: true,
      sparse: true,
    },
    role: {
      type: String,
      enum: ["customer", "admin"],
      default: "customer",
    },
    avatar: {
      type: String,
      default: "",
    },
    // Extended authProvider enum to include phone OTP
    authProvider: {
      type: String,
      enum: ["google", "email", "local", "phone"],
      default: "phone",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    refreshToken: {
      type: String,
      default: "",
    },
    lastLogin: {
      type: Date,
    },
    // Legacy fields kept for backward compatibility — not populated in new OTP flow
    verificationToken: String,
    verificationTokenExpires: Date,
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    // Brute force protection — repurposed for OTP rate limiting tracking
    loginAttempts: {
      type: Number,
      required: true,
      default: 0,
    },
    lockUntil: Date,
  },
  {
    timestamps: true,
  }
);

export const User = mongoose.model("User", userSchema);
