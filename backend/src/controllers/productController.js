import { Product } from "../models/Product.js";
import { Category } from "../models/Category.js";
import { MedicalSpeciality } from "../models/MedicalSpeciality.js";
import { Molecule } from "../models/Molecule.js";
import { SurgicalCategory } from "../models/SurgicalCategory.js";
import slugify from "slugify";
import mongoose from "mongoose";

const escapeRegex = (str) => (str || "").replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");

export const getProducts = async (req, res, next) => {
  const {
    search,
    category,
    speciality,
    molecule,
    brand,
    page,
    limit,
    productType,
    isSurgical,
    surgicalCategory,
    isGLP1Medicine,
    isHealthSupplement,
    isBestSeller,
    stock,
    inStock,
    rx,
    requiresRx,
    sortBy,
    sort,
  } = req.query;

  try {
    const andConditions = [];

    // Search query across name, brand, manufacturer, description
    if (search && search.trim()) {
      const q = escapeRegex(search.trim());
      andConditions.push({
        $or: [
          { name: { $regex: q, $options: "i" } },
          { brand: { $regex: q, $options: "i" } },
          { manufacturer: { $regex: q, $options: "i" } },
          { description: { $regex: q, $options: "i" } },
        ],
      });
    }

    // Filter by Brand / Manufacturer
    if (brand && brand.trim()) {
      const b = escapeRegex(brand.trim());
      andConditions.push({
        $or: [
          { brand: { $regex: `^${b}$`, $options: "i" } },
          { manufacturer: { $regex: `^${b}$`, $options: "i" } },
        ],
      });
    }

    // Robust Category Filtering (matches ObjectId, Category doc slug/name, or raw category string/therapeutics)
    if (category && category.trim() && category.trim() !== "All") {
      const catStr = category.trim();
      const isObjId = mongoose.Types.ObjectId.isValid(catStr);

      const slugVariant1 = slugify(catStr, { lower: true });
      const slugVariant2 = catStr.toLowerCase().replace(/\s+/g, "-");
      const nameVariant = catStr.replace(/-/g, " ");

      const categoryOr = [
        { slug: slugVariant1 },
        { slug: slugVariant2 },
        { name: { $regex: `^${escapeRegex(catStr)}$`, $options: "i" } },
        { name: { $regex: `^${escapeRegex(nameVariant)}$`, $options: "i" } },
      ];
      if (isObjId) {
        categoryOr.unshift({ _id: catStr });
      }

      const matchedCategories = await Category.find({ $or: categoryOr });
      const matchedIds = matchedCategories.map((c) => c._id);
      if (isObjId) {
        matchedIds.push(new mongoose.Types.ObjectId(catStr));
      }

      const categoryOrConditions = [];
      if (matchedIds.length > 0) {
        categoryOrConditions.push({ category: { $in: matchedIds } });
      }

      categoryOrConditions.push(
        { medicineCategory: { $regex: `^${escapeRegex(catStr)}$`, $options: "i" } },
        { medicineCategory: { $regex: `^${escapeRegex(nameVariant)}$`, $options: "i" } },
        { "productSpecifications.therapeuticCategory": { $regex: `^${escapeRegex(catStr)}$`, $options: "i" } },
        { "productSpecifications.therapeuticCategory": { $regex: `^${escapeRegex(nameVariant)}$`, $options: "i" } }
      );

      andConditions.push({ $or: categoryOrConditions });
    }

    // Speciality Filtering
    if (speciality && speciality.trim()) {
      const specVal = speciality.trim();
      let matchedSpec = null;
      if (mongoose.Types.ObjectId.isValid(specVal)) {
        matchedSpec = await MedicalSpeciality.findById(specVal);
      }
      if (!matchedSpec) {
        matchedSpec = await MedicalSpeciality.findOne({
          $or: [
            { slug: specVal.toLowerCase() },
            { name: { $regex: `^${escapeRegex(specVal)}$`, $options: "i" } },
            { name: { $regex: `^${escapeRegex(specVal.replace(/-/g, " "))}$`, $options: "i" } },
          ],
        });
      }
      if (matchedSpec) {
        andConditions.push({ specialities: matchedSpec._id });
      } else {
        andConditions.push({
          $or: [
            { specialities: specVal },
            { "productSpecifications.therapeuticCategory": { $regex: escapeRegex(specVal), $options: "i" } },
          ],
        });
      }
    }

    // Molecule Filtering
    if (molecule && molecule.trim()) {
      const queryVal = molecule.trim();
      let matchedMolecule = null;
      if (mongoose.Types.ObjectId.isValid(queryVal)) {
        matchedMolecule = await Molecule.findById(queryVal);
      }
      if (!matchedMolecule) {
        matchedMolecule = await Molecule.findOne({
          $or: [
            { slug: queryVal.toLowerCase() },
            { name: { $regex: `^${escapeRegex(queryVal)}$`, $options: "i" } },
            { name: { $regex: `^${escapeRegex(queryVal.replace(/-/g, " "))}$`, $options: "i" } },
          ],
        });
      }
      if (matchedMolecule) {
        andConditions.push({
          $or: [
            { molecules: matchedMolecule._id },
            { moleculeSlug: matchedMolecule.slug },
          ],
        });
      } else {
        andConditions.push({
          $or: [
            { molecules: queryVal },
            { moleculeSlug: queryVal.toLowerCase() },
          ],
        });
      }
    }

    // GLP1 Medicine toggle
    if (isGLP1Medicine !== undefined && isGLP1Medicine !== "") {
      andConditions.push({ isGLP1Medicine: isGLP1Medicine === "true" });
    }

    // Health Supplement toggle
    if (isHealthSupplement !== undefined && isHealthSupplement !== "") {
      andConditions.push({ isHealthSupplement: isHealthSupplement === "true" });
    }

    // Best Seller toggle
    if (isBestSeller !== undefined && isBestSeller !== "") {
      if (isBestSeller === "true") {
        andConditions.push({
          $or: [{ isBestSeller: true }, { isHealthSupplement: true }],
        });
      } else {
        andConditions.push({ isBestSeller: false });
      }
    }

    // Product Type filter
    if (productType) {
      andConditions.push({ productType });
    }

    // Surgical flag filter
    if (isSurgical !== undefined && isSurgical !== "") {
      andConditions.push({ isSurgical: isSurgical === "true" });
    }

    // Surgical Category filter
    if (surgicalCategory && surgicalCategory.trim()) {
      const scVal = surgicalCategory.trim();
      let matchedSurg = null;
      if (mongoose.Types.ObjectId.isValid(scVal)) {
        matchedSurg = await SurgicalCategory.findById(scVal);
      }
      if (!matchedSurg) {
        matchedSurg = await SurgicalCategory.findOne({
          $or: [
            { slug: scVal.toLowerCase() },
            { name: { $regex: `^${escapeRegex(scVal)}$`, $options: "i" } },
            { name: { $regex: `^${escapeRegex(scVal.replace(/-/g, " "))}$`, $options: "i" } },
          ],
        });
      }
      if (matchedSurg) {
        andConditions.push({ surgicalCategory: matchedSurg._id });
      } else {
        andConditions.push({ surgicalCategory: scVal });
      }
    }

    // Stock Filter
    const stockParam = stock || inStock;
    if (stockParam && stockParam !== "All" && stockParam !== "") {
      if (stockParam === "instock" || stockParam === "true") {
        andConditions.push({
          $and: [
            { inStock: { $ne: false } },
            { stock: { $gt: 0 } },
          ],
        });
      } else if (stockParam === "out" || stockParam === "false") {
        andConditions.push({
          $or: [
            { inStock: false },
            { stock: { $lte: 0 } },
            { stock: null },
          ],
        });
      }
    }

    // Prescription Filter
    const rxParam = rx || requiresRx;
    if (rxParam && rxParam !== "All" && rxParam !== "") {
      if (rxParam === "yes" || rxParam === "true") {
        andConditions.push({
          $or: [{ requiresRx: true }, { isPrescriptionRequired: true }],
        });
      } else if (rxParam === "no" || rxParam === "false") {
        andConditions.push({
          requiresRx: { $ne: true },
          isPrescriptionRequired: { $ne: true },
        });
      }
    }

    const query = andConditions.length > 0 ? { $and: andConditions } : {};

    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.max(1, Math.min(parseInt(limit) || 20, 1000));
    const skipNum = (pageNum - 1) * limitNum;

    // Server-side sorting
    const sortVal = sortBy || sort || "name-asc";
    const sortObj = {};
    if (sortVal === "price_asc" || sortVal === "price-asc") sortObj.price = 1;
    else if (sortVal === "price_desc" || sortVal === "price-desc") sortObj.price = -1;
    else if (sortVal === "name_desc" || sortVal === "name-desc") sortObj.name = -1;
    else if (sortVal === "stock-asc" || sortVal === "stock_asc") { sortObj.inStock = 1; sortObj.stock = 1; }
    else if (sortVal === "stock-desc" || sortVal === "stock_desc") { sortObj.inStock = -1; sortObj.stock = -1; }
    else if (sortVal === "newest") sortObj.createdAt = -1;
    else sortObj.name = 1;

    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .select(
        "name brand price originalPrice image stock inStock requiresRx isPrescriptionRequired isColdChain badge category surgicalCategory productType isSurgical strength packSize manufacturer slug molecules"
      )
      .populate("category", "name slug")
      .populate("surgicalCategory", "name slug")
      .populate("molecules", "name slug")
      .sort(sortObj)
      .skip(skipNum)
      .limit(limitNum);

    const totalPages = Math.ceil(total / limitNum) || 1;

    res.status(200).json({
      success: true,
      count: products.length,
      totalProducts: total,
      total,
      currentPage: pageNum,
      page: pageNum,
      totalPages,
      pages: totalPages,
      pageSize: limitNum,
      products,
    });
  } catch (error) {
    next(error);
  }
};

