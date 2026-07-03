import mongoose from "mongoose";
import dotenv from "dotenv";
import dns from "dns";
import { User } from "./src/models/User.js";
import { Product } from "./src/models/Product.js";
import { Category } from "./src/models/Category.js";
import { Order } from "./src/models/Order.js";
import { Coupon } from "./src/models/Coupon.js";
import slugify from "slugify";
import { INITIAL_CATEGORIES, INITIAL_PRODUCTS, INITIAL_COUPONS } from "./src/config/initialData.js";

// Resolve DNS SRV issues on IPv6-preferred networks
dns.setDefaultResultOrder("ipv4first");
try {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
} catch (e) {
  console.warn("Could not set custom DNS servers:", e.message);
}

dotenv.config();

const seedDB = async () => {
  try {
    console.log("Connecting to database for seeding...");
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Database connected. Cleaning collections...");

    await User.deleteMany();
    await Product.deleteMany();
    await Category.deleteMany();
    await Order.deleteMany();
    await Coupon.deleteMany();

    console.log("Creating default Admin user...");
    const adminEmail = "admin@gmail.com";
    const adminPassword = "admin123";

    await User.create({
      name: "WellMeds Admin",
      email: adminEmail,
      password: adminPassword,
      role: "admin",
      authProvider: "local",
      isVerified: true,
    });
    console.log(`Admin account created: ${adminEmail} / ${adminPassword}`);

    console.log("Seeding categories...");
    const categoryMap = {};
    for (const cat of INITIAL_CATEGORIES) {
      const createdCat = await Category.create({
        ...cat,
        slug: slugify(cat.name, { lower: true })
      });
      categoryMap[cat.name] = createdCat._id;
    }
    console.log("Categories seeded.");

    console.log("Seeding products...");
    for (const prod of INITIAL_PRODUCTS) {
      const categoryId = categoryMap[prod.category];
      await Product.create({
        ...prod,
        category: categoryId,
        slug: slugify(prod.name, { lower: true })
      });
    }
    console.log("Products seeded.");

    console.log("Seeding coupons...");
    for (const coupon of INITIAL_COUPONS) {
      await Coupon.create(coupon);
    }
    console.log("Coupons seeded.");

    console.log("Database seeding completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Database seeding failed:", error.message);
    process.exit(1);
  }
};

seedDB();
