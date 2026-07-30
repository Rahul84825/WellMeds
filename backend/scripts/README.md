# WellMeds – Import & Enrichment Utilities

Three production-grade utilities for safely managing Molecule and Product data in MongoDB from Excel files.
All utilities are **non-destructive** — they never drop, truncate, or remove existing documents.

---

## Folder Structure

```
backend/
└── scripts/
    ├── README.md                      # This documentation
    ├── importMolecules.js             # Molecule Import Utility
    ├── importProducts.js              # Product Import Utility  ← NEW
    ├── data/
    │   ├── wellmeds molecules list.xlsx   # Molecule source file
    │   └── Product_Template.xlsx          # Product source file
    └── helpers/
        ├── db.js                      # Shared: MongoDB connection & teardown
        ├── excelReader.js             # Shared: molecule Excel reader
        ├── productExcelReader.js      # Product Excel reader      ← NEW
        ├── logger.js                  # Shared: coloured terminal logger
        ├── slugify.js                 # Shared: URL slug generator
        └── parser.js                  # Product data parser       ← NEW
```

---

## 1 — Molecule Import Utility

### Purpose
- Bulk import active pharmaceutical ingredients (molecules) from Excel.
- Skips duplicates by name and slug (case-insensitive).
- Auto-generates slugs, letter index and SEO metadata.

### How to Run
```bash
# From backend/ directory
npm run import:molecules

# Or directly
node scripts/importMolecules.js
```

### Excel Format
Place the file at `backend/scripts/data/wellmeds-molecules.xlsx`.

| Column       | Description           |
|--------------|-----------------------|
| Generic Name | Molecule display name |
| URL Slug     | Optional custom slug  |

---

## 2 — Molecule Enrichment Utility  (NON-DESTRUCTIVE MERGE)

### Purpose
- Merges additional molecule content from an Excel file into **existing** MongoDB documents.
- Never deletes, drops, recreates, or duplicates any molecule.
- Existing `_id`, `slug`, `category`, `createdAt`, `relatedMolecules` are **always preserved**.
- Blank Excel cells are silently skipped — existing DB values are never overwritten with empty.
- Inserts genuinely new molecules (not found in DB) as brand-new documents.

### How to Run
```bash
# From backend/ directory
npm run enrich:molecules

# Or directly
node scripts/enrichMolecules.js
```

### Excel File
Place the file at `backend/scripts/data/WellMeds MOLECULES PART 1.xlsx`.

### Column Mapping

| Excel Column                                  | Molecule Field            | Behaviour               |
|-----------------------------------------------|---------------------------|-------------------------|
| `Generic Name` / `Name` / `Molecule Name`     | `name` (match key)        | Required for every row  |
| `Description` / `Introduction`                | `description`             | Set if non-empty        |
| `Short Description`                           | `shortDescription`        | Set if non-empty        |
| `Uses`                                        | `uses`                    | Set if non-empty        |
| `Benefits`                                    | `benefits`                | Set if non-empty        |
| `How It Works` / `Mechanism`                  | `howItWorks`              | Set if non-empty        |
| `Dosage` / `Dosage & Administration`          | `dosage`                  | Set if non-empty        |
| `Side Effects` / `Common Side Effects`        | `sideEffects`             | Set if non-empty        |
| `Warnings`                                    | `warnings`                | Set if non-empty        |
| `Precautions`                                 | `precautions`             | Set if non-empty        |
| `Storage`                                     | `storage`                 | Set if non-empty        |
| `Aliases` / `Other Names`                     | `aliases[]`               | Append-unique           |
| `FAQs` / `Patient FAQs`                       | `faqs[]`                  | Set only if DB is empty |
| `References` / `Medical References`           | `references[]`            | Append-unique           |
| `Meta Title` / `SEO Title`                    | `seo.metaTitle`           | Set if non-empty        |
| `Meta Description`                            | `seo.metaDescription`     | Set if non-empty        |
| `Focus Keyword`                               | `seo.focusKeyword`        | Set if non-empty        |
| `OG Title` / `Open Graph Title`               | `seo.openGraphTitle`      | Set if non-empty        |
| `OG Description`                              | `seo.openGraphDescription`| Set if non-empty        |
| `Search Tags`                                 | `seo.searchTags[]`        | Set if non-empty        |
| `SEO Keywords` / `Keywords`                   | `seo.seoKeywords[]`       | Set if non-empty        |

### Safety Guarantees
- **NO** `deleteMany`, `deleteOne`, `drop`, `remove`, `truncate`, `findOneAndReplace`, or `replaceOne` calls.
- `_id`, `slug`, `letter`, `createdAt`, and `relatedMolecules` are **never patched** on existing documents.
- A pre/post import count check confirms no documents were deleted.
- Per-row audit log shows exactly which fields were updated or skipped.

---

## 3 — Product Import Utility  (ADD ONLY)

### Purpose
- Bulk import products from a client-supplied Excel template.
- Resolves all references: **Category**, **Molecules**, **Specialities**, **SurgicalCategory**, **Related Products**.
- Skips duplicates by **Product Name**, **Slug**, and **SKU**.
- Generates SEO metadata, safety cards, FAQs, composition, benefits and more.
- **Never** modifies, deletes, or overwrites any existing product or relationship.

