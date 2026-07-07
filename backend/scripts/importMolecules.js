import { connectDB, disconnectDB } from "./helpers/db.js";
import { readExcelFile } from "./helpers/excelReader.js";
import { slugify } from "./helpers/slugify.js";
import { logger } from "./helpers/logger.js";
import { Molecule } from "../src/models/Molecule.js";

const run = async () => {
  const startTime = Date.now();
  logger.heading("WellMeds Molecule Import Utility");

  try {
    // 1. Connect to Database
    logger.info("Connecting to MongoDB database...");
    await connectDB();
    logger.success("Database connected successfully.");

    // 2. Read Excel File
    logger.info("Reading Excel sheet...");
    const { sheetName, data } = readExcelFile();
    logger.success(`Read sheet "${sheetName}" containing ${data.length} rows.`);

    // Helper to retrieve value case-insensitively
    const getVal = (row, keys) => {
      for (const k of keys) {
        if (row[k] !== undefined) return row[k];
        const match = Object.keys(row).find(rk => rk.toLowerCase().trim() === k.toLowerCase().trim());
        if (match && row[match] !== undefined) return row[match];
      }
      return undefined;
    };

    // 3. Fetch existing molecules to check for duplicates in memory (performant)
    logger.info("Fetching existing molecules from database to avoid duplicate queries...");
    const existingMolecules = await Molecule.find({}, { name: 1, slug: 1 });
    const existingNames = new Set(existingMolecules.map(m => m.name.toLowerCase().trim()));
    const existingSlugs = new Set(existingMolecules.map(m => m.slug.toLowerCase().trim()));
    logger.success(`Found ${existingMolecules.length} existing molecules in database.`);

    let insertedCount = 0;
    let skippedCount = 0;
    let failedCount = 0;

    const newMolecules = [];

    // 4. Parse Excel rows
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      const rawName = getVal(row, ["Generic Name", "Name", "generic_name"]);
      if (!rawName) {
        logger.warn(`Row ${i + 2}: Ignored because 'Generic Name' is empty.`);
        continue;
      }

      const name = rawName.toString().trim();
      const nameLower = name.toLowerCase();

      // Resolve slug
      const rawSlug = getVal(row, ["URL Slug", "Slug", "url_slug"]);
      let slug = "";
      if (rawSlug) {
        slug = slugify(rawSlug.toString().replace(/^\/+/, "").trim());
      }
      if (!slug) {
        slug = slugify(name);
      }

      // Skip if already in database or if it is a duplicate in this run
      if (existingNames.has(nameLower) || existingSlugs.has(slug)) {
        logger.warn(`Skipped: Molecule "${name}" (slug: "${slug}") already exists in database.`);
        skippedCount++;
        continue;
      }

      // Meta information
      const rawMetaDesc = getVal(row, ["Meta Description", "meta_description"]);
      const metaDescription = rawMetaDesc 
        ? rawMetaDesc.toString().trim()
        : `Learn about ${name}, its uses, benefits, dosage, side effects and safety information on WellMeds.`;
      
      const metaTitle = `Buy ${name} Online | WellMeds`;

      // Generate letter
      const letter = name.charAt(0).toUpperCase();

      // Create new Molecule object
      const moleculeData = {
        name,
        slug,
        letter,
        shortDescription: "",
        description: "",
        seo: {
          metaTitle,
          metaDescription,
          canonicalUrl: "",
          ogImage: ""
        },
        isActive: true,
        isFeatured: false,
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

      newMolecules.push(moleculeData);
      
      // Track locally to prevent duplicates inside the Excel sheet itself
      existingNames.add(nameLower);
      existingSlugs.add(slug);
    }

    // 5. Insert new molecules
    logger.info(`Starting insertion of ${newMolecules.length} new molecules...`);
    for (const mol of newMolecules) {
      try {
        await Molecule.create(mol);
        logger.success(`Inserted: Molecule "${mol.name}"`);
        insertedCount++;
      } catch (err) {
        logger.error(`Failed: Molecule "${mol.name}"`, err);
        failedCount++;
      }
    }

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    console.log("\n=================================");
    console.log("Import Finished");
    console.log(`Inserted: ${insertedCount}`);
    console.log(`Skipped: ${skippedCount}`);
    console.log(`Failed: ${failedCount}`);
    console.log(`Execution Time: ${duration}s`);
    console.log("=================================\n");

  } catch (error) {
    logger.error("A critical error occurred during the import execution:", error);
  } finally {
    logger.info("Disconnecting from database...");
    await disconnectDB();
    logger.success("Database connection closed.");
    process.exit(0);
  }
};

run();
