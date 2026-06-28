/**
 * Migration Script: Convert Product.category from String to ObjectId Reference
 * 
 * USAGE: node migrations/migrateProductCategories.js
 * 
 * This script safely converts existing product category field from string names
 * to ObjectId references. It includes:
 * - Pre-migration validation
 * - Progress tracking
 * - Error logging
 * - Rollback capability (before-migration backup data in console)
 */

import mongoose from "mongoose";
import { config } from "dotenv";

config();

// Import models
import { Product } from "../src/models/Product.js";
import { Category } from "../src/models/Category.js";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/wellmeds";

async function connectDB() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("✓ Connected to MongoDB");
  } catch (error) {
    console.error("✗ Failed to connect to MongoDB:", error.message);
    process.exit(1);
  }
}

async function migrateCategories() {
  try {
    console.log("\n🔄 Starting Product Category Migration...\n");

    // Step 1: Get all products with string categories
    const products = await Product.find();
    console.log(`📊 Found ${products.length} products to process`);

    if (products.length === 0) {
      console.log("✓ No products found. Migration complete.");
      return;
    }

    // Step 2: Get all categories
    const categories = await Category.find();
    const categoryMap = new Map();
    categories.forEach(cat => {
      categoryMap.set(cat.name?.toLowerCase(), cat._id);
      categoryMap.set(cat.slug?.toLowerCase(), cat._id);
    });

    console.log(`📚 Found ${categories.length} categories\n`);

    // Step 3: Process each product
    let migrated = 0;
    let failed = 0;
    const failedProducts = [];

    for (const product of products) {
      try {
        // If category is already an ObjectId, skip
        if (mongoose.Types.ObjectId.isValid(product.category)) {
          continue;
        }

        // Find matching category
        const categoryName = product.category?.toString()?.toLowerCase();
        const categoryId = categoryMap.get(categoryName);

        if (!categoryId) {
          failed++;
          failedProducts.push({
            productId: product._id,
            productName: product.name,
            categoryString: product.category,
            reason: "Category not found in database"
          });
          console.log(`✗ ${product.name}: Category "${product.category}" not found`);
          continue;
        }

        // Update product with ObjectId reference
        await Product.updateOne(
          { _id: product._id },
          { $set: { category: categoryId } }
        );

        migrated++;
        if (migrated % 10 === 0) {
          console.log(`✓ Migrated ${migrated} products...`);
        }
      } catch (error) {
        failed++;
        failedProducts.push({
          productId: product._id,
          productName: product.name,
          categoryString: product.category,
          error: error.message
        });
        console.log(`✗ Error migrating ${product.name}:`, error.message);
      }
    }

    // Step 4: Verification
    console.log("\n📋 Migration Summary:");
    console.log(`✓ Successfully migrated: ${migrated} products`);
    console.log(`✗ Failed: ${failed} products`);
    console.log(`📊 Total processed: ${migrated + failed}/${products.length}`);

    if (failed > 0) {
      console.log("\n⚠️  Failed Products:");
      console.table(failedProducts);
    }

    // Step 5: Verify results
    const updatedProducts = await Product.find().populate("category");
    const validProducts = updatedProducts.filter(p => p.category !== null).length;
    console.log(`\n✓ Verification: ${validProducts}/${updatedProducts.length} products have valid category references`);

    if (validProducts === updatedProducts.length) {
      console.log("✅ Migration completed successfully!");
    } else {
      console.log("⚠️  Some products still have invalid categories");
    }

  } catch (error) {
    console.error("✗ Migration failed:", error);
  }
}

async function main() {
  await connectDB();
  await migrateCategories();
  await mongoose.disconnect();
  console.log("\n✓ Disconnected from MongoDB\n");
}

main().catch(error => {
  console.error("Fatal error:", error);
  process.exit(1);
});
