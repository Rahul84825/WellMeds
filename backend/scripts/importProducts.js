/**
 * importProducts.js
 * ─────────────────────────────────────────────────────────────────────────────
 * WellMeds Product Import Utility  –  ADD ONLY / NO UPDATE / NO DELETE
 *
 * Reads an Excel file from scripts/data/ and inserts NEW products into
 * MongoDB.  This script NEVER modifies, updates, replaces, or deletes any
 * existing document.  It only inserts rows that are genuinely new.
 *
 * Usage:
 *   npm run import:products            (from backend/ directory)
 *   node scripts/importProducts.js
 *
 * To change the Excel filename, update PRODUCT_EXCEL_FILENAME below.
 * ─────────────────────────────────────────────────────────────────────────────
 */

// ── Shared helpers (reused from Molecule Import Utility) ──────────────────────
import { connectDB, disconnectDB } from "./helpers/db.js";
import { logger } from "./helpers/logger.js";
import { slugify } from "./helpers/slugify.js";

// ── Product-specific helpers ──────────────────────────────────────────────────
import { readProductExcel } from "./helpers/productExcelReader.js";
import {
  toString,
  toNumber,
  toBoolean,
  toArray,
  toBulletArray,
  parseComposition,
  parseMedicalSections,
  parseBenefits,
  parseFAQs,
  parseSafetyCards,
  parseSpecifications,
  parseImagesData,
  parseSEO,
  uniqueSlug,
} from "./helpers/parser.js";

// ── Mongoose models ───────────────────────────────────────────────────────────
import { Product } from "../src/models/Product.js";
import { Category } from "../src/models/Category.js";
import { Molecule } from "../src/models/Molecule.js";
import { MedicalSpeciality } from "../src/models/MedicalSpeciality.js";
import { SurgicalCategory } from "../src/models/SurgicalCategory.js";

// ─────────────────────────────────────────────────────────────────────────────
// CONFIGURATION  ←  Change the filename here when the client provides a new file
// ─────────────────────────────────────────────────────────────────────────────
const PRODUCT_EXCEL_FILENAME = "Product_Template.xlsx";

// ─────────────────────────────────────────────────────────────────────────────
// CATEGORY COLUMN ALIASES
// Add any new column name variants here — the importer will recognise them
// automatically. All matching is case-insensitive and whitespace-trimmed.
// ─────────────────────────────────────────────────────────────────────────────
const CATEGORY_COLUMN_ALIASES = [
  "Category",
  "category",
  "Product Category",
  "Medicine Category",
  "Main Category",
  "Therapeutic Category",
  "Therapeutic Class",
  "Category Name",
  "Drug Category",
  "Treatment Category",
  "product_category",
  "medicine_category",
  "therapeutic_category",
  "category_name",
];

// ─────────────────────────────────────────────────────────────────────────────
// Utility: case-insensitive cell getter
// ─────────────────────────────────────────────────────────────────────────────
const getVal = (row, keys) => {
  for (const k of keys) {
    if (row[k] !== undefined) return row[k];
    const match = Object.keys(row).find(
      (rk) => rk.toLowerCase().trim() === k.toLowerCase().trim()
    );
    if (match && row[match] !== undefined) return row[match];
  }
  return undefined;
};

// ─────────────────────────────────────────────────────────────────────────────
// Utility: detect whether ANY category column alias exists in the row keys
// Returns { found: boolean, columnKey: string|null, rawValue: string }
// ─────────────────────────────────────────────────────────────────────────────
const detectCategoryColumn = (row) => {
  const rowKeys = Object.keys(row);
  for (const alias of CATEGORY_COLUMN_ALIASES) {
    const matched = rowKeys.find(
      (rk) => rk.toLowerCase().trim() === alias.toLowerCase().trim()
    );
    if (matched !== undefined) {
      return {
        found: true,
        columnKey: matched,
        rawValue: toString(row[matched]),
      };
    }
  }
  return { found: false, columnKey: null, rawValue: "" };
};