export const getProduct = async (req, res, next) => {
  const { id } = req.params;

  try {
    let product;
    const mongoose = (await import("mongoose")).default;
    if (mongoose.Types.ObjectId.isValid(id)) {
      product = await Product.findById(id)
        .populate("category", "name slug")
        .populate("surgicalCategory", "name slug")
        .populate("specialities", "name slug")
        .populate("molecules", "name slug")
        .populate({
          path: "relatedProducts",
          select: "name price originalPrice image slug requiresRx isColdChain isPrescriptionRequired badge molecules",
          populate: { path: "molecules", select: "name slug" }
        });
    } else {
      product = await Product.findOne({ slug: id })
        .populate("category", "name slug")
        .populate("surgicalCategory", "name slug")
        .populate("specialities", "name slug")
        .populate("molecules", "name slug")
        .populate({
          path: "relatedProducts",
          select: "name price originalPrice image slug requiresRx isColdChain isPrescriptionRequired badge molecules",
          populate: { path: "molecules", select: "name slug" }
        });
    }

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }
    res.status(200).json({ success: true, product });
  } catch (error) {
    next(error);
  }
};

export const createProduct = async (req, res, next) => {
  const productData = req.body;

  try {
    let slug = productData.slug || slugify(productData.name, { lower: true });
    slug = slugify(slug, { lower: true });

    // Handle missing SKU
    if (!productData.sku || !productData.sku.trim()) {
      productData.sku = `SKU-${slug.slice(0, 15)}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
    }

    // Map manufacturer to brand for compatibility
    if (productData.manufacturer) {
      productData.brand = productData.manufacturer;
    } else if (productData.brand) {
      productData.manufacturer = productData.brand;
    }

    // Handle In Stock Boolean Toggle
    const inStock = productData.inStock !== undefined ? !!productData.inStock : true;
    productData.inStock = inStock;
    productData.stock = inStock ? 99 : 0;

    // Auto badges based on inventory levels
    let badge = productData.badge || "";
    if (!inStock) {
      badge = "Out of Stock";
    } else if (badge === "Out of Stock" || badge === "Low Stock") {
      badge = "";
    }

    // Resolve Category string name to ObjectId if needed
    let categoryId = productData.category;
    if (categoryId && !mongoose.Types.ObjectId.isValid(categoryId)) {
      const matchedCategory = await Category.findOne({
        name: { $regex: `^${categoryId.trim()}$`, $options: "i" },
      });
      if (matchedCategory) {
        categoryId = matchedCategory._id;
      }
    }

    // Set moleculeSlug automatically
    let moleculeSlug = "";
    if (productData.molecules && productData.molecules.length > 0) {
      const mol = await Molecule.findById(productData.molecules[0]);
      if (mol) {
        moleculeSlug = mol.slug;
      }
    }

    const product = await Product.create({
      ...productData,
      category: categoryId,
      slug,
      badge,
      moleculeSlug,
    });

    // Increment category product count (category is now ObjectId)
    if (product.category) {
      await Category.findByIdAndUpdate(
        product.category,
        { $inc: { count: 1 } }
      );
    }

    res.status(201).json({ success: true, product });
  } catch (error) {
    next(error);
  }
};

export const updateProduct = async (req, res, next) => {
  const { id } = req.params;
  const updateData = req.body;

  try {
    let product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    if (updateData.slug && updateData.slug.trim()) {
      updateData.slug = slugify(updateData.slug.trim(), { lower: true });
    } else if (updateData.name) {
      updateData.slug = slugify(updateData.name, { lower: true });
    }

    // Handle missing SKU (if somehow deleted/removed)
    if (updateData.sku === "" || (updateData.sku && !updateData.sku.trim())) {
      const tempSlug = updateData.slug || product.slug;
      updateData.sku = `SKU-${tempSlug.slice(0, 15)}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
    }

    // Map manufacturer to brand for compatibility
    if (updateData.manufacturer !== undefined) {
      updateData.brand = updateData.manufacturer;
    } else if (updateData.brand !== undefined) {
      updateData.manufacturer = updateData.brand;
    }

    // Handle In Stock Boolean Toggle
    if (updateData.inStock !== undefined) {
      const inStock = !!updateData.inStock;
      updateData.stock = inStock ? 99 : 0;

      // Auto badges based on inventory levels
      if (!inStock) {
        updateData.badge = "Out of Stock";
      } else if (product.badge === "Out of Stock" || product.badge === "Low Stock" || updateData.badge === "Out of Stock" || updateData.badge === "Low Stock") {
        updateData.badge = "";
      }
    }

    // Set moleculeSlug automatically
    if (updateData.molecules !== undefined) {
      let moleculeSlug = "";
      if (updateData.molecules && updateData.molecules.length > 0) {
        const mol = await Molecule.findById(updateData.molecules[0]);
        if (mol) {
          moleculeSlug = mol.slug;
        }
      }
      updateData.moleculeSlug = moleculeSlug;
    }

    // Resolve Category string name to ObjectId if needed
    if (updateData.category && !mongoose.Types.ObjectId.isValid(updateData.category)) {
      const matchedCategory = await Category.findOne({
        name: { $regex: `^${updateData.category.trim()}$`, $options: "i" },
      });
      if (matchedCategory) {
        updateData.category = matchedCategory._id;
      }
    }

    const updatedProduct = await Product.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    // Sync counts if category changed (compare ObjectIds)
    if (updateData.category && updateData.category.toString() !== product.category.toString()) {
      // Decrement old category
      if (product.category) {
        await Category.findByIdAndUpdate(product.category, { $inc: { count: -1 } });
      }
      // Increment new category
      await Category.findByIdAndUpdate(updateData.category, { $inc: { count: 1 } });
    }

    res.status(200).json({ success: true, product: updatedProduct });
  } catch (error) {
    next(error);
  }
};

