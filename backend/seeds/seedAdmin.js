import dotenv from "dotenv";
import { User } from "../src/models/User.js";
import { connectDB } from "../src/config/db.js";

dotenv.config();

/**
 * Admin Seed Script
 *
 * Creates or updates the admin user.
 * Admin authenticates via Mobile OTP (same as all users).
 *
 * Usage:
 *   npm run seed-admin
 *
 * After running:
 *   1. Go to /login on the frontend
 *   2. Enter the mobile number set in ADMIN_MOBILE below
 *   3. Enter your OTP (shown in server console in dev mode)
 *   4. You'll be logged in as admin
 *
 * To change the admin mobile, update ADMIN_MOBILE below and re-run.
 */
const ADMIN_MOBILE = process.env.ADMIN_MOBILE || "9999999999"; // ← Change this to the real admin mobile number
const ADMIN_NAME = "WellMeds Admin";
const ADMIN_EMAIL = "activegamer789@gmail.com"; // Optional — can still store email for records

const seedAdmin = async () => {
  try {
    await connectDB();

    // Check if admin already exists by mobile
    let admin = await User.findOne({ mobile: ADMIN_MOBILE });

    if (admin) {
      console.log(`[Seed] Admin with mobile ${ADMIN_MOBILE} already exists. Updating...`);
      admin.name = ADMIN_NAME;
      admin.role = "admin";
      admin.isVerified = true;
      admin.authProvider = "phone";
      if (ADMIN_EMAIL) admin.email = ADMIN_EMAIL;
      await admin.save();
      console.log(`[Seed] Admin account updated: mobile=${ADMIN_MOBILE}, role=admin`);
      process.exit(0);
    }

    // Also check if there's an existing admin by email (legacy)
    let existingByEmail = await User.findOne({ email: ADMIN_EMAIL });
    if (existingByEmail) {
      console.log(`[Seed] Found legacy admin by email. Upgrading to phone auth...`);
      existingByEmail.mobile = ADMIN_MOBILE;
      existingByEmail.role = "admin";
      existingByEmail.isVerified = true;
      existingByEmail.authProvider = "phone";
      existingByEmail.name = ADMIN_NAME;
      await existingByEmail.save();
      console.log(`[Seed] Legacy admin upgraded: mobile=${ADMIN_MOBILE}`);
      process.exit(0);
    }

    // Create new admin user
    await User.create({
      name: ADMIN_NAME,
      email: ADMIN_EMAIL,
      mobile: ADMIN_MOBILE,
      role: "admin",
      authProvider: "phone",
      isVerified: true,
    });

    console.log(`[Seed] Admin created: mobile=${ADMIN_MOBILE}, email=${ADMIN_EMAIL}`);
    console.log(`[Seed] Login at /login → enter ${ADMIN_MOBILE} → use OTP from server console.`);
    process.exit(0);
  } catch (error) {
    console.error(`[Seed] Error seeding admin:`, error.message);
    process.exit(1);
  }
};

seedAdmin();
