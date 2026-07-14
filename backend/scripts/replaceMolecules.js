import fs from "fs";
import path from "path";
import { connectDB, disconnectDB } from "./helpers/db.js";
import { slugify } from "./helpers/slugify.js";
import { logger } from "./helpers/logger.js";
import { Molecule } from "../src/models/Molecule.js";
import { Product } from "../src/models/Product.js";

const toTitleCase = (str) => {
  if (!str) return "";
  return str
    .toString()
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .map(word => {
      return word
        .split("-")
        .map(subWord => subWord.charAt(0).toUpperCase() + subWord.slice(1))
        .join("-");
    })
    .join(" ");
};

const parseCSV = (filePath) => {
  logger.info(`Reading CSV file: ${filePath}`);
  if (!fs.existsSync(filePath)) {
    throw new Error(`CSV file not found at ${filePath}`);
  }
  const content = fs.readFileSync(filePath, "utf-8");
  const lines = content.split(/\r?\n/);
  const rawData = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    let parts = [];
    const firstComma = line.indexOf(",");
    if (firstComma !== -1) {
      const cat = line.slice(0, firstComma).trim();
      const comp = line.slice(firstComma + 1).replace(/^"/, "").replace(/"$/, "").trim();
      parts = [cat, comp];
    }

    if (parts.length === 2 && parts[1]) {
      rawData.push({
        category: parts[0],
        composition: parts[1]
      });
    }
  }
  return rawData;
};

