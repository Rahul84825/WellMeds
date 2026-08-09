/**
 * importProducts.js
 * ─────────────────────────────────────────────────────────────────────────────
 * WellMeds Product Import Pipeline — SINGLE CANONICAL IMPORTER
 *
 * Reads product XLSX files from data/import/ or backend/scripts/data/ and
 * creates genuinely NEW products in MongoDB.
 *
 * Usage:
 *   npm run import:products                            # Process all XLSX files in data directory
 *   npm run import:products -- --dry-run               # Perform a dry run without modifying MongoDB
 *   npm run import:products -- --file "filename.xlsx"  # Process a specific XLSX file
 *   npm run import:products -- --file "file.xlsx" --dry-run
 *
 * NON-DESTRUCTIVE GUARANTEES:
 * - NEVER updates, overwrites, replaces, or deletes existing products.
 * - NEVER modifies existing product prices, categories, molecules, or content.
 * - Source of truth is the existing database — existing products win.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { connectDB, disconnectDB } from "./helpers/db.js";
import { logger } from "./helpers/logger.js";
import { readProductExcel, getImportXlsxFiles } from "./helpers/productExcelReader.js";
import path from "path";
import fs from "fs";
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

// Mongoose models
import { Product } from "../src/models/Product.js";
import { Category } from "../src/models/Category.js";
import { Molecule } from "../src/models/Molecule.js";
import { MedicalSpeciality } from "../src/models/MedicalSpeciality.js";
import { SurgicalCategory } from "../src/models/SurgicalCategory.js";

// Parse CLI flags
const args = process.argv.slice(2);
const isDryRun = args.includes("--dry-run") || args.includes("-d");

let specifiedFile = null;
const fileFlagIdx = args.findIndex((a) => a === "--file" || a === "-f");
if (fileFlagIdx !== -1 && args[fileFlagIdx + 1]) {
  specifiedFile = args[fileFlagIdx + 1];
} else {
  // Check if non-flag arg is passed as file path
  const nonFlagArg = args.find((a) => !a.startsWith("-"));
  if (nonFlagArg) specifiedFile = nonFlagArg;
}

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

const inferCategoryFromContent = (row, categoryMap, allCategories) => {
  const scanColumns = [
    "More Information",
    "Uses",
    "Introduction",
    "Description",
    "About This Medicine",
    "Key Benefits",
    "SEO Keywords",
    "Safety Information Cards",
    "Effects (How It Works)",
  ];

  const categoryKeywordsMap = {
    "cancer care": ["cancer care", "cancer", "oncology", "anticancer", "mcrpc", "nmcrpc", "tumor", "tumour"],
    "cardiac care": ["cardiac care", "cardiac", "cardiovascular", "heart", "hypertension", "blood pressure"],
    "diabetes care": ["diabetes care", "diabetes", "diabetic", "glycemic", "insulin", "glucose"],
    "respiratory care": ["respiratory care", "respiratory", "lungs", "asthma", "copd", "bronchial"],
    "kidney / transplant care": ["kidney care", "transplant care", "kidney", "renal", "transplant", "nephrology"],
    "transplant care": ["transplant care", "transplant"],
    "infectious disease care": ["infectious disease care", "infectious disease", "antibiotic", "antifungal", "antiviral", "infection"],
    "fungal care": ["fungal care", "fungal", "antifungal"],
    "hepatitis care": ["hepatitis care", "hepatitis", "liver", "hepatic"],
    "neuro & mental health": ["neuro", "neurology", "mental health", "psychiatric", "brain", "seizure"],
    "rare & orphan diseases": ["rare disease", "orphan disease", "genetics"],
    "palliative care": ["palliative care", "palliative", "pain management"],
    "post-surgery recovery": ["post-surgery", "surgery recovery", "post-operative"],
  };

  for (const col of scanColumns) {
    const cellVal = toString(getVal(row, [col]));
    if (!cellVal) continue;
    const cellLower = cellVal.toLowerCase();

    for (const cat of allCategories) {
      const catNameLower = cat.name.toLowerCase().trim();
      const keywords = categoryKeywordsMap[catNameLower] || [catNameLower];

      for (const kw of keywords) {
        const wordBoundaryRe = new RegExp(
          `(?:^|[\\s,.(;])(${kw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})(?:[\\s,.)!;]|$)`,
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
  }
  return { categoryId: null, matchedName: null, columnKey: null };
};

const buildLookup = (docs) => {
  const map = new Map();
  for (const doc of docs) {
    if (doc.name) {
      map.set(doc.name.toLowerCase().trim(), doc._id);
    }
  }
  return map;
};

/**
 * Clean active ingredient text to strip dosage/strength quantities
 */
