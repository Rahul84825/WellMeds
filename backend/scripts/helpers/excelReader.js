import xlsx from "xlsx";
import path from "path";
import fs from "fs";

export const readExcelFile = (customPath) => {
  let filePath = customPath;
  if (!filePath) {
    const possiblePaths = [
      path.resolve("scripts/data/wellmeds-molecules.xlsx"),
      path.resolve("scripts/data/wellmeds molecules list.xlsx"),
      path.resolve("backend/scripts/data/wellmeds-molecules.xlsx"),
      path.resolve("backend/scripts/data/wellmeds molecules list.xlsx"),
      path.resolve("../scripts/data/wellmeds-molecules.xlsx"),
      path.resolve("../scripts/data/wellmeds molecules list.xlsx"),
      path.resolve("backend/scripts/data/wellmeds-molecules.xlsx"),
    ];
    for (const p of possiblePaths) {
      if (fs.existsSync(p)) {
        filePath = p;
        break;
      }
    }
  }

  if (!filePath || !fs.existsSync(filePath)) {
    throw new Error("Excel molecules list file not found in scripts/data/ directory.");
  }

  const workbook = xlsx.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  return {
    sheetName,
    data: xlsx.utils.sheet_to_json(worksheet)
  };
};
