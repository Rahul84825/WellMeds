/**
 * productExcelReader.js
 * ─────────────────────────────────────────────────────────────────────────────
 * WellMeds Product Import Utility – Excel Reader
 *
 * Locates and parses the product Excel file from the scripts/data/ directory.
 * Kept separate from the shared excelReader.js so that product-specific
 * filename defaults do not pollute the Molecule Import Utility.
 *
 * Supported filename (configure in importProducts.js):
 *   Product_Template.xlsx  (default)
 *
 * The reader:
 *  - Tries several path resolutions so it works whether the script is run
 *    from the backend/ directory or the project root.
 *  - Reads the first worksheet that contains data rows.
 *  - Skips completely blank sheets.
 *  - Trims all string cell values before returning.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import xlsx from "xlsx";
import path from "path";
import fs from "fs";

/**
 * Locate and parse a product Excel file.
 *
 * @param {string} [filename="Product_Template.xlsx"]  File name inside data/
 * @returns {{ sheetName: string, data: object[] }}
 *   sheetName – name of the worksheet that was parsed
 *   data      – array of row objects (header row used as keys)
 */
/**
 * Locate and parse a product Excel file or custom file path.
 */
export const readProductExcel = (filePathOrName) => {
  let filePath = filePathOrName;

  if (!fs.existsSync(filePath)) {
    // Candidate paths
    const candidates = [
      path.resolve("data/import", filePathOrName),
      path.resolve("../data/import", filePathOrName),
      path.resolve("backend/scripts/data", filePathOrName),
      path.resolve("scripts/data", filePathOrName),
      path.resolve("../scripts/data", filePathOrName),
    ];

    for (const candidate of candidates) {
      if (fs.existsSync(candidate)) {
        filePath = candidate;
        break;
      }
    }
  }

  if (!fs.existsSync(filePath)) {
    throw new Error(`Product Excel file "${filePathOrName}" not found.`);
  }

  const workbook = xlsx.readFile(filePath, {
    cellNF: false,
    cellHTML: false,
    type: "file",
  });

  if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
    throw new Error(`The Excel file "${filePathOrName}" contains no sheets.`);
  }

  const results = [];
  for (const sheetName of workbook.SheetNames) {
    const worksheet = workbook.Sheets[sheetName];
    if (!worksheet || !worksheet["!ref"]) continue;

    const rawData = xlsx.utils.sheet_to_json(worksheet, {
      defval: "",
      raw: false,
    });

    const data = rawData
      .filter((row) =>
        Object.values(row).some((v) => String(v).trim().length > 0)
      )
      .map((row) => {
        const cleaned = {};
        for (const [key, value] of Object.entries(row)) {
          cleaned[key.trim()] =
            typeof value === "string" ? value.trim() : value;
        }
        return cleaned;
      });

    if (data.length > 0) {
      results.push({ sheetName, data });
    }
  }

  if (results.length === 0) {
    throw new Error(`All sheets in "${filePathOrName}" were empty.`);
  }

  // Return first sheet data for backward compatibility, plus all sheets info
  return {
    sheetName: results[0].sheetName,
    data: results[0].data,
    allSheets: results,
    filePath,
  };
};

/**
 * Scan data/import and backend/scripts/data for all XLSX files.
 */
export const getImportXlsxFiles = () => {
  const candidateDirs = [
    path.resolve("data/import"),
    path.resolve("../data/import"),
    path.resolve("backend/scripts/data"),
    path.resolve("scripts/data"),
  ];

  const foundFiles = [];
  const seenBasenames = new Set();

  for (const dir of candidateDirs) {
    if (fs.existsSync(dir) && fs.statSync(dir).isDirectory()) {
      const files = fs.readdirSync(dir);
      for (const f of files) {
        if (f.endsWith(".xlsx") && !f.startsWith("~$")) {
          const fullPath = path.join(dir, f);
          const base = f.toLowerCase();
          if (!seenBasenames.has(base)) {
            seenBasenames.add(base);
            foundFiles.push(fullPath);
          }
        }
      }
    }
  }

  return foundFiles;
};

