import dotenv from "dotenv";
import { User } from "../src/models/User.js";
import { connectDB } from "../src/config/db.js";

dotenv.config();

/**
 * Admin Seed Script
 *
 * Creates or updates the admin user.
 *
 * Usage:
 *   npm run seed-admin
 */
const ADMIN_MOBILE = process.env.ADMIN_MOBILE || "9999999999";
const ADMIN_NAME = "WellMeds Admin";
const ADMIN_EMAIL = "activegamer789@gmail.com";

const seedAdmin = async () => {
  try {
    await connectDB();

    // Check if admin already exists by email or mobile
    let admin = await User.findOne({ email: ADMIN_EMAIL }) || await User.findOne({ mobile: ADMIN_MOBILE });

    if (admin) {
      console.log(`[Seed] Admin already exists (${admin.email || admin.mobile}). Updating...`);
      admin.name = ADMIN_NAME;
      admin.role = "admin";
      admin.isVerified = true;
      if (!admin.authProvider || admin.authProvider === "phone") {
        admin.authProvider = "google";
      }
      if (ADMIN_EMAIL) admin.email = ADMIN_EMAIL;
      if (ADMIN_MOBILE) admin.mobile = ADMIN_MOBILE;
      await admin.save();
      console.log(`[Seed] Admin account updated: email=${admin.email}, role=admin`);
      process.exit(0);
    }

    // Create new admin user
    await User.create({
      name: ADMIN_NAME,
      email: ADMIN_EMAIL,
      mobile: ADMIN_MOBILE,
      role: "admin",
      authProvider: "google",
      isVerified: true,
    });

    console.log(`[Seed] Admin created: mobile=${ADMIN_MOBILE}, email=${ADMIN_EMAIL}`);
    process.exit(0);
  } catch (error) {
    console.error(`[Seed] Error seeding admin:`, error.message);
    process.exit(1);
  }
};

seedAdmin();
