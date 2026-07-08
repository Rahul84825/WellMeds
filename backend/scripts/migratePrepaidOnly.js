import { connectDB, disconnectDB } from "./helpers/db.js";
import { Product } from "../src/models/Product.js";

const migrate = async () => {
  try {
    await connectDB();
    console.log("Migrating products...");

    const rawCollection = Product.collection;

    // 1. Migrate prepaidOnly to isNonRefundable
    const resPrepaidOnly = await rawCollection.updateMany(
      { prepaidOnly: { $exists: true } },
      [
        { $set: { isNonRefundable: "$prepaidOnly" } },
        { $unset: ["prepaidOnly"] }
      ]
    );
    console.log(`Migrated prepaidOnly: matched ${resPrepaidOnly.matchedCount}, modified ${resPrepaidOnly.modifiedCount}`);

    // 2. Migrate isPrepaidOnly to isNonRefundable
    const resIsPrepaidOnly = await rawCollection.updateMany(
      { isPrepaidOnly: { $exists: true } },
      [
        { $set: { isNonRefundable: "$isPrepaidOnly" } },
        { $unset: ["isPrepaidOnly"] }
      ]
    );
    console.log(`Migrated isPrepaidOnly: matched ${resIsPrepaidOnly.matchedCount}, modified ${resIsPrepaidOnly.modifiedCount}`);

    console.log("Migration completed successfully.");
  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    await disconnectDB();
  }
};

migrate();
