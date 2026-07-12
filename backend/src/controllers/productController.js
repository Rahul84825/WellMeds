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
    // 1. Query Molecules
    const molecules = await Molecule.find({ name: regex })
      .select("name slug")
      .limit(6);

    // 2. Query Categories (Conditions & Wellness)
    const categories = await Category.find({ name: regex })
      .select("name slug")
      .limit(6);

    // 3. Query Surgical Categories
    const surgicalCategories = await SurgicalCategory.find({ name: regex })
      .select("name slug")
      .limit(6);

    // 4. Query Specialities
    const specialities = await MedicalSpeciality.find({ name: regex })
      .select("name slug")
      .limit(6);

    // 5. Query Products (Medicines, Wellness, Surgical)
    const products = await Product.find({
      $or: [
        { name: regex },
        { brand: regex },
        { manufacturer: regex },
        { description: regex }
      ]
    })
    .select("name brand price originalPrice image slug stock inStock requiresRx isPrescriptionRequired strength packSize manufacturer isSurgical productType")
    .limit(20);

    const medicines = products.filter(p => p.productType === "medicine" && !p.isSurgical);
    const wellness = products.filter(p => p.productType === "wellness" && !p.isSurgical);
    const surgical = products.filter(p => p.isSurgical);

    // 6. Search Health Library Articles (static list search)
    const staticArticles = [
      { id: "art1", title: "Diabetes Guide: Managing Blood Glucose", slug: "articles", category: "health-guides", text: "diabetes glucose sugar insulin blood pressure" },
      { id: "art2", title: "Cancer Care: Understanding Biologics & Oncology", slug: "articles", category: "health-guides", text: "cancer oncology biologics chemotherapy tumor support" },
      { id: "art3", title: "Liver Health: Hepatitis Prevention & Treatment", slug: "articles", category: "health-guides", text: "liver hepatitis cirrhosis hepatitis care liver function" },
      { id: "art4", title: "Hypertension: Guide to Blood Pressure Control", slug: "articles", category: "health-guides", text: "hypertension blood pressure bp heart cardiac" },
      { id: "art5", title: "Asthma & Respiratory Wellness: Inhalers & Tips", slug: "articles", category: "health-guides", text: "asthma copd respiratory breathing lungs cold chain" },
      { id: "art6", title: "Nutrition & Lifestyle: Essential Wellness Habits", slug: "articles", category: "lifestyle", text: "nutrition lifestyle food diet protein vitamins weight management" }
    ];
    const matchedArticles = staticArticles.filter(art => 
      art.title.toLowerCase().includes(queryStr.toLowerCase()) || 
      art.text.toLowerCase().includes(queryStr.toLowerCase())
    ).map(({ text, ...rest }) => rest);

    // 7. Search PAP Programs (static list search)
    const staticPap = [
      { id: "pap1", title: "Manufacturer Co-Pay Assistance Program", category: "Available Programs", hash: "available-programs", text: "co-pay copay manufacturer program assistance subsidy discount" },
      { id: "pap2", title: "Patient Assistance Program Eligibility Checklist", category: "Eligibility Criteria", hash: "eligibility", text: "eligibility criteria income documentation verification check" },
      { id: "pap3", title: "Enrollment Form & Timeline Guide", category: "Enrollment Checklist", hash: "enrollment", text: "enrollment form timeline application steps register apply" },
      { id: "pap4", title: "How PAP Works: Auto-Refill & Delivery Setup", category: "Overview", hash: "how-it-works", text: "how it works auto refill automatic delivery timeline" }
    ];
    const matchedPap = staticPap.filter(p => 
      p.title.toLowerCase().includes(queryStr.toLowerCase()) || 
      p.text.toLowerCase().includes(queryStr.toLowerCase())
    ).map(({ text, ...rest }) => rest);

    // 8. Search Offers (static list search)
    const staticOffers = [
      { id: "off1", title: "Flat 15% OFF on First Medicine Order", code: "WELCOME15", description: "Get 15% off on your first purchase.", text: "offer discount welcome 15 prescription coupon code" },
      { id: "off2", title: "Free Home Delivery on Surgical Orders above ₹1000", code: "FREESHIP", description: "Get free delivery on orders with surgical items.", text: "free shipping surgical delivery coupon code" },
      { id: "off3", title: "Up to 30% OFF on Wellness & Supplements", code: "WELL30", description: "Extra discounts on select vitamins and protein powders.", text: "wellness supplements vitamins discounts coupon code" }
    ];
    const matchedOffers = staticOffers.filter(o => 
      o.title.toLowerCase().includes(queryStr.toLowerCase()) || 
      o.text.toLowerCase().includes(queryStr.toLowerCase())
    ).map(({ text, ...rest }) => rest);

    // Search Priority logic
    const prioritizeList = (list) => {
      return [...list].sort((a, b) => {
        const aExact = a.name.toLowerCase() === queryStr.toLowerCase();
        const bExact = b.name.toLowerCase() === queryStr.toLowerCase();
        if (aExact && !bExact) return -1;
        if (!aExact && bExact) return 1;

        const aStart = a.name.toLowerCase().startsWith(queryStr.toLowerCase());
        const bStart = b.name.toLowerCase().startsWith(queryStr.toLowerCase());
        if (aStart && !bStart) return -1;
        if (!aStart && bStart) return 1;

        if (a.brand && b.brand) {
          const aBrandStart = a.brand.toLowerCase().startsWith(queryStr.toLowerCase());
          const bBrandStart = b.brand.toLowerCase().startsWith(queryStr.toLowerCase());
          if (aBrandStart && !bBrandStart) return -1;
          if (!aBrandStart && bBrandStart) return 1;
        }

        return 0;
      });
    };

    res.status(200).json({
      success: true,
      results: {
        molecules,
        medicines: prioritizeList(medicines),
        wellness: prioritizeList(wellness),
        surgical: prioritizeList(surgical),
        categories,
        surgicalCategories,
        specialities,
        library: matchedArticles,
        pap: matchedPap,
        offers: matchedOffers
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getTrendingProducts = async (req, res, next) => {
  try {
    let trending = await Product.find({ isTrending: true })
      .select("name brand price originalPrice image slug stock inStock requiresRx isPrescriptionRequired strength packSize manufacturer isSurgical productType")
      .limit(6);

    if (trending.length === 0) {
      trending = await Product.find({})
        .select("name brand price originalPrice image slug stock inStock requiresRx isPrescriptionRequired strength packSize manufacturer isSurgical productType")
        .sort({ displayOrder: 1 })
        .limit(6);
    }

    res.status(200).json({ success: true, products: trending });
  } catch (error) {
    next(error);
  }
};

