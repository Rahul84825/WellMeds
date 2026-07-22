import { Product } from "../models/Product.js";
import { Category } from "../models/Category.js";
import { MedicalSpeciality } from "../models/MedicalSpeciality.js";
import { Molecule } from "../models/Molecule.js";
import { SurgicalCategory } from "../models/SurgicalCategory.js";
import slugify from "slugify";
import mongoose from "mongoose";

export const getProducts = async (req, res, next) => {
  const { search, category, speciality, molecule, page, limit, productType, isSurgical, surgicalCategory, isImported } = req.query;

  try {
    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { brand: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    // Filter by category name or slug
    if (category && category.trim()) {
      const matchedCategory = await Category.findOne({
        $or: [
          { name: { $regex: `^${category.trim()}$`, $options: "i" } },
          { slug: category.trim().toLowerCase() }
        ]
      });
      if (matchedCategory) {
        query.category = matchedCategory._id;
      } else {
        // No matching category — return empty result set immediately
        return res.status(200).json({
          success: true,
          count: 0,
          total: 0,
          page: 1,
          pages: 1,
          products: [],
        });
      }
    }

    // Filter by speciality slug or name
    if (speciality && speciality.trim()) {
      const matchedSpeciality = await MedicalSpeciality.findOne({
        $or: [
          { slug: speciality.trim().toLowerCase() },
          { name: { $regex: `^${speciality.trim()}$`, $options: "i" } }
        ]
      });
      if (matchedSpeciality) {
        query.specialities = matchedSpeciality._id;
      } else {
        // No matching speciality — return empty result set immediately
        return res.status(200).json({
          success: true,
          count: 0,
          total: 0,
          page: 1,
          pages: 1,
          products: [],
        });
      }
    }

    // Filter by isImported (source)
    if (isImported !== undefined && isImported !== "") {
      query.isImported = isImported === "true";
    }
    // Filter by molecule slug or ID
    if (molecule && molecule.trim()) {
      const queryVal = molecule.trim();
      let matchedMolecule;
      if (mongoose.Types.ObjectId.isValid(queryVal)) {
        matchedMolecule = await Molecule.findById(queryVal);
      } else {
        matchedMolecule = await Molecule.findOne({ slug: queryVal });
      }

      if (matchedMolecule) {
        query.molecules = matchedMolecule._id;
      } else {
        return res.status(200).json({
          success: true,
          count: 0,
          total: 0,
          page: 1,
          pages: 1,
          products: [],
        });
      }
    }
    if (productType) {
      query.productType = productType;
    }

    if (isSurgical !== undefined) {
      query.isSurgical = isSurgical === "true";
    }

    if (surgicalCategory && surgicalCategory.trim()) {
      if (mongoose.Types.ObjectId.isValid(surgicalCategory)) {
        query.surgicalCategory = surgicalCategory;
      } else {
        const matchedSurgCategory = await SurgicalCategory.findOne({ slug: surgicalCategory.trim() });
        if (matchedSurgCategory) {
          query.surgicalCategory = matchedSurgCategory._id;
        } else {
          return res.status(200).json({
            success: true,
            count: 0,
            total: 0,
            page: 1,
            pages: 1,
            products: [],
          });
        }
      }
    }

    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 28;
    const skipNum = (pageNum - 1) * limitNum;

    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .select("name brand price originalPrice image stock inStock requiresRx badge category surgicalCategory productType isSurgical strength packSize manufacturer slug molecules")
      .populate("category", "name slug")
      .populate("surgicalCategory", "name slug")
      .populate("molecules", "name slug")
      .skip(skipNum)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      count: products.length,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
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
    .select("name price originalPrice image slug requiresRx isColdChain isPrescriptionRequired isNonRefundable badge molecules brand similarMedicinePriority displayOrder")
    .populate("molecules", "name slug")
    .sort({ similarMedicinePriority: -1, displayOrder: 1 })
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
    return res.status(200).json({ success: true, results: {} });
  }

  const queryStr = q.trim();
  const regex = new RegExp(queryStr, "i");

  try {
    // 1. Query Molecules (limit to 6 as in original)
    const molecules = await Molecule.find({ name: regex })
      .select("name slug")
      .limit(6);

    // 2. Query Products (Medicines, Wellness, Surgical)
    const products = await Product.find({
      $or: [
        { name: regex },
        { brand: regex },
        { manufacturer: regex },
        { description: regex }
      ]
    })
    .select("name brand price originalPrice image slug stock inStock requiresRx isPrescriptionRequired strength packSize manufacturer isSurgical productType category")
    .populate("category", "name slug")
    .limit(20);

    // Search Priority logic
    // Sort results in this order:
    // 1. Exact Product Match
    // 2. Product Prefix Match
    // 3. Partial Product Match
    const prioritizeProducts = (list) => {
      const qLower = queryStr.toLowerCase();
      return [...list].sort((a, b) => {
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

        const aPartial = aName.includes(qLower);
        const bPartial = bName.includes(qLower);
        if (aPartial && !bPartial) return -1;
        if (!aPartial && bPartial) return 1;

        return aName.localeCompare(bName);
      });
    };

    // Sort molecules:
    // 4. Exact Molecule Match
    // 5. Partial Molecule Match
    const prioritizeMolecules = (list) => {
      const qLower = queryStr.toLowerCase();
      return [...list].sort((a, b) => {
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

        const aPartial = aName.includes(qLower);
        const bPartial = bName.includes(qLower);
        if (aPartial && !bPartial) return -1;
        if (!aPartial && bPartial) return 1;

        return aName.localeCompare(bName);
      });
    };

    res.status(200).json({
      success: true,
      results: {
        molecules: prioritizeMolecules(molecules),
        products: prioritizeProducts(products),
        // Empty placeholders for backward-compatibility
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
    let trending = await Product.find({ isTrending: true })
      .select("name brand price originalPrice image slug stock inStock requiresRx isPrescriptionRequired strength packSize manufacturer isSurgical productType category")
      .populate("category", "name slug")
      .limit(6);

    if (trending.length === 0) {
      trending = await Product.find({})
        .select("name brand price originalPrice image slug stock inStock requiresRx isPrescriptionRequired strength packSize manufacturer isSurgical productType category")
        .populate("category", "name slug")
        .sort({ displayOrder: 1 })
        .limit(6);
    }

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