// ─────────────────────────────────────────────────────────────────────────────
// Utility: content-inference fallback
// Scans free-text columns for any known category name (whole-word, case-insensitive).
// NEVER creates or modifies categories — read-only lookup only.
//
// @param {object}  row          – Excel row
// @param {Map}     categoryMap  – name(lowercase) → ObjectId
// @param {object[]} allCategories – full category docs (for name access)
// @returns {{ categoryId: ObjectId|null, matchedName: string|null, columnKey: string|null }}
// ─────────────────────────────────────────────────────────────────────────────
const inferCategoryFromContent = (row, categoryMap, allCategories) => {
  // Columns to scan, in priority order
  const scanColumns = [
    "More Information",
    "Uses",
    "Introduction",
    "Description",
    "Safety Information Cards",
    "Effects (How It Works)",
  ];

  for (const col of scanColumns) {
    const cellVal = toString(getVal(row, [col]));
    if (!cellVal) continue;
    const cellLower = cellVal.toLowerCase();

    for (const cat of allCategories) {
      const catNameLower = cat.name.toLowerCase().trim();
      // Whole-word, case-insensitive check (e.g. "oncology" inside the cell)
      const wordBoundaryRe = new RegExp(
        `(?:^|[\\s,.(;])(${catNameLower.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})(?:[\\s,.)!;]|$)`,
        "i"
      );
      if (wordBoundaryRe.test(cellLower)) {
        return {
          categoryId: cat._id,
          matchedName: cat.name,
          columnKey: col,
        };
      }
    }
  }
  return { categoryId: null, matchedName: null, columnKey: null };
};

// ─────────────────────────────────────────────────────────────────────────────
// Utility: build a lookup map  name(lowercase) → ObjectId
// ─────────────────────────────────────────────────────────────────────────────
const buildLookup = (docs) => {
  const map = new Map();
  for (const doc of docs) {
    if (doc.name) {
      map.set(doc.name.toLowerCase().trim(), doc._id);
    }
  }
  return map;
};