### How to Run
```bash
# From backend/ directory
npm run import:products

# Or directly
node scripts/importProducts.js
```

### Changing the Excel Filename
Open `scripts/importProducts.js` and update line:
```js
const PRODUCT_EXCEL_FILENAME = "Product_Template.xlsx";
```

Place the new Excel file at `backend/scripts/data/<your-filename>.xlsx`.

### Excel Column Mapping

| Excel Column                          | Product Field(s)                       |
|---------------------------------------|----------------------------------------|
| PRODUCT NAME                          | `name`                                 |
| URL Custom Slug                       | `slug` (auto-generated if missing)     |
| Manufacturer                          | `manufacturer`                         |
| Category                              | `category` (resolved to ObjectId)      |
| Associated Molecules                  | `molecules[]` (resolved to ObjectIds)  |
| Specialities                          | `specialities[]` (resolved)            |
| Surgical Category                     | `surgicalCategory` (resolved)          |
| Introduction / Description            | `description`                          |
| Uses                                  | `medicalSections[Uses]`                |
| Effects (How It Works)                | `medicalSections[How It Works]`        |
| Interaction with Other Drugs          | `medicalSections[Drug Interactions]`   |
| More Information                      | `medicalSections[More Information]`    |
| Usage & Dosage Instructions           | `usageInstructions[]`                  |
| Storage Instructions                  | `storageInstructions[]`                |
| Warnings                              | `warnings[]`                           |
| Common Side Effects                   | `sideEffects[]`                        |
| Serious Side Effects                  | `sideEffects[]` (appended)             |
| Safety Advice                         | `safetyCards[]`                        |
| Safety Information Cards              | `safetyCards[]` (appended)             |
| Patient FAQs                          | `faqs[]`                               |
| Composition                           | `composition[]`                        |
| Benefits                              | `benefits[]`                           |
| Specifications                        | `specifications[]`                     |
| Images Data                           | `imagesData[]`                         |
| Search Engine Optimization (SEO)      | `seo` (metaTitle, metaDescription, …)  |
| Medical References / Citations        | `references[]`                         |
| Related Products                      | `relatedProducts[]` (resolved)         |
| Price / MRP                           | `price`                                |
| Original Price                        | `originalPrice`                        |
| Stock / Quantity                      | `stock`                                |
| SKU                                   | `sku`                                  |
| Badge                                 | `badge`                                |
| Product Type                          | `productType` (medicine/wellness)      |
| requiresRx / Requires Rx              | `requiresRx`                           |
| isColdChain / Cold Chain              | `isColdChain`                          |
| isPrescriptionRequired                | `isPrescriptionRequired`               |
| isImported / Is Imported              | `isImported`                           |
| isSurgical / Is Surgical              | `isSurgical`                           |
| inStock / In Stock                    | `inStock`                              |
| Display Order                         | `displayOrder`                         |
| Similar Medicine Priority             | `similarMedicinePriority`              |
| Medicine Category                     | `medicineCategory`                     |
| Molecule Slug                         | `moleculeSlug`                         |

### Expected Output

```
=== WellMeds Product Import Utility  (ADD ONLY) ===

i Connecting to MongoDB…
✓ [CONNECTED] MongoDB Connected
i [READ] Reading Excel…
✓ [READ] Sheet "Products" loaded — 20 data row(s) found.
i Pre-loading reference collections…
✓ Reference data loaded: 7 categories, 251 molecules, 1 specialities, 6 surgical categories.
✓ Existing products in DB: 13 (all will be preserved).
i [ROW] Processing: Bevatas 400mg Injection
  [CATEGORY] Matched: Oncology
  [MOLECULE] Matched: Bevacizumab
⚠ [WARNING] Unknown Molecule: "SomeDrug"
✓ [INSERTED] Bevatas 400mg Injection
⚠ [SKIPPED] Product already exists (name match): Herceptin 440mg

===========================================
  Import Completed
===========================================
  Imported : 18
  Skipped  : 2
  Warnings : 1
  Errors   : 0
  Time     : 4.2s
===========================================

i Disconnecting from database…
✓ Database connection closed.
```

### Duplicate Detection Logic

Before inserting, the importer checks:
1. **Product Name** — case-insensitive match
2. **Slug** — exact match
3. **SKU** — exact match (if provided)

If any match is found, the row is **skipped** and logged — never overwritten.

---

## Troubleshooting

| Error | Resolution |
|-------|-----------|
| Excel file not found | Check `backend/scripts/data/` contains the file named exactly as configured in `PRODUCT_EXCEL_FILENAME` |
| Unknown Category / Molecule / Speciality | The referenced name does not exist in MongoDB. Create it first or check spelling. |
| Database Connection Failure | Ensure `.env` has a valid `MONGODB_URI` pointing to Atlas or local MongoDB |
| Validation Errors | Per-row errors are caught and logged. The import continues with remaining rows. |
| Product skipped unexpectedly | Check if the product already exists in the DB (name, slug, or SKU match) |

---

> **Safety guarantee**: Both importers are strictly `INSERT` utilities. They contain no `deleteOne`, `deleteMany`, `findOneAndReplace`, `drop`, `remove`, or bulk-delete operations anywhere in their codebase.
