# Product Category Field Migration Guide

## What Changed?

The `Product.category` field has been converted from a **String** to an **ObjectId reference** to the Category model. This enables:
- ✅ Proper relational queries
- ✅ Automatic population with category data
- ✅ Better data integrity
- ✅ Simplified code and fewer bugs

## Migration Steps

### 1️⃣ Backup Your Data (Important!)

Before running the migration, backup your database:

```bash
# Using MongoDB Atlas CLI or local mongodump
mongodump --uri "mongodb://..." --out ./backup
```

### 2️⃣ Run the Migration Script

Navigate to backend directory and execute:

```bash
cd backend
node migrations/migrateProductCategories.js
```

The script will:
- Connect to your MongoDB
- Find all products with string categories
- Look up the corresponding Category ObjectIds
- Update each product atomically
- Provide a detailed report with any failures

### 3️⃣ Verify the Migration

The script outputs a summary showing:
- ✅ Number of successfully migrated products
- ❌ Any failed migrations with reasons
- 📊 Total valid category references

Example output:
```
📋 Migration Summary:
✓ Successfully migrated: 245 products
✗ Failed: 0 products
✓ Verification: 245/245 products have valid category references
✅ Migration completed successfully!
```

### 4️⃣ Troubleshooting

**Problem: Category not found errors**
- Ensure Category documents exist in the database
- Check that product category names match Category document names exactly (case-sensitive during lookup)
- Verify categories are created with proper `name` and `slug` fields

**Problem: Some products still have old string categories**
- Run the migration again: `node migrations/migrateProductCategories.js`
- It's safe to run multiple times - it skips already-migrated products

**Problem: Connection error**
- Set `MONGODB_URI` in `.env` file or environment variable
- Ensure MongoDB is running and accessible

### 5️⃣ Code Changes Summary

**Files Modified:**
1. `backend/src/models/Product.js` - Changed category type to ObjectId with ref
2. `backend/src/controllers/productController.js` - Updated all queries to use `.populate()` and ObjectId lookups

**Breaking Changes for Frontend/API:**
- Category filter now uses ObjectIds or category slugs instead of names
- Product responses now include full category objects (not just strings) when fetching

### 6️⃣ Frontend Updates (If Needed)

If your frontend was using category strings directly:

**Before:**
```javascript
product.category = "Medicines"  // String
```

**After:**
```javascript
product.category = {            // Object
  _id: "507f1f77bcf86cd799439011",
  name: "Medicines",
  slug: "medicines"
}
```

Update filtering logic if necessary:
```javascript
// Filter by category slug (recommended)
// API will now accept: ?category=medicines
```

### 7️⃣ Rollback (If Needed)

If something goes wrong and you need to rollback:

1. Restore from your MongoDB backup
2. Run `npm restart` or restart the backend server
3. No code rollback needed - new code is backward compatible

## Migration Success Checklist

- [ ] Database backup created
- [ ] Migration script executed successfully
- [ ] No failed products reported
- [ ] All products have valid category references
- [ ] Product API queries return full category objects
- [ ] Frontend components handle new category object structure (if applicable)
- [ ] Tests pass with new category references

## Support

If issues persist:
1. Check MongoDB connection in `.env`
2. Verify Category documents exist and have proper `name` and `slug` fields
3. Review migration script output for specific failed products
4. Check backend logs for any errors

## Next Steps

After successful migration:
- ✅ Category-based filtering will work more reliably
- ✅ Product queries will be more efficient
- ✅ Data relationships will be automatically maintained
- ✅ Admin dashboard will have better category management
