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
export const readProductExcel = (filename = "Product_Template.xlsx") => {
  // ── Candidate paths (resolved at runtime for CWD flexibility) ────────────
  const candidates = [
    path.resolve("scripts/data", filename),
    path.resolve("backend/scripts/data", filename),
    path.resolve("../scripts/data", filename),
  ];

  let filePath = null;
  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      filePath = candidate;
      break;
    }
  }

  if (!filePath) {
    throw new Error(
      `Product Excel file "${filename}" not found.\n` +
        `Searched in:\n` +
        candidates.map((c) => `  ${c}`).join("\n") +
        `\n\nPlease place the Excel file at: backend/scripts/data/${filename}`
    );
  }

  // ── Parse workbook ────────────────────────────────────────────────────────
  const workbook = xlsx.readFile(filePath, {
    cellNF: false,   // skip number format info
    cellHTML: false, // skip HTML strings
    type: "file",
  });

  if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
    throw new Error(`The Excel file "${filename}" contains no sheets.`);
  }

  // ── Find the first sheet that contains actual data rows ───────────────────
  for (const sheetName of workbook.SheetNames) {
    const worksheet = workbook.Sheets[sheetName];
    if (!worksheet || !worksheet["!ref"]) continue; // completely blank sheet

    const rawData = xlsx.utils.sheet_to_json(worksheet, {
      defval: "",      // return "" for empty cells instead of undefined
      raw: false,      // convert all values to their formatted string
    });

    // Filter out rows that are entirely empty after trimming
    const data = rawData
      .filter((row) =>
        Object.values(row).some((v) => String(v).trim().length > 0)
      )
      .map((row) => {
        // Trim every string value in the row
        const cleaned = {};
        for (const [key, value] of Object.entries(row)) {
          cleaned[key.trim()] =
            typeof value === "string" ? value.trim() : value;
        }
        return cleaned;
      });

    if (data.length > 0) {
      return { sheetName, data };
    }
  }

  throw new Error(
    `The Excel file "${filename}" was read successfully but all sheets were empty.`
  );
};