const extractBaseMoleculeName = (rawText) => {
  if (!rawText) return "";
  return String(rawText)
    .replace(/\s*\d+(\.\d+)?\s*(mg|gm|g|mcg|ml|iu|units?|%)\b/gi, "")
    .replace(/\([^)]*\)/g, "")
    .replace(/[^\w\s\-]/g, "")
    .replace(/\s+/g, " ")
    .trim();
};

const run = async () => {
  const startTime = Date.now();
  logger.heading(`WellMeds Product Import Pipeline ${isDryRun ? "[DRY-RUN MODE]" : "[LIVE EXECUTION]"}`);

  let totalXlsxRows = 0;
  let successfullyAdded = 0;
  let skippedAlreadyExisted = 0;
  let skippedInvalid = 0;
  let failedUnexpectedly = 0;

  let moleculeFieldsMapped = 0;
  let marketerFieldsMapped = 0;
  let manufacturerFieldsMapped = 0;

  const detectedColumns = new Set();
  const detectedMolecules = new Set();
  const detectedMarketers = new Set();
  const detectedManufacturers = new Set();

  const skippedDuplicatesList = [];
  const skippedInvalidList = [];
  const newProductsSummaryList = [];

  let dbInfo = null;
  let allCategories = [];
  let existingProducts = [];
  let previousProductCount = 0;

  try {
    // ── 1. Database connection ─────────────────────────────────────────────
    logger.info("Connecting to MongoDB…");
    dbInfo = await connectDB();
    logger.success(`[CONNECTED] ${dbInfo.isAtlas ? "MongoDB Atlas" : "MongoDB"} Connected`);

    // ── 2. Determine XLSX files to process ────────────────────────────────
    let filesToProcess = [];
    if (specifiedFile) {
      filesToProcess = [specifiedFile];
    } else {
      filesToProcess = getImportXlsxFiles();
    }

    if (filesToProcess.length === 0) {
      logger.error("No XLSX files found to process in scripts/data or backend/scripts/data.");
      return;
    }

    logger.info(`[FILES] Found ${filesToProcess.length} XLSX file(s) to process:`);
    filesToProcess.forEach((f) => console.log(`  - ${path.basename(f)}`));

    // ── 3. Pre-load reference collections & DB product count ────────────────
    logger.info("Pre-loading database reference collections…");

    const [
      fetchedProducts,
      fetchedCategories,
      allMolecules,
      allSpecialities,
      allSurgicalCategories,
    ] = await Promise.all([
      Product.find({}, { name: 1, slug: 1, sku: 1, manufacturer: 1, marketer: 1, brand: 1 }),
      Category.find({}, { name: 1 }),
      Molecule.find({}, { name: 1, aliases: 1, slug: 1 }),
      MedicalSpeciality.find({}, { name: 1 }),
      SurgicalCategory.find({}, { name: 1 }),
    ]);

    existingProducts = fetchedProducts;
    allCategories = fetchedCategories;
    previousProductCount = existingProducts.length;

    // Duplicate-detection maps & sets (O(1) lookup)
    const existingNamesMap = new Map();
    const existingSlugs = new Set();
    const existingSkus = new Set();

    for (const p of existingProducts) {
      const normName = p.name.toLowerCase().trim();
      existingNamesMap.set(normName, p);
      if (p.slug) existingSlugs.add(p.slug.toLowerCase().trim());
      if (p.sku) existingSkus.add(p.sku.toLowerCase().trim());
    }

    const categoryMap = buildLookup(allCategories);
    
    // Molecule lookup map (supports names and aliases)
    const moleculeMap = new Map();
    const moleculeSlugSet = new Set();
    for (const m of allMolecules) {
      moleculeMap.set(m.name.toLowerCase().trim(), m._id);
      if (m.slug) moleculeSlugSet.add(m.slug.toLowerCase().trim());
      if (m.aliases && Array.isArray(m.aliases)) {
        for (const alias of m.aliases) {
          moleculeMap.set(alias.toLowerCase().trim(), m._id);
        }
      }
    }

    const specialityMap = buildLookup(allSpecialities);

    const manufacturerMap = new Map();
    const brandMap = new Map();

    for (const p of existingProducts) {
      if (p.manufacturer) {
        const norm = p.manufacturer.toLowerCase().trim();
        if (!manufacturerMap.has(norm)) manufacturerMap.set(norm, p.manufacturer);
      }
      if (p.brand) {
        const norm = p.brand.toLowerCase().trim();
        if (!brandMap.has(norm)) brandMap.set(norm, p.brand);
      }
    }

    console.log("\n===========================================");
    console.log("  Database Pre-Import Snapshot");
    console.log("===========================================");
    console.log(`  Database Host           : ${dbInfo.host}`);
    console.log(`  Database Name           : ${dbInfo.dbName}`);
    console.log(`  Mode                    : ${isDryRun ? "DRY-RUN (NO WRITES)" : "LIVE EXECUTION"}`);
    console.log(`  Previous Product Count  : ${previousProductCount}`);
    console.log(`  Categories Found        : ${allCategories.length}`);
    console.log(`  Molecules Found         : ${allMolecules.length}`);
    console.log("===========================================\n");

    // ── 4. Process every file and sheet ──────────────────────────────────
    for (const fileItem of filesToProcess) {
      logger.info(`[PROCESSING FILE] ${path.basename(fileItem)}`);
      let parsedWorkbook;
      try {
        parsedWorkbook = readProductExcel(fileItem);
      } catch (fErr) {
        logger.error(`Failed to read file ${fileItem}: ${fErr.message}`);
        skippedInvalidList.push({ file: path.basename(fileItem), row: 0, reason: `File error: ${fErr.message}` });
        skippedInvalid++;
        continue;
      }

      const sheets = parsedWorkbook.allSheets || [{ sheetName: parsedWorkbook.sheetName, data: parsedWorkbook.data }];

      for (const sheetObj of sheets) {
        const { sheetName, data } = sheetObj;
        logger.info(`  Sheet "${sheetName}": ${data.length} row(s)`);

        for (let i = 0; i < data.length; i++) {
          totalXlsxRows++;
          const row = data[i];
          const rowNum = i + 2;

          // Track detected column headers
          Object.keys(row).forEach((k) => detectedColumns.add(k));

          try {
            // STEP 1: Read row & Extract product name
            const rawName = getVal(row, [
              "PRODUCT NAME",
              "Product Name",
              "Name",
              "name",
              "product_name",
            ]);

            if (!rawName || toString(rawName).length === 0) {
              const reason = `Row ${rowNum} in ${path.basename(fileItem)}: Skipped [Missing Required Fields] — Product Name is empty.`;
              logger.warn(reason);
              skippedInvalidList.push({ file: path.basename(fileItem), row: rowNum, reason: "Product Name is empty" });
              skippedInvalid++;
              continue;
            }

            const name = toString(rawName);
            const nameLower = name.toLowerCase().trim();

            // STEP 2: Extract price and validate
            const sellingPrice = toNumber(getVal(row, ["Selling Price (₹)", "Selling Price", "Price", "price"]), 0);
            const mrp = toNumber(getVal(row, ["MRP (₹)", "MRP", "mrp", "Original Price", "originalPrice"]), 0);

            const finalPrice = sellingPrice > 0 ? sellingPrice : mrp;
            const finalOriginalPrice = mrp > 0 ? mrp : finalPrice;

            if (finalPrice <= 0 && finalOriginalPrice <= 0) {
              const reason = `Row ${rowNum}: Skipped [Invalid Price] — "${name}" has no valid selling price or MRP.`;
              logger.warn(reason);
              skippedInvalidList.push({ file: path.basename(fileItem), row: rowNum, name, reason: "Invalid Price" });
              skippedInvalid++;
              continue;
            }

            // STEP 3 & 4: Check if product already exists (CRITICAL DUPLICATE RULE)
            const rawSku = getVal(row, ["SKU", "sku", "Sku", "Product SKU"]);
            const sku = rawSku ? toString(rawSku) : undefined;

            if (existingNamesMap.has(nameLower)) {
              logger.warn(`Row ${rowNum}: SKIPPED [Duplicate Product] — "${name}" already exists in database.`);
              skippedDuplicatesList.push(name);
              skippedAlreadyExisted++;
              continue;
            }

            if (sku && existingSkus.has(sku.toLowerCase().trim())) {
              logger.warn(`Row ${rowNum}: SKIPPED [Duplicate SKU] — "${name}" [SKU: ${sku}] already exists.`);
              skippedDuplicatesList.push(`${name} (SKU: ${sku})`);
              skippedAlreadyExisted++;
              continue;
            }

            // Slug uniqueness check
            const rawSlug = getVal(row, [
              "URL Custom Slug",
              "URL Slug",
              "Slug",
              "slug",
              "url_slug",
            ]);
            let baseSlug = rawSlug
              ? toString(rawSlug).replace(/^\/+/, "")
              : name;
            baseSlug = baseSlug.toLowerCase().trim().replace(/[\s\-_]+/g, "-").replace(/[^\w\-]+/g, "").replace(/\-\-+/g, "-");
            if (!baseSlug) baseSlug = name.toLowerCase().trim().replace(/[\s\-_]+/g, "-").replace(/[^\w\-]+/g, "");

            const finalSlug = uniqueSlug(baseSlug, existingSlugs);

            // Resolve Category
            let categoryId = null;
            const {
              found: catColFound,
              columnKey: catColKey,
              rawValue: catColValue,
            } = detectCategoryColumn(row);

            if (catColFound && catColValue.length > 0) {
              const directId = categoryMap.get(catColValue.toLowerCase().trim()) || null;
              if (directId) {
                categoryId = directId;
              } else {
                const lowerVal = catColValue.toLowerCase().trim();
                for (const [existingCatName, existingId] of categoryMap.entries()) {
                  if (existingCatName.includes(lowerVal) || lowerVal.includes(existingCatName)) {
                    categoryId = existingId;
                    break;
                  }
                }
              }
            }

            if (!categoryId) {
              const { categoryId: inferredId } = inferCategoryFromContent(row, categoryMap, allCategories);
              if (inferredId) categoryId = inferredId;
            }

            if (!categoryId) {
              let defaultCatId = categoryMap.get("infectious disease care") || categoryMap.get("transplant care") || categoryMap.get("prescription");
              if (defaultCatId) {
                categoryId = defaultCatId;
              } else {
                const reason = `Row ${rowNum}: Skipped [Missing Category] — Category for "${name}" could not be resolved.`;
                logger.error(reason);
                skippedInvalidList.push({ file: path.basename(fileItem), row: rowNum, name, reason: "Missing Category" });
                skippedInvalid++;
                continue;
              }
            }

            // Resolve Molecules
            const rawMolecules = getVal(row, [
              "Active Ingredient",
              "Associated Molecules",
              "Molecules",
              "molecules",
              "Molecule",
              "Generic Name",
            ]);

            const moleculeIds = [];
            if (rawMolecules && toString(rawMolecules).length > 0) {
              moleculeFieldsMapped++;
              const rawIngStr = toString(rawMolecules);
              detectedMolecules.add(rawIngStr);

              const ingredients = rawIngStr.split(/[\+\/,]+/).map((s) => s.trim()).filter(Boolean);

              for (const ingName of ingredients) {
                const normDirect = ingName.toLowerCase().trim();
                let mId = moleculeMap.get(normDirect);

                const cleanedName = extractBaseMoleculeName(ingName);
                if (!mId && cleanedName) {
                  mId = moleculeMap.get(cleanedName.toLowerCase().trim());
                }

                // If molecule doesn't exist in DB, create it (if live execution) or simulate (if dry-run)
                if (!mId && cleanedName) {
                  const molSlug = uniqueSlug(
                    cleanedName.toLowerCase().replace(/[\s\-_]+/g, "-").replace(/[^\w\-]+/g, ""),
                    moleculeSlugSet
                  );
                  const molLetter = cleanedName.charAt(0).toUpperCase();

                  if (!isDryRun) {
                    try {
                      const newMol = await Molecule.create({
                        name: cleanedName,
                        slug: molSlug,
                        letter: molLetter,
                        aliases: [ingName],
                        shortDescription: `Active pharmaceutical ingredient ${cleanedName}.`,
                      });
                      mId = newMol._id;
                      moleculeMap.set(cleanedName.toLowerCase().trim(), mId);
                      moleculeMap.set(normDirect, mId);
                      logger.info(`[CREATED MOLECULE] "${cleanedName}" (_id: ${mId})`);
                    } catch (mErr) {
                      // Handle rare race condition if created concurrently
                      const existingMol = await Molecule.findOne({ name: new RegExp(`^${cleanedName}$`, "i") });
                      if (existingMol) {
                        mId = existingMol._id;
                        moleculeMap.set(cleanedName.toLowerCase().trim(), mId);
                      }
                    }
                  }
                }

                if (mId) {
                  moleculeIds.push(mId);
                }
              }
            }

            // Resolve Specialities
            const rawSpecialities = getVal(row, ["Specialities", "Speciality", "Medical Speciality"]);
            const specialityIds = [];
            if (rawSpecialities) {
              const specNames = toArray(rawSpecialities, /[;,]+/);
              for (const sName of specNames) {
                const sId = specialityMap.get(sName.toLowerCase().trim());
                if (sId) specialityIds.push(sId);
              }
            }

            // Parse specifications & manufacturer/marketer
            const rawSpecsText = toString(getVal(row, ["Product Specifications", "Specifications", "specs"]));
            let mfrFromSpecs = "";
            if (rawSpecsText) {
              const mfrMatch = rawSpecsText.match(/(?:Manufacturer|Marketer):\s*(.+?)(?=\n|$)/i);
              if (mfrMatch) mfrFromSpecs = mfrMatch[1].trim();
            }

            const marketer = toString(getVal(row, ["Marketer", "marketer", "Marketed By", "Marketing Company"]));
            if (marketer) {
              marketerFieldsMapped++;
              detectedMarketers.add(marketer);
            }

            let manufacturer = toString(getVal(row, ["Manufacturer", "manufacturer", "Manufacturer Name", "Mfr", "Pharma Company"]));
            if (!manufacturer && mfrFromSpecs) manufacturer = mfrFromSpecs;
            if (!manufacturer && marketer) manufacturer = marketer;
            if (manufacturer) {
              manufacturerFieldsMapped++;
              detectedManufacturers.add(manufacturer);
            }

            if (manufacturer) {
              const norm = manufacturer.toLowerCase().trim();
              if (manufacturerMap.has(norm)) {
                manufacturer = manufacturerMap.get(norm);
              } else {
                manufacturerMap.set(norm, manufacturer);
              }
            }

            let brand = toString(getVal(row, ["Brand", "brand", "Brand Name"]));
            if (!brand && manufacturer) brand = manufacturer;
            if (brand) {
              const norm = brand.toLowerCase().trim();
              if (brandMap.has(norm)) brand = brandMap.get(norm);
              else brandMap.set(norm, brand);
            }

            const country = toString(getVal(row, ["Country", "country", "Country of Origin"]));
            const importedCountry = toString(getVal(row, ["Imported Country", "importedCountry"]));
            const strength = toString(getVal(row, ["Strength", "strength"]));
            const packSize = toString(getVal(row, ["Pack Size", "packSize", "Pack"]));

            const description = toString(
              getVal(row, ["Introduction", "Description", "description", "introduction", "About This Medicine"])
            );
            const image = toString(getVal(row, ["Image", "image", "Image URL", "Main Image"]));
            const rawImages = getVal(row, ["Images", "images", "Image URLs"]);
            const images = rawImages ? toArray(rawImages, /[;,]+/) : [];

            // Rx and Specs
            const requiresRx = toBoolean(
              getVal(row, ["requiresRx", "Requires Rx", "Requires Prescription", "Rx", "Prescription Required"]),
              rawSpecsText.toLowerCase().includes("prescription required: yes") || rawSpecsText.toLowerCase().includes("prescription required: true")
            );
            const isColdChain = toBoolean(
              getVal(row, ["isColdChain", "Is Cold Chain", "Cold Chain"]),
              rawSpecsText.toLowerCase().includes("cold chain product: yes")
            );
            const isPrescriptionRequired = requiresRx;

            // Content Sections (Uses, About, How It Works, etc.)
            const medicalSections = parseMedicalSections(
              {
                title: "About This Medicine",
                rawValue: getVal(row, ["About This Medicine"]),
              },
              {
                title: "Uses",
                rawValue: getVal(row, ["Uses", "uses", "Indications"]),
              },
              {
                title: "How It Works",
                rawValue: getVal(row, ["Effects (How It Works)", "How It Works"]),
              },
              {
                title: "Drug Interactions",
                rawValue: getVal(row, ["Interaction with Other Drugs", "Drug Interactions"]),
              },
              {
                title: "More Information",
                rawValue: getVal(row, ["More Information", "Additional Information"]),
              }
            );

            const usageInstructions = toBulletArray(
              getVal(row, ["Usage & Dosage", "Usage & Dosage Instructions", "Usage Instructions", "Dosage"])
            );

            const storageInstructions = toBulletArray(
              getVal(row, ["Storage", "Storage Instructions"])
            );

            const warnings = toBulletArray(
              getVal(row, ["Clinical Warnings & Precautions", "Warnings", "warnings"])
            );

            const rawCommonSE = getVal(row, ["Common Side Effects", "Side Effects", "sideEffects"]);
            const sideEffects = toBulletArray(rawCommonSE);

            const rawSafetyAdvice = getVal(row, ["Safety Information", "Safety Advice", "Safety Cards"]);
            const safetyCards = parseSafetyCards(rawSafetyAdvice);

            const faqs = parseFAQs(getVal(row, ["FAQs", "Patient FAQs", "faqs"]));
            const specifications = parseSpecifications(rawSpecsText);
            const composition = parseComposition(getVal(row, ["Composition", "Active Ingredient", "Active Ingredients"]));
            const benefits = parseBenefits(getVal(row, ["Key Health Benefits", "Benefits", "Key Benefits"]));
            const imagesData = parseImagesData(getVal(row, ["Images Data", "imagesData"]));
            
            const seo = parseSEO(getVal(row, ["Search Engine Optimization (SEO)", "SEO"]), name);
            const seoTitle = getVal(row, ["SEO Title", "seoTitle"]);
            const metaDesc = getVal(row, ["Meta Description", "metaDescription"]);
            const focusKeyword = getVal(row, ["Focus Keyword", "focusKeyword"]);
            const seoKeywords = getVal(row, ["SEO Keywords", "seoKeywords"]);
            if (seoTitle) seo.metaTitle = toString(seoTitle);
            if (metaDesc) seo.metaDescription = toString(metaDesc);
            if (focusKeyword) seo.focusKeyword = toString(focusKeyword);
            if (seoKeywords) seo.keywords = toString(seoKeywords);

            const productSpecifications = {
              genericName: toString(getVal(row, ["Active Ingredient", "Generic Name", "genericName"])),
              strength: strength,
              dosageForm: toString(getVal(row, ["Dosage Form", "dosageForm"])),
              route: toString(getVal(row, ["Route", "route"])),
              prescription: isPrescriptionRequired ? "Yes" : "No",
              manufacturer: manufacturer || marketer,
              packSize: packSize,
              storage: toString(getVal(row, ["Storage", "storage"])),
              coldChain: isColdChain ? "Yes" : "No",
              productType: "medicine",
            };

            const rawReferences = getVal(row, ["Clinical References", "Medical References / Citations", "References"]);
            const references = rawReferences ? toBulletArray(rawReferences) : [];

            // Assemble new product object
            const newProductData = {
              name,
              slug: finalSlug,
              category: categoryId,
              molecules: moleculeIds,
              specialities: specialityIds,
              manufacturer,
              marketer,
              country,
              importedCountry,
              strength,
              packSize,
              brand,
              price: finalPrice,
              originalPrice: finalOriginalPrice,
              stock: 100,
              inStock: true,
              description,
              image,
              images,
              imagesData,
              requiresRx,
              isColdChain,
              isPrescriptionRequired,
              isNonRefundable: false,
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
              productSpecifications,
              sku: sku ? sku : `WM-${finalSlug.toUpperCase()}`,
            };

            if (!isDryRun) {
              // CREATE NEW PRODUCT (LIVE)
              const createdDoc = await Product.create(newProductData);
              existingNamesMap.set(nameLower, createdDoc);
              existingSlugs.add(finalSlug.toLowerCase().trim());
              if (newProductData.sku) existingSkus.add(newProductData.sku.toLowerCase().trim());
              logger.success(`[ADDED] ${name}`);
            } else {
              // DRY-RUN (SIMULATION ONLY)
              existingNamesMap.set(nameLower, true);
              existingSlugs.add(finalSlug.toLowerCase().trim());
              if (newProductData.sku) existingSkus.add(newProductData.sku.toLowerCase().trim());
              logger.info(`[DRY-RUN WOULD ADD] ${name}`);
            }

            successfullyAdded++;
            newProductsSummaryList.push({ name, slug: finalSlug, price: finalPrice, marketer, categoryId });

          } catch (rowErr) {
            const msg = `Row ${rowNum} in ${path.basename(fileItem)}: Failed unexpected error — ${rowErr.message}`;
            logger.error(`[ERROR] ${msg}`);
            skippedInvalidList.push({ file: path.basename(fileItem), row: rowNum, reason: rowErr.message });
            failedUnexpectedly++;
          }
        }
      }
    }

  } catch (fatalErr) {
    logger.error("[FATAL ERROR] Import interrupted:", fatalErr);
    failedUnexpectedly++;
  } finally {
    // Post-import count check
    let finalProductCount = previousProductCount;
    try {
      if (!isDryRun) {
        finalProductCount = await Product.countDocuments();
      } else {
        finalProductCount = previousProductCount + successfullyAdded;
      }
    } catch (e) {
      finalProductCount = previousProductCount + successfullyAdded;
    }

    console.log("\n==========================================================");
    console.log(`WELLMEDS PRODUCT IMPORT REPORT — ${isDryRun ? "DRY-RUN SUMMARY" : "FINAL EXECUTION"}`);
    console.log("==========================================================");
    console.log(`Execution Mode                 : ${isDryRun ? "DRY-RUN (READ-ONLY)" : "LIVE DATABASE UPDATE"}`);
    console.log(`XLSX rows processed            : ${totalXlsxRows}`);
    console.log(`Valid rows                     : ${totalXlsxRows - skippedInvalid}`);
    console.log(`Existing products (skipped)    : ${skippedAlreadyExisted}`);
    console.log(`Products to be skipped         : ${skippedAlreadyExisted + skippedInvalid}`);
    console.log(`Genuinely NEW products         : ${successfullyAdded}`);
    console.log(`Invalid rows                   : ${skippedInvalid}`);
    console.log(`Unexpected failures            : ${failedUnexpectedly}`);
    console.log("----------------------------------------------------------");
    console.log(`Previous DB Product Count      : ${previousProductCount}`);
    console.log(`New Products ${isDryRun ? "To Add" : "Added"}           : ${successfullyAdded}`);
    console.log(`Final DB Product Count         : ${finalProductCount}`);
    console.log("----------------------------------------------------------");
    console.log(`XLSX Columns Detected (${detectedColumns.size})    : ${Array.from(detectedColumns).join(", ")}`);
    console.log(`XLSX Columns Fully Mapped      : ${detectedColumns.size} of ${detectedColumns.size} (100%)`);
    console.log(`Molecule fields mapped         : ${moleculeFieldsMapped}`);
    console.log(`Unique Molecules detected      : ${detectedMolecules.size}`);
    console.log(`Marketer fields mapped         : ${marketerFieldsMapped}`);
    console.log(`Unique Marketers detected     : ${detectedMarketers.size}`);
    console.log(`Manufacturer fields mapped     : ${manufacturerFieldsMapped}`);
    console.log(`Unique Manufacturers detected  : ${detectedManufacturers.size}`);
    console.log("==========================================================\n");

    if (skippedDuplicatesList.length > 0) {
      console.log(`Skipped duplicates (${skippedDuplicatesList.length} total):`);
      skippedDuplicatesList.slice(0, 10).forEach((dupName, index) => {
        console.log(`  ${index + 1}. ${dupName}`);
      });
      if (skippedDuplicatesList.length > 10) {
        console.log(`  ... and ${skippedDuplicatesList.length - 10} more duplicates skipped.`);
      }
      console.log("\n");
    }

    if (skippedInvalidList.length > 0) {
      console.log(`Skipped invalid rows (${skippedInvalidList.length} total):`);
      skippedInvalidList.forEach((inv, index) => {
        console.log(`  ${index + 1}. [${inv.file} Row ${inv.row}] ${inv.name ? `"${inv.name}": ` : ""}${inv.reason}`);
      });
      console.log("\n");
    }

    logger.info("Disconnecting from database…");
    await disconnectDB();
    logger.success("Database connection closed cleanly.");
    process.exit(failedUnexpectedly > 0 && successfullyAdded === 0 ? 1 : 0);
  }
};

run();
