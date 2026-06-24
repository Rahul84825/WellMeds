import dotenv from "dotenv";
import { User } from "../src/models/User.js";
import { connectDB } from "../src/config/db.js";

dotenv.config();

const seedAdmin = async () => {
  try {
    // Connect to database (connectDB handles in-memory fallback if Atlas is blocked)
    await connectDB();

    const adminEmail = "admin@gmail.com";
    const existingAdmin = await User.findOne({ email: adminEmail });

    if (existingAdmin) {
      console.log(`[Seed] Admin user with email ${adminEmail} already exists. Updating record...`);
      existingAdmin.name = "WellMeds Admin";
      existingAdmin.role = "admin";
      existingAdmin.isVerified = true;
      existingAdmin.authProvider = "local";
      existingAdmin.password = "admin123"; // password hook will hash this on save
      
      await existingAdmin.save();
      console.log(`[Seed] Existing admin account ${adminEmail} updated and verified.`);
      process.exit(0);
    }

    // Create a new admin user
    await User.create({
      name: "WellMeds Admin",
      email: adminEmail,
      password: "admin123", // password hook will hash this on save
      role: "admin",
      authProvider: "local",
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
