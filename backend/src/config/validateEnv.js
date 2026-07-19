import { URL } from "url";

export const validateEnv = () => {
  const required = [
    "MONGODB_URI",
    "JWT_SECRET",
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

  const missing = required.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    console.error(`FATAL CONFIGURATION ERROR: Missing required environment variables: ${missing.join(", ")}`);
    process.exit(1);
  }

  // Check SMTP password / pass (support either SMTP_PASSWORD or SMTP_PASS)
  const smtpPass = process.env.SMTP_PASS || process.env.SMTP_PASSWORD;
  if (!smtpPass) {
    console.error("FATAL CONFIGURATION ERROR: Missing environment variable SMTP_PASS or SMTP_PASSWORD");
    process.exit(1);
  }

  // Check email from (support either SMTP_FROM or EMAIL_FROM)
  const emailFrom = process.env.SMTP_FROM || process.env.EMAIL_FROM;
  if (!emailFrom) {
    console.error("FATAL CONFIGURATION ERROR: Missing environment variable SMTP_FROM or EMAIL_FROM");
    process.exit(1);
  }

  // Check JWT expires (support either JWT_EXPIRES_IN or JWT_EXPIRE)
  const jwtExpires = process.env.JWT_EXPIRES_IN || process.env.JWT_EXPIRE;
  if (!jwtExpires) {
    console.error("FATAL CONFIGURATION ERROR: Missing environment variable JWT_EXPIRES_IN or JWT_EXPIRE");
    process.exit(1);
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

  // 4. SMTP_PORT is numeric
  if (isNaN(Number(process.env.SMTP_PORT))) {
    console.error("FATAL CONFIGURATION ERROR: SMTP_PORT must be numeric.");
    process.exit(1);
  }

  console.log("✔ Environment variables validated successfully.");
};
export default validateEnv;
