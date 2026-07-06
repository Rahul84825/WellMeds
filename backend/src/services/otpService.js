import otpConfig from "../config/otp.js";
import crypto from "crypto";

/**
 * Provider-Agnostic OTP Service
 * ─────────────────────────────
 * This service is the ONLY place that knows about SMS providers.
 * Controllers call sendSms(mobile, otp) — they never import provider SDKs.
 *
 * To swap provider: change OTP_PROVIDER in .env. Zero code changes required.
 *
 * Supported providers:
 *   "console" — print OTP to server terminal (development / testing)
 *   "msg91"   — MSG91 SMS gateway (India)
 *   "twilio"  — Twilio Verify / Twilio Messages API
 *
 * To add a new provider:
 *   1. Add a function sendVia<Name>(mobile, otp) below
 *   2. Add a case in the switch inside sendSms()
 *   3. Add env vars to otpConfig and .env
 */

// ─── Console Provider (Development / Fallback) ───────────────────────────────
const sendViaConsole = async (mobile, otp) => {
  console.log("\n┌─────────────────────────────────────────────────────┐");
  console.log(`│  📱 OTP for ${mobile}: ${otp}                                 `);
  console.log(`│  ⏰ Expires in ${otpConfig.expiryMinutes} minutes                          `);
  console.log("│  ⚠️  Console provider — dev mode only. Never use in production. │");
  console.log("└─────────────────────────────────────────────────────┘\n");
  return { success: true, provider: "console" };
};

// ─── MSG91 Provider ──────────────────────────────────────────────────────────
const sendViaMSG91 = async (mobile, otp) => {
  const { authKey, templateId, baseUrl } = otpConfig.msg91;

  if (!authKey || !templateId) {
    throw new Error(
      "MSG91 credentials not configured. Set OTP_AUTH_KEY and OTP_TEMPLATE_ID in .env"
    );
  }

  // Normalize: strip leading + or 0, ensure 10-digit Indian format for MSG91
  const normalizedMobile = mobile.replace(/^\+91/, "").replace(/^0/, "");

  const payload = {
    template_id: templateId,
    mobile: `91${normalizedMobile}`,
    authkey: authKey,
    otp,
  };

  const response = await fetch(`${baseUrl}/otp`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      authkey: authKey,
    },
    body: JSON.stringify(payload),
  });

  const result = await response.json();

  if (!response.ok || result.type === "error") {
    throw new Error(`MSG91 error: ${result.message || JSON.stringify(result)}`);
  }

  return { success: true, provider: "msg91", result };
};

// ─── Twilio Provider ─────────────────────────────────────────────────────────
const sendViaTwilio = async (mobile, otp) => {
  const { accountSid, authToken, verifyServiceSid } = otpConfig.twilio;

  if (!accountSid || !authToken || !verifyServiceSid) {
    throw new Error(
      "Twilio credentials not configured. Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_VERIFY_SERVICE_SID in .env"
    );
  }

  // Normalize to E.164 format (+91 default for India)
  const normalizedMobile = mobile.startsWith("+") ? mobile : `+91${mobile}`;

  const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
  const bodyParams = new URLSearchParams({
    To: normalizedMobile,
    From: process.env.TWILIO_PHONE_NUMBER || "",
    Body: `Your WellMeds OTP is: ${otp}. Valid for ${otpConfig.expiryMinutes} minutes. Do not share with anyone.`,
  });

  const credentials = Buffer.from(`${accountSid}:${authToken}`).toString("base64");

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: bodyParams,
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(`Twilio error: ${result.message || JSON.stringify(result)}`);
  }

  return { success: true, provider: "twilio", result };
};

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Send an OTP SMS via the configured provider.
 * The OTP must be generated and hashed by the caller before storing.
 *
 * @param {string} mobile - Recipient phone number (10-digit or E.164)
 * @param {string} otp    - Plaintext OTP to embed in the SMS message
 * @returns {Promise<{ success: boolean, provider: string }>}
 */
export const sendSms = async (mobile, otp) => {
  const provider = otpConfig.provider;

  switch (provider) {
    case "msg91":
      return await sendViaMSG91(mobile, otp);

    case "twilio":
      return await sendViaTwilio(mobile, otp);

    case "console":
    default:
      if (process.env.NODE_ENV === "production" && provider !== "msg91" && provider !== "twilio") {
        // Safety guard: never silently skip SMS in production
        throw new Error(
          "OTP_PROVIDER is not set to a real provider (msg91 or twilio). Cannot send OTP in production. " +
            "Set OTP_PROVIDER=msg91 or OTP_PROVIDER=twilio and configure credentials in .env"
        );
      }
      return await sendViaConsole(mobile, otp);
  }
};

/**
 * Generate a cryptographically random N-digit OTP string.
 * Uses crypto.randomInt to avoid modulo bias.
 *
 * @param {number} [length=6]
 * @returns {string}  e.g. "847261"
 */
export const generateOtpCode = (length = otpConfig.length) => {
  let otp = "";
  for (let i = 0; i < length; i++) {
    otp += crypto.randomInt(0, 10).toString();
  }
  return otp;
};

/**
 * Hash an OTP for secure storage.
 * Uses SHA-256. We don't need bcrypt here because OTPs are short-lived (5 min)
 * and salting is handled by appending the mobile number as a context string.
 *
 * @param {string} otp
 * @param {string} mobile - Used as context salt
 * @returns {string} hex digest
 */
export const hashOtp = (otp, mobile) => {
  return crypto
    .createHash("sha256")
    .update(`${otp}:${mobile}:${process.env.JWT_SECRET || "wellmeds_otp_salt"}`)
    .digest("hex");
};