const run = async () => {
  const startTime = Date.now();
  logger.heading("WellMeds Molecule Collection Safe Replacement");

  try {
    // 1. Connect to Database
    logger.info("Connecting to Database...");
    await connectDB();
    logger.success("Database connected.");

    // 2. Fetch existing molecules to map their old IDs/Slugs to Names
    logger.info("Caching existing molecules in database...");
    const oldMolecules = await Molecule.find({}, { _id: 1, name: 1, slug: 1 });
    const oldIdToName = new Map();
    const oldSlugToName = new Map();
    for (const mol of oldMolecules) {
      const lowerName = mol.name.toLowerCase().trim();
      oldIdToName.set(mol._id.toString(), lowerName);
      if (mol.slug) {
        oldSlugToName.set(mol.slug.toLowerCase().trim(), lowerName);
      }
    }
    logger.success(`Cached ${oldMolecules.length} existing molecules.`);

    // 3. Fetch existing products and map their associated molecule names
    logger.info("Caching product-molecule associations...");
    const products = await Product.find({}, { _id: 1, name: 1, molecules: 1, moleculeSlug: 1, productSpecifications: 1 });
    const productMoleculesMap = new Map();

    for (const prod of products) {
      let molNames = [];
      if (prod.molecules && prod.molecules.length > 0) {
        for (const mId of prod.molecules) {
          const mName = oldIdToName.get(mId.toString());
          if (mName) molNames.push(mName);
        }
      }

      // Fallback 1: use moleculeSlug
      if (molNames.length === 0 && prod.moleculeSlug) {
        const mName = oldSlugToName.get(prod.moleculeSlug.toLowerCase().trim());
        if (mName) molNames.push(mName);
      }

      // Fallback 2: use productSpecifications.genericName
      if (molNames.length === 0 && prod.productSpecifications?.genericName) {
        molNames.push(prod.productSpecifications.genericName.toLowerCase().trim());
      }

      if (molNames.length > 0) {
        productMoleculesMap.set(prod._id.toString(), molNames);
      }
    }
    logger.success(`Mapped relationships for ${productMoleculesMap.size} products.`);

    // 4. Parse CSV dataset
    const csvPath = path.resolve("scripts/data/wellmeds_specialty_categories (1) (1).csv");
    const rawData = parseCSV(csvPath);
    logger.success(`Parsed ${rawData.length} rows from CSV.`);

    // 5. Deduplicate and Title-Case molecule names from CSV
    const uniqueMoleculeNamesSet = new Set();
    for (const row of rawData) {
      const titleCaseName = toTitleCase(row.composition);
      if (titleCaseName) {
        uniqueMoleculeNamesSet.add(titleCaseName);
      }
    }
    const uniqueMoleculeNames = Array.from(uniqueMoleculeNamesSet).sort();
    logger.info(`Deduplicated dataset: found ${uniqueMoleculeNames.length} unique molecules to import.`);

    // 6. Delete existing Molecules collection data ONLY
    logger.warn("Deleting all documents in the Molecules collection...");
    const deleteResult = await Molecule.deleteMany({});
    logger.success(`Safely deleted ${deleteResult.deletedCount} existing molecule documents.`);

    // 7. Insert new unique molecules
    logger.info("Inserting new molecules into database...");
    const newMoleculesList = [];
    for (const name of uniqueMoleculeNames) {
      const slug = slugify(name);
      const letter = name.charAt(0).toUpperCase();
      const metaTitle = `Buy ${name} Online | WellMeds`;
      const metaDescription = `Learn about ${name}, its uses, benefits, dosage, side effects and safety information on WellMeds.`;

      const molData = {
        name,
        slug,
        letter,
        shortDescription: "",
        description: "",
        seo: {
          metaTitle,
          metaDescription
        },
        isActive: true,
        aliases: [],
        uses: "",
        benefits: "",
        howItWorks: "",
        dosage: "",
        sideEffects: "",
        warnings: "",
        precautions: "",
        storage: "",
        faqs: [],
        references: [],
        relatedMolecules: []
      };

      const created = await Molecule.create(molData);
      newMoleculesList.push(created);
    }
    logger.success(`Inserted ${newMoleculesList.length} new molecules.`);

    // 8. Build mapping of New Molecules for product linkage
    const newNameToId = new Map();
    const newSlugToId = new Map();
    const newIdToSlug = new Map();
    for (const mol of newMoleculesList) {
      newNameToId.set(mol.name.toLowerCase().trim(), mol._id);
      newSlugToId.set(mol.slug.toLowerCase().trim(), mol._id);
      newIdToSlug.set(mol._id.toString(), mol.slug);
    }

    // 9. Update Product reference fields (molecules ObjectId array and moleculeSlug string)
    logger.info("Rebuilding product references...");
    let updatedProductsCount = 0;
    let failedMatchCount = 0;

    for (const prod of products) {
      const names = productMoleculesMap.get(prod._id.toString());
      if (names && names.length > 0) {
        const newIds = [];
        for (const name of names) {
          let id = newNameToId.get(name.toLowerCase().trim());
          if (!id) {
            // fallback: check if slug matches slugified name
            const slugFromName = slugify(name);
            id = newSlugToId.get(slugFromName);
          }
          if (id) {
            newIds.push(id);
          }
        }

        if (newIds.length > 0) {
          const firstNewSlug = newIdToSlug.get(newIds[0].toString()) || prod.moleculeSlug;
          await Product.updateOne(
            { _id: prod._id },
            { $set: { molecules: newIds, moleculeSlug: firstNewSlug } }
          );
          updatedProductsCount++;
        } else {
          logger.warn(`Could not match any molecules for product: "${prod.name}" (previous compositions: ${names.join(", ")})`);
          failedMatchCount++;
        }
      }
    }

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log("\n=================================");
    console.log("Safe Replace Completed");
    console.log(`Original Molecules: ${oldMolecules.length}`);
    console.log(`Parsed CSV Rows:    ${rawData.length}`);
    console.log(`Unique New Mols:   ${newMoleculesList.length}`);
    console.log(`Products Updated:   ${updatedProductsCount}`);
    console.log(`Products Unmatched: ${failedMatchCount}`);
    console.log(`Execution Time:     ${duration}s`);
    console.log("=================================\n");

  } catch (error) {
    logger.error("A critical error occurred during the database safe replace execution:", error);
  } finally {
    logger.info("Disconnecting from database...");
    await disconnectDB();
    logger.success("Database connection closed.");
    process.exit(0);
  }
};

run();
