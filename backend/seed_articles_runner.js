import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

import { Article } from "./src/models/Article.js";
import { INITIAL_ARTICLES } from "./src/controllers/articleController.js";

async function main() {
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
  console.log("Connecting to MongoDB Atlas...");
  await mongoose.connect(uri);

  // We only seed or upsert articles. We DO NOT delete anything else.
  let inserted = 0;
  let updated = 0;

  for (const art of INITIAL_ARTICLES) {
    const existing = await Article.findOne({ slug: art.slug });
    if (!existing) {
      await Article.create(art);
      inserted++;
      console.log(`+ Created article: "${art.title}"`);
    } else {
      await Article.updateOne({ _id: existing._id }, { $set: art });
      updated++;
      console.log(`~ Updated article: "${art.title}"`);
    }
  }

  const total = await Article.countDocuments();
  console.log(`\nSeeding completed! Inserted: ${inserted}, Updated: ${updated}, Total Articles in DB: ${total}`);
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error("Seed error:", err);
  process.exit(1);
});
