/**
 * OTP Configuration
 * Single source of truth for all OTP-related settings.
 * Change OTP_PROVIDER in .env to switch between providers — no code changes needed.
 *
 * Supported providers:
 *   console  — Logs OTP to server terminal (development only)
 *   msg91    — MSG91 SMS API (recommended for India)
 *   twilio   — Twilio Verify API
 */
const otpConfig = {
  // ─── Provider Selection ────────────────────────────────────────────────────
  provider: process.env.OTP_PROVIDER || "console",

  // ─── OTP Settings ─────────────────────────────────────────────────────────
  length: parseInt(process.env.OTP_LENGTH, 10) || 6,
  expiryMinutes: parseInt(process.env.OTP_EXPIRY_MINUTES, 10) || 5,
  maxAttempts: parseInt(process.env.OTP_MAX_ATTEMPTS, 10) || 3,
  resendLimitPerHour: parseInt(process.env.OTP_RESEND_LIMIT, 10) || 5,

  // ─── Provider Credentials ─────────────────────────────────────────────────
  // MSG91
  msg91: {
    authKey: process.env.OTP_AUTH_KEY || "",
    templateId: process.env.OTP_TEMPLATE_ID || "",
    senderId: process.env.OTP_SENDER_ID || "",
    baseUrl: process.env.OTP_BASE_URL || "https://api.msg91.com/api/v5",
  },

  // Twilio Verify
  twilio: {
    accountSid: process.env.TWILIO_ACCOUNT_SID || "",
    authToken: process.env.TWILIO_AUTH_TOKEN || "",
    verifyServiceSid: process.env.TWILIO_VERIFY_SERVICE_SID || "",
  },

  // Generic / Custom provider
  generic: {
    apiKey: process.env.OTP_API_KEY || "",
    baseUrl: process.env.OTP_BASE_URL || "",
    senderId: process.env.OTP_SENDER_ID || "",
    templateId: process.env.OTP_TEMPLATE_ID || "",
  },
};

export default otpConfig;