export const deleteProduct = async (req, res, next) => {
  const { id } = req.params;

  try {
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    await product.deleteOne();

    // Decrement category count (category is now ObjectId)
    if (product.category) {
      await Category.findByIdAndUpdate(product.category, { $inc: { count: -1 } });
    }

    res.status(200).json({ success: true, message: "Product deleted successfully" });
  } catch (error) {
    next(error);
  }
};

export const getSimilarProducts = async (req, res, next) => {
  const { id } = req.params;
  try {
    let currentProduct;
    if (mongoose.Types.ObjectId.isValid(id)) {
      currentProduct = await Product.findById(id);
    } else {
      currentProduct = await Product.findOne({ slug: id });
    }

    if (!currentProduct) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    if (!currentProduct.molecules || currentProduct.molecules.length === 0) {
      return res.status(200).json({ success: true, products: [] });
    }

    const similar = await Product.find({
      _id: { $ne: currentProduct._id },
      molecules: { $in: currentProduct.molecules }
    })
      .select("name price originalPrice image slug requiresRx isColdChain isPrescriptionRequired isNonRefundable badge molecules brand similarMedicinePriority")
      .populate("molecules", "name slug")
      .sort({ similarMedicinePriority: -1 })
      .limit(3);

    res.status(200).json({ success: true, products: similar });
  } catch (error) {
    next(error);
  }
};

