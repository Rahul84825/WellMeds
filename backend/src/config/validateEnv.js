import { URL } from "url";

export const validateEnv = () => {
  const criticalRequired = [
    "MONGODB_URI",
    "JWT_SECRET",
  ];

  const optionalRequired = [
    "RAZORPAY_KEY_ID",
    "RAZORPAY_KEY_SECRET",
    "RAZORPAY_WEBHOOK_SECRET",
    "CLOUDINARY_CLOUD_NAME",
    "CLOUDINARY_API_KEY",
    "CLOUDINARY_API_SECRET",
    "SMTP_HOST",
    "SMTP_PORT",
    "SMTP_USER",
  ];

  // Validate critical variables
  const missingCritical = criticalRequired.filter((key) => !process.env[key]);
  if (missingCritical.length > 0) {
    console.error(`FATAL CONFIGURATION ERROR: Missing CRITICAL environment variables: ${missingCritical.join(", ")}`);
    process.exit(1);
  }

  // Warn about optional variables
  const missingOptional = optionalRequired.filter((key) => !process.env[key]);
  if (missingOptional.length > 0) {
    console.warn(`[WARNING] Missing optional environment variables (some features may not work): ${missingOptional.join(", ")}`);
  }

  // Check SMTP password / pass if SMTP_USER is set
  if (process.env.SMTP_USER) {
    const smtpPass = process.env.SMTP_PASS || process.env.SMTP_PASSWORD;
    if (!smtpPass) {
      console.warn("[WARNING] Missing environment variable SMTP_PASS or SMTP_PASSWORD. Emails will be logged to console.");
    }
    const emailFrom = process.env.SMTP_FROM || process.env.EMAIL_FROM;
    if (!emailFrom) {
      console.warn("[WARNING] Missing environment variable SMTP_FROM or EMAIL_FROM. Defaulting to noreply@wellmeds.com.");
    }
  }

  // Check JWT expires (warn and default to 7d if missing)
  const jwtExpires = process.env.JWT_EXPIRES_IN || process.env.JWT_EXPIRE;
  if (!jwtExpires) {
    console.warn("[WARNING] Missing environment variable JWT_EXPIRES_IN or JWT_EXPIRE. Defaulting to 7d.");
  }

  // 1. PORT is numeric
  if (process.env.PORT && isNaN(Number(process.env.PORT))) {
    console.error("FATAL CONFIGURATION ERROR: PORT environment variable must be numeric.");
    process.exit(1);
  }

  // 2. CLIENT_URL is valid
  try {
    const url = process.env.CLIENT_URL || process.env.FRONTEND_URL || "http://localhost:5173";
    new URL(url);
  } catch (err) {
    console.error("FATAL CONFIGURATION ERROR: CLIENT_URL environment variable must be a valid URL.");
    process.exit(1);
  }

  // 3. JWT_SECRET minimum length (at least 16 characters)
  if (process.env.JWT_SECRET.length < 16) {
    console.error("FATAL CONFIGURATION ERROR: JWT_SECRET must be at least 16 characters long for production-grade security.");
    process.exit(1);
  }

  // 4. SMTP_PORT is numeric if provided
  if (process.env.SMTP_PORT && isNaN(Number(process.env.SMTP_PORT))) {
    console.error("FATAL CONFIGURATION ERROR: SMTP_PORT must be numeric if provided.");
    process.exit(1);
  }

  console.log("✔ Environment variables validated successfully.");
};
export default validateEnv;
