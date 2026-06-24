import dotenv from "dotenv";
import { User } from "../src/models/User.js";
import { connectDB } from "../src/config/db.js";

dotenv.config();

const seedAdmin = async () => {
  try {
    // Connect to database (connectDB handles in-memory fallback if primary is blocked)
    await connectDB();

    const adminEmail = "admin@wellmeds.com";
    const existingAdmin = await User.findOne({ email: adminEmail });

    if (existingAdmin) {
      console.log(`[Seed] Admin user with email ${adminEmail} already exists.`);
      // Update their role to admin and verify them just in case
      existingAdmin.role = "admin";
      existingAdmin.isVerified = true;
      existingAdmin.authProvider = "google";
      await existingAdmin.save();
      console.log(`[Seed] Existing user ${adminEmail} verified and role updated to admin.`);
      process.exit(0);
    }

    await User.create({
      name: "WellMeds Admin",
      email: adminEmail,
      role: "admin",
      authProvider: "google",
      isVerified: true,
    });

    console.log(`[Seed] Admin user seeded successfully: ${adminEmail}`);
    process.exit(0);
  } catch (error) {
    console.error(`[Seed] Error seeding admin:`, error.message);
    process.exit(1);
  }
};

seedAdmin();
