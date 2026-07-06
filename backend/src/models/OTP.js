import mongoose from "mongoose";

/**
 * OTP Model
 * Stores hashed OTPs per mobile number with automatic TTL expiry.
 * OTPs are NEVER stored in plain text — always hashed before storage.
 */
const otpSchema = new mongoose.Schema(
  {
    mobile: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    hashedOtp: {
      type: String,
      required: true,
      select: false, // Never expose hashed OTP in queries by default
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 }, // TTL index: MongoDB auto-deletes document at expiresAt
    },
    attempts: {
      type: Number,
      default: 0,
    },
    // Track how many OTPs were sent to this mobile in the current hour
    sendCount: {
      type: Number,
      default: 1,
    },
    windowStart: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

export const OTP = mongoose.model("OTP", otpSchema);
