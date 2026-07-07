# WellMeds – Production Molecule Import Utility

This utility facilitates the safe, production-ready import of active pharmaceutical ingredients (molecules) from an Excel spreadsheet directly into the WellMeds MongoDB instance. 

---

## Purpose
- Automate import of 200+ clinical molecules into the database.
- Keep production data 100% safe by skipping existing molecules (case-insensitive name & slug matching).
- Automatically generate required fields: URL slugs, uppercase starting alphabetical index letter, and default SEO optimization metadata.

---

## Folder Structure
```
backend/
└── scripts/
    ├── README.md                 # This documentation
    ├── importMolecules.js        # Main execution driver script
    ├── data/
    │   └── wellmeds-molecules.xlsx # Spreadsheet containing clinical molecules data
    └── helpers/
        ├── db.js                 # Safe Mongoose connection setup & teardown
        ├── excelReader.js        # Parses Excel sheets using the `xlsx` library
        ├── logger.js             # Colored terminal outputs for execution progress
        └── slugify.js            # Automatically structures safe web URL slugs
```

---

## Prerequisites
The utility uses the `xlsx` library to parse spreadsheets:
```bash
npm install xlsx
```
*(This package has been pre-configured in `package.json` dependencies).*

---

## How to Run
Run the importer script using NPM:
```bash
npm run import:molecules
```
Or run the file directly with node inside the `backend` folder:
```bash
node scripts/importMolecules.js
```

---

## Expected Output
During execution, the script will output colorized results indicating whether rows were imported, skipped, or failed:

```
=== WellMeds Molecule Import Utility ===

i Connecting to MongoDB database...
✓ Database connected successfully.
i Reading Excel sheet...
✓ Read sheet "Life Saving Molecules" containing 248 rows.
i Fetching existing molecules from database to avoid duplicate queries...
✓ Found 5 existing molecules in database.
⚠ Skipped: Molecule "Imatinib" already exists in database.
✓ Inserted: Molecule "Paracetamol"
✗ Failed: Molecule "Aspirin" - Validation error details...

=================================
Import Finished
Inserted: 243
Skipped: 5
Failed: 0
Execution Time: 1.45s
=================================

i Disconnecting from database...
✓ Database connection closed.
```

---

## Troubleshooting
- **Missing File Error**: If you see an error saying the Excel file is not found, verify the spreadsheet is present at `backend/scripts/data/wellmeds-molecules.xlsx` (or named `wellmeds molecules list.xlsx`).
- **Database Connection Failure**: Ensure your `.env` contains a valid `MONGODB_URI` definition matching your MongoDB Atlas or local deployment connection string.
- **Validation Errors**: The importer handles individual row validation errors without stopping execution. Any failed rows will be summarized in the output report.