// ─────────────────────────────────────────────────────────────────────────────
// Utility: escape a string for use in a RegExp
// ─────────────────────────────────────────────────────────────────────────────
const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// ─────────────────────────────────────────────────────────────────────────────
// Main execution
// ─────────────────────────────────────────────────────────────────────────────
const run = async () => {
  const startTime = Date.now();
  logger.heading("WellMeds Product Import Utility  (ADD ONLY)");

  // Counters
  let importedCount = 0;
  let skippedCount = 0;
  let errorCount = 0;
  let warningCount = 0;

  try {
    // ── 1. Database connection ─────────────────────────────────────────────
    logger.info("Connecting to MongoDB…");
    await connectDB();
    logger.success("[CONNECTED] MongoDB Connected");

    // ── 2. Read Excel ──────────────────────────────────────────────────────
    logger.info("[READ] Reading Excel…");
    const { sheetName, data } = readProductExcel(PRODUCT_EXCEL_FILENAME);
    logger.success(
      `[READ] Sheet "${sheetName}" loaded — ${data.length} data row(s) found.`
    );

    if (data.length === 0) {
      logger.warn("No data rows found in the Excel file. Exiting.");
      return;
    }

    // ── 3. Pre-load reference collections into memory ─────────────────────
    logger.info("Pre-loading reference collections…");

    const [
      existingProducts,
      allCategories,
      allMolecules,
      allSpecialities,
      allSurgicalCategories,
    ] = await Promise.all([
      Product.find({}, { name: 1, slug: 1, sku: 1 }),
      Category.find({}, { name: 1 }),
      Molecule.find({}, { name: 1 }),
      MedicalSpeciality.find({}, { name: 1 }),
      SurgicalCategory.find({}, { name: 1 }),
    ]);

    // Duplicate-detection sets (checked in O(1))
    const existingNames = new Set(
      existingProducts.map((p) => p.name.toLowerCase().trim())
    );
    const existingSlugs = new Set(
      existingProducts.map((p) => (p.slug || "").toLowerCase().trim())
    );
    const existingSkus = new Set(
      existingProducts
        .filter((p) => p.sku)
        .map((p) => p.sku.toLowerCase().trim())
    );

    // Reference lookup maps
    const categoryMap = buildLookup(allCategories);
    const moleculeMap = buildLookup(allMolecules);
    const specialityMap = buildLookup(allSpecialities);
    const surgicalCategoryMap = buildLookup(allSurgicalCategories);

    logger.success(
      `Reference data loaded: ` +
        `${allCategories.length} categories, ` +
        `${allMolecules.length} molecules, ` +
        `${allSpecialities.length} specialities, ` +
        `${allSurgicalCategories.length} surgical categories.`
    );
    logger.success(
      `Existing products in DB: ${existingProducts.length} (all will be preserved).`
    );

    // ── 4. Process each row ────────────────────────────────────────────────
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      const rowNum = i + 2; // Excel row number (header = row 1)

      try {
        // ── 4a. Extract product name (required) ────────────────────────────
        const rawName = getVal(row, [
          "PRODUCT NAME",
          "Product Name",
          "Name",
          "name",
          "product_name",
        ]);

        if (!rawName || toString(rawName).length === 0) {
          logger.warn(`Row ${rowNum}: Skipped — "PRODUCT NAME" column is empty.`);
          continue;
        }

        const name = toString(rawName);
        logger.info(`[ROW] Processing: ${name}`);

        // ── 4b. Duplicate detection ────────────────────────────────────────
        const nameLower = name.toLowerCase().trim();

        // Check SKU early if present
        const rawSku = getVal(row, ["SKU", "sku", "Sku", "Product SKU"]);
        const sku = rawSku ? toString(rawSku) : undefined;

        if (existingNames.has(nameLower)) {
          logger.warn(`[SKIPPED] Product already exists (name match): ${name}`);
          skippedCount++;
          continue;
        }

        if (sku && existingSkus.has(sku.toLowerCase().trim())) {
          logger.warn(`[SKIPPED] Product already exists (SKU match): ${name} [SKU: ${sku}]`);
          skippedCount++;
          continue;
        }

        // ── 4c. Slug ───────────────────────────────────────────────────────
        const rawSlug = getVal(row, [
          "URL Custom Slug",
          "Slug",
          "slug",
          "URL Slug",
          "url_slug",
          "url_custom_slug",
        ]);
        let baseSlug = rawSlug
          ? slugify(toString(rawSlug).replace(/^\/+/, ""))
          : slugify(name);
        if (!baseSlug) baseSlug = slugify(name);

        // Ensures uniqueness; also mutates existingSlugs to track within-file duplicates
        const finalSlug = uniqueSlug(baseSlug, existingSlugs);

        if (finalSlug !== baseSlug) {
          logger.warn(
            `[SLUG] Slug "${baseSlug}" already taken — using "${finalSlug}" for: ${name}`
          );
          warningCount++;
        }

        // ── 4d. Resolve Category (REQUIRED) ───────────────────────────────
        //
        // Strategy (in order):
        //   1. Scan row for any recognised category column alias
        //   2. If column found → case-insensitive lookup in categoryMap
        //   3. If column missing or value not matched → content-inference
        //      fallback (scans free-text columns for any DB category name)
        //   4. If still unresolved → log clearly and skip product
        //
        // NEVER creates, modifies, or deletes categories.
        // ─────────────────────────────────────────────────────────────────
        let categoryId = null;
        const {
          found: catColFound,
          columnKey: catColKey,
          rawValue: catColValue,
        } = detectCategoryColumn(row);

        if (catColFound && catColValue.length > 0) {
          // Column present and has a value — direct name lookup
          const directId = categoryMap.get(catColValue.toLowerCase().trim()) || null;
          if (directId) {
            categoryId = directId;
            logger.muted(`  [CATEGORY] Matched: "${catColValue}" (column: "${catColKey}")`);
          } else {
            logger.warn(`[WARNING] Unknown Category: "${catColValue}" (column: "${catColKey}")`);
            warningCount++;
            // Before giving up, try content inference
            const { categoryId: inferredId, matchedName: inferredName, columnKey: inferredCol } =
              inferCategoryFromContent(row, categoryMap, allCategories);
            if (inferredId) {
              categoryId = inferredId;
              logger.muted(
                `  [CATEGORY] Inferred "${inferredName}" from content of column "${inferredCol}"`
              );
            } else {
              logger.warn(`[WARNING] Category not resolvable — skipping product: ${name}`);
              skippedCount++;
              continue;
            }
          }
        } else if (catColFound && catColValue.length === 0) {
          // Column exists but the cell is blank — try content inference
          logger.warn(`[WARNING] Category column "${catColKey}" is blank for: ${name}`);
          warningCount++;
          const { categoryId: inferredId, matchedName: inferredName, columnKey: inferredCol } =
            inferCategoryFromContent(row, categoryMap, allCategories);
          if (inferredId) {
            categoryId = inferredId;
            logger.muted(
              `  [CATEGORY] Inferred "${inferredName}" from content of column "${inferredCol}"`
            );
          } else {
            logger.warn(`[WARNING] Category not resolvable — skipping product: ${name}`);
            skippedCount++;
            continue;
          }
        } else {
          // No category column found at all — try content inference
          logger.warn(
            `[WARNING] No Category column found in Excel for: ${name} — attempting content inference…`
          );
          warningCount++;
          const { categoryId: inferredId, matchedName: inferredName, columnKey: inferredCol } =
            inferCategoryFromContent(row, categoryMap, allCategories);
          if (inferredId) {
            categoryId = inferredId;
            logger.muted(
              `  [CATEGORY] Inferred "${inferredName}" from content of column "${inferredCol}"`
            );
          } else {
            logger.warn(`[WARNING] Category not resolvable — skipping product: ${name}`);
            skippedCount++;
            continue;
          }
        }

        // ── 4e. Resolve Molecules ──────────────────────────────────────────
        const rawMolecules = getVal(row, [
          "Associated Molecules",
          "Molecules",
          "molecules",
          "Molecule",
          "associated_molecules",
          "Generic Name",
        ]);
        const moleculeIds = [];

        if (rawMolecules) {
          const moleculeNames = toArray(rawMolecules, /[;,]+/);
          for (const mName of moleculeNames) {
            const mId = moleculeMap.get(mName.toLowerCase().trim());
            if (mId) {
              moleculeIds.push(mId);
              logger.muted(`  [MOLECULE] Matched: ${mName}`);
            } else {
              logger.warn(`[WARNING] Unknown Molecule: "${mName}"`);
              warningCount++;
              // Continue with remaining valid molecules — do NOT skip product
            }
          }
        }

        // ── 4f. Resolve Medical Specialities ──────────────────────────────
        const rawSpecialities = getVal(row, [
          "Specialities",
          "Speciality",
          "specialities",
          "speciality",
          "Medical Speciality",
          "Medical Specialities",
        ]);
        const specialityIds = [];

        if (rawSpecialities) {
          const specNames = toArray(rawSpecialities, /[;,]+/);
          for (const sName of specNames) {
            const sId = specialityMap.get(sName.toLowerCase().trim());
            if (sId) {
              specialityIds.push(sId);
              logger.muted(`  [SPECIALITY] Matched: ${sName}`);
            } else {
              logger.warn(`[WARNING] Unknown Speciality: "${sName}"`);
              warningCount++;
            }
          }
        }

        // ── 4g. Surgical Category ──────────────────────────────────────────
        const rawIsSurgical = getVal(row, [
          "isSurgical",
          "Is Surgical",
          "Surgical",
          "surgical",
          "is_surgical",
        ]);
        const isSurgical = toBoolean(rawIsSurgical);
        let surgicalCategoryId = null;

        if (isSurgical) {
          const rawSurgCat = getVal(row, [
            "Surgical Category",
            "surgicalCategory",
            "surgical_category",
            "SurgicalCategory",
          ]);
          const surgCatName = toString(rawSurgCat);
          if (surgCatName) {
            surgicalCategoryId =
              surgicalCategoryMap.get(surgCatName.toLowerCase().trim()) || null;
            if (surgicalCategoryId) {
              logger.muted(`  [SURGICAL CATEGORY] Matched: ${surgCatName}`);
            } else {
              logger.warn(
                `[WARNING] Unknown Surgical Category: "${surgCatName}" — isSurgical set to false.`
              );
              warningCount++;
            }
          }
        }

        // ── 4h. Related Products (resolved post-insert) ────────────────────
        const rawRelated = getVal(row, [
          "Related Products",
          "relatedProducts",
          "related_products",
        ]);
        const relatedProductNames = rawRelated
          ? toArray(rawRelated, /[;,]+/)
          : [];

        // ── 4i. Scalar fields ──────────────────────────────────────────────
        const manufacturer = toString(getVal(row, ["Manufacturer", "manufacturer"]));
        const marketer = toString(getVal(row, ["Marketer", "marketer", "Marketed By"]));
        const country = toString(getVal(row, ["Country", "country", "Country of Origin"]));
        const importedCountry = toString(
          getVal(row, ["Imported Country", "importedCountry", "imported_country", "Country of Import"])
        );
        const strength = toString(getVal(row, ["Strength", "strength", "Dosage Strength"]));
        const packSize = toString(getVal(row, ["Pack Size", "packSize", "pack_size", "Pack"]));
        const brand = toString(getVal(row, ["Brand", "brand", "Brand Name"]));
        const price = toNumber(getVal(row, ["Price", "price", "MRP"]), 0);
        const originalPrice = toNumber(
          getVal(row, ["Original Price", "originalPrice", "original_price", "MRP Original"]),
          0
        );
        const stock = toNumber(getVal(row, ["Stock", "stock", "Quantity"]), 0);
        const description = toString(
          getVal(row, ["Introduction", "Description", "description", "introduction", "Product Description"])
        );
        const image = toString(getVal(row, ["Image", "image", "Image URL", "Main Image"]));
        const rawImages = getVal(row, ["Images", "images", "Image URLs", "Additional Images"]);
        const images = rawImages ? toArray(rawImages, /[;,]+/) : [];
        const medicineCategory = toString(
          getVal(row, ["Medicine Category", "medicineCategory", "medicine_category"])
        );
        const moleculeSlug = toString(
          getVal(row, ["Molecule Slug", "moleculeSlug", "molecule_slug"])
        );
        const displayOrder = toNumber(
          getVal(row, ["Display Order", "displayOrder", "display_order"]),
          0
        );
        const similarMedicinePriority = toNumber(
          getVal(row, ["Similar Medicine Priority", "similarMedicinePriority", "similar_medicine_priority"]),
          0
        );
        const badge = toString(getVal(row, ["Badge", "badge", "Product Badge"]));
        const rawProductType = toString(
          getVal(row, ["Product Type", "productType", "product_type"])
        ).toLowerCase();
        const productType = ["medicine", "wellness"].includes(rawProductType)
          ? rawProductType
          : "medicine";

        // ── 4j. Boolean flags ──────────────────────────────────────────────
        const requiresRx = toBoolean(
          getVal(row, ["requiresRx", "Requires Rx", "Requires Prescription", "Rx"])
        );
        const isColdChain = toBoolean(
          getVal(row, ["isColdChain", "Is Cold Chain", "Cold Chain", "cold_chain"])
        );
        const isPrescriptionRequired = toBoolean(
          getVal(row, ["isPrescriptionRequired", "Prescription Required", "Is Prescription Required"])
        );
        const isImported = toBoolean(
          getVal(row, ["isImported", "Is Imported", "Imported", "imported"])
        );
        const inStock = toBoolean(
          getVal(row, ["inStock", "In Stock", "In stock"]),
          true // default true
        );

        // ── 4k. Medical Sections ───────────────────────────────────────────
        const medicalSections = parseMedicalSections(
          {
            title: "Uses",
            rawValue: getVal(row, ["Uses", "uses", "Indications", "What it Treats"]),
          },
          {
            title: "How It Works",
            rawValue: getVal(row, [
              "Effects (How It Works)",
              "How It Works",
              "Mechanism of Action",
              "effects_how_it_works",
            ]),
          },
          {
            title: "Drug Interactions",
            rawValue: getVal(row, [
              "Interaction with Other Drugs",
              "Drug Interactions",
              "Interactions",
              "drug_interactions",
            ]),
          },
          {
            title: "More Information",
            rawValue: getVal(row, ["More Information", "Additional Information", "more_information"]),
          }
        );

        // ── 4l. Structured arrays ──────────────────────────────────────────
        const usageInstructions = toBulletArray(
          getVal(row, [
            "Usage & Dosage Instructions",
            "Usage Instructions",
            "usageInstructions",
            "usage_instructions",
            "Dosage",
          ])
        );

        const storageInstructions = toBulletArray(
          getVal(row, ["Storage Instructions", "Storage", "storageInstructions", "storage_instructions"])
        );

        const warnings = toBulletArray(getVal(row, ["Warnings", "warnings", "Warning"]));

        // Combine Common + Serious side effects
        const rawCommonSE = getVal(row, ["Common Side Effects", "Side Effects", "sideEffects", "side_effects"]);
        const rawSeriousSE = getVal(row, ["Serious Side Effects", "serious_side_effects"]);
        const sideEffects = [...toBulletArray(rawCommonSE), ...toBulletArray(rawSeriousSE)];

        // Combine Safety Advice + Safety Information Cards
        const rawSafetyAdvice = getVal(row, ["Safety Advice", "Safety", "safety_advice"]);
        const rawSafetyCards = getVal(row, ["Safety Information Cards", "safety_information_cards"]);
        const safetyCards = [...parseSafetyCards(rawSafetyAdvice), ...parseSafetyCards(rawSafetyCards)];

        const faqs = parseFAQs(getVal(row, ["Patient FAQs", "FAQs", "faqs", "FAQ"]));

        const specifications = parseSpecifications(
          getVal(row, ["Specifications", "specifications", "Specs"])
        );

        const composition = parseComposition(
          getVal(row, ["Composition", "composition", "Active Ingredients"])
        );

        const benefits = parseBenefits(getVal(row, ["Benefits", "benefits"]));

        const imagesData = parseImagesData(
          getVal(row, ["Images Data", "imagesData", "images_data", "Image Data"])
        );

        const seo = parseSEO(
          getVal(row, ["Search Engine Optimization (SEO)", "SEO", "seo", "SEO Information"]),
          name
        );

        const rawReferences = getVal(row, [
          "Medical References / Citations",
          "References",
          "references",
          "Citations",
        ]);
        const references = rawReferences ? toArray(rawReferences, /[;,]+/) : [];

        // ── 4m. Assemble Product document ──────────────────────────────────
        const productDoc = {
          name,
          slug: finalSlug,
          category: categoryId,
          molecules: moleculeIds,
          specialities: specialityIds,
          isSurgical: surgicalCategoryId ? true : false,
          ...(surgicalCategoryId && { surgicalCategory: surgicalCategoryId }),

          manufacturer,
          marketer,
          country,
          importedCountry,
          strength,
          packSize,
          brand,
          price,
          originalPrice,
          stock,
          description,
          image,
          images,
          imagesData,
          medicineCategory,
          moleculeSlug,
          displayOrder,
          similarMedicinePriority,
          badge,
          productType,

          requiresRx,
          isColdChain,
          isPrescriptionRequired,
          isImported,
          inStock,

          medicalSections,
          usageInstructions,
          storageInstructions,
          warnings,
          sideEffects,
          safetyCards,
          faqs,
          specifications,
          composition,
          benefits,
          seo,
          references,
          relatedProducts: [],
        };

        // Only set SKU if it has a value (sparse unique index)
        if (sku) productDoc.sku = sku;

        // ── 4n. Track in-memory before insertion ───────────────────────────
        // (existingSlugs already mutated by uniqueSlug)
        existingNames.add(nameLower);
        if (sku) existingSkus.add(sku.toLowerCase().trim());

        // ── 4o. Insert into MongoDB ────────────────────────────────────────
        const inserted = await Product.create(productDoc);
        logger.success(`[INSERTED] ${name}`);
        importedCount++;

        // ── 4p. Patch related products (best-effort, ADD-ONLY on new doc) ──
        if (relatedProductNames.length > 0) {
          const relatedIds = [];
          for (const rpName of relatedProductNames) {
            const found = await Product.findOne(
              { name: new RegExp(`^${escapeRegex(rpName)}$`, "i") },
              { _id: 1 }
            );
            if (found) {
              relatedIds.push(found._id);
            } else {
              logger.warn(`[WARNING] Unknown Related Product: "${rpName}" — ignored for: ${name}`);
              warningCount++;
            }
          }
          if (relatedIds.length > 0) {
            // Only patches the freshly inserted document — never touches existing products
            await Product.updateOne(
              { _id: inserted._id },
              { $set: { relatedProducts: relatedIds } }
            );
          }
        }

      } catch (rowErr) {
        // Per-row isolation: continue importing remaining rows
        logger.error(`[ERROR] Row ${rowNum} failed — ${rowErr.message || rowErr}`);
        errorCount++;
      }
    }

  } catch (fatalErr) {
    logger.error("[ERROR] A critical error occurred during the import:", fatalErr);
    errorCount++;
  } finally {
    // ── 5. Final Summary ───────────────────────────────────────────────────
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log("\n===========================================");
    console.log("  Import Completed");
    console.log("===========================================");
    console.log(`  Imported : ${importedCount}`);
    console.log(`  Skipped  : ${skippedCount}`);
    console.log(`  Warnings : ${warningCount}`);
    console.log(`  Errors   : ${errorCount}`);
    console.log(`  Time     : ${duration}s`);
    console.log("===========================================\n");

    // ── 6. Disconnect ──────────────────────────────────────────────────────
    logger.info("Disconnecting from database…");
    await disconnectDB();
    logger.success("Database connection closed.");
    process.exit(0);
  }
};

run();