// ─── Universal Search Endpoints ──────────────────────────────────────────────
export const searchAll = async (req, res, next) => {
  const { q } = req.query;
  if (!q || q.trim().length < 2) {
    return res.status(200).json({ success: true, results: { molecules: [], products: [] } });
  }

  const queryStr = q.trim();
  const escapedQ = queryStr.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(escapedQ, "i");
  const wordBoundaryRegex = new RegExp(`\\b${escapedQ}`, "i");
  const qLower = queryStr.toLowerCase();

  try {
    // 1. Query Molecules (fetch up to 50 matches so we can rank before returning top 6)
    const allMolecules = await Molecule.find({ name: regex })
      .select("name slug")
      .limit(50);

    // Rank Molecules strictly: Exact > Name Starts With > Word Boundary Starts With > Name Contains
    const sortedMolecules = [...allMolecules].sort((a, b) => {
      const aName = a.name.toLowerCase();
      const bName = b.name.toLowerCase();

      const aExact = aName === qLower;
      const bExact = bName === qLower;
      if (aExact && !bExact) return -1;
      if (!aExact && bExact) return 1;

      const aStart = aName.startsWith(qLower);
      const bStart = bName.startsWith(qLower);
      if (aStart && !bStart) return -1;
      if (!aStart && bStart) return 1;

      const aWordStart = wordBoundaryRegex.test(a.name);
      const bWordStart = wordBoundaryRegex.test(b.name);
      if (aWordStart && !bWordStart) return -1;
      if (!aWordStart && bWordStart) return 1;

      return aName.localeCompare(bName);
    }).slice(0, 6);

    // 2. Query Products
    // For short queries (<=3 chars e.g. "as"), do not search description paragraph text to prevent false positives like "fast", "has", "dosage"
    const productQueryFields = [
      { name: regex },
      { brand: regex },
      { manufacturer: regex },
      { strength: regex },
      { "composition.ingredient": regex }
    ];

    if (queryStr.length > 3) {
      productQueryFields.push({ description: regex });
    }

    const rawProducts = await Product.find({ $or: productQueryFields })
      .select("name brand price originalPrice image slug stock inStock requiresRx isPrescriptionRequired strength packSize manufacturer isSurgical productType category composition")
      .populate("category", "name slug")
      .limit(60);

    // Sort Products strictly by relevance
    const sortedProducts = [...rawProducts].sort((a, b) => {
      const aName = a.name.toLowerCase();
      const bName = b.name.toLowerCase();

      // Priority 1: Exact Name
      const aExact = aName === qLower;
      const bExact = bName === qLower;
      if (aExact && !bExact) return -1;
      if (!aExact && bExact) return 1;

      // Priority 2: Name Starts With Query
      const aStart = aName.startsWith(qLower);
      const bStart = bName.startsWith(qLower);
      if (aStart && !bStart) return -1;
      if (!aStart && bStart) return 1;

      // Priority 3: Word Boundary in Name Starts With Query (e.g. "Bayer Aspirin")
      const aWordStart = wordBoundaryRegex.test(a.name);
      const bWordStart = wordBoundaryRegex.test(b.name);
      if (aWordStart && !bWordStart) return -1;
      if (!aWordStart && bWordStart) return 1;

      // Priority 4: Brand or composition ingredient starts with query
      const aBrandStart = a.brand?.toLowerCase().startsWith(qLower) || a.composition?.some(c => c.ingredient.toLowerCase().startsWith(qLower));
      const bBrandStart = b.brand?.toLowerCase().startsWith(qLower) || b.composition?.some(c => c.ingredient.toLowerCase().startsWith(qLower));
      if (aBrandStart && !bBrandStart) return -1;
      if (!aBrandStart && bBrandStart) return 1;

      // Priority 5: Name Contains Query
      const aNameContains = aName.includes(qLower);
      const bNameContains = bName.includes(qLower);
      if (aNameContains && !bNameContains) return -1;
      if (!aNameContains && bNameContains) return 1;

      return aName.localeCompare(bName);
    });

    // Filter out items that have no name/brand/composition match for short queries <= 3 chars
    const finalProducts = sortedProducts.filter(p => {
      if (queryStr.length <= 3) {
        const pName = p.name.toLowerCase();
        const pBrand = (p.brand || "").toLowerCase();
        const pMfg = (p.manufacturer || "").toLowerCase();
        const pComp = p.composition?.some(c => c.ingredient.toLowerCase().includes(qLower));
        return pName.includes(qLower) || pBrand.includes(qLower) || pMfg.includes(qLower) || pComp;
      }
      return true;
    }).slice(0, 12);

    res.status(200).json({
      success: true,
      results: {
        molecules: sortedMolecules,
        products: finalProducts,
        medicines: [],
        wellness: [],
        surgical: [],
        categories: [],
        surgicalCategories: [],
        specialities: [],
        library: [],
        pap: [],
        offers: []
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getTrendingProducts = async (req, res, next) => {
  try {
    const trending = await Product.find({})
      .select("name brand price originalPrice image slug stock inStock requiresRx isPrescriptionRequired strength packSize manufacturer isSurgical productType category")
      .populate("category", "name slug")
      .sort({ createdAt: -1 })
      .limit(6);

    res.status(200).json({ success: true, products: trending });
  } catch (error) {
    next(error);
  }
};

export const searchProductsResults = async (req, res, next) => {
  const { q, page = 1, limit = 28 } = req.query;
  const pageNum = parseInt(page) || 1;
  const limitNum = parseInt(limit) || 28;
  const skip = (pageNum - 1) * limitNum;

  try {
    if (!q || !q.trim()) {
      return res.status(200).json({
        success: true,
        count: 0,
        total: 0,
        page: pageNum,
        pages: 1,
        products: []
      });
    }

    const queryStr = q.trim();
    const regex = new RegExp(queryStr, "i");

    // 1. Find matching Molecules
    const matchedMols = await Molecule.find({ name: regex }).select("_id");
    const molIds = matchedMols.map(m => m._id);

    // 2. Find matching Categories
    const matchedCats = await Category.find({ name: regex }).select("_id");
    const catIds = matchedCats.map(c => c._id);

    // 3. Find matching Surgical Categories
    const matchedSurgCats = await SurgicalCategory.find({ name: regex }).select("_id");
    const surgCatIds = matchedSurgCats.map(c => c._id);

    // Build the query
    const query = {
      $or: [
        { name: regex },
        { brand: regex },
        { manufacturer: regex },
        { description: regex },
        { strength: regex },
        { "composition.ingredient": regex },
        { molecules: { $in: molIds } },
        { category: { $in: catIds } },
        { surgicalCategory: { $in: surgCatIds } }
      ]
    };

    // Fetch matching products with lightweight field projections to optimize memory & speed
    const allProducts = await Product.find(query)
      .select("name brand manufacturer description strength composition molecules category surgicalCategory specialities price originalPrice image slug stock inStock requiresRx badge isSurgical productType")
      .populate("category", "name slug")
      .populate("specialities", "name slug")
      .populate("molecules", "name slug");

    // Ranking priority:
    // 1. Exact Product Name
    // 2. Product Name Starts With
    // 3. Generic Name / Composition ingredient match
    // 4. Brand
    // 5. Molecule Match
    // 6. Category Match
    // 7. Description
    const rankedProducts = allProducts.sort((a, b) => {
      const aLowerName = a.name.toLowerCase();
      const bLowerName = b.name.toLowerCase();
      const qLower = queryStr.toLowerCase();

      // Priority 1: Exact Name
      const aExact = aLowerName === qLower;
      const bExact = bLowerName === qLower;
      if (aExact && !bExact) return -1;
      if (!aExact && bExact) return 1;

      // Priority 2: Starts with Name
      const aStart = aLowerName.startsWith(qLower);
      const bStart = bLowerName.startsWith(qLower);
      if (aStart && !bStart) return -1;
      if (!aStart && bStart) return 1;

      // Priority 3: Composition / Generic Name match
      const aComp = a.composition?.some(c => c.ingredient.toLowerCase().includes(qLower));
      const bComp = b.composition?.some(c => c.ingredient.toLowerCase().includes(qLower));
      if (aComp && !bComp) return -1;
      if (!aComp && bComp) return 1;

      // Priority 4: Brand/Manufacturer
      const aBrand = a.brand?.toLowerCase().includes(qLower) || a.manufacturer?.toLowerCase().includes(qLower);
      const bBrand = b.brand?.toLowerCase().includes(qLower) || b.manufacturer?.toLowerCase().includes(qLower);
      if (aBrand && !bBrand) return -1;
      if (!aBrand && bBrand) return 1;

      // Priority 5: Molecule Match
      const aMol = a.molecules?.some(m => m.name.toLowerCase().includes(qLower));
      const bMol = b.molecules?.some(m => m.name.toLowerCase().includes(qLower));
      if (aMol && !bMol) return -1;
      if (!aMol && bMol) return 1;

      // Priority 6: Category Match
      const aCat = a.category?.name?.toLowerCase().includes(qLower);
      const bCat = b.category?.name?.toLowerCase().includes(qLower);
      if (aCat && !bCat) return -1;
      if (!aCat && bCat) return 1;

      // Priority 7: Description
      const aDesc = a.description?.toLowerCase().includes(qLower);
      const bDesc = b.description?.toLowerCase().includes(qLower);
      if (aDesc && !bDesc) return -1;
      if (!aDesc && bDesc) return 1;

      return 0;
    });

    const total = rankedProducts.length;
    const paginatedProducts = rankedProducts.slice(skip, skip + limitNum);

    res.status(200).json({
      success: true,
      count: paginatedProducts.length,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      products: paginatedProducts
    });
  } catch (error) {
    next(error);
  }
};

