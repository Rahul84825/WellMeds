import { Product } from "../models/Product.js";
import { Category } from "../models/Category.js";
import { MedicalSpeciality } from "../models/MedicalSpeciality.js";
import { Molecule } from "../models/Molecule.js";
import { SurgicalCategory } from "../models/SurgicalCategory.js";
import slugify from "slugify";
import mongoose from "mongoose";

export const getProducts = async (req, res, next) => {
  const { search, category, speciality, molecule, page, limit, productType, isSurgical, surgicalCategory } = req.query;

  try {
    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { brand: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    // Filter by category name (case-insensitive lookup → ObjectId filter)
    if (category && category.trim()) {
      const matchedCategory = await Category.findOne({
        name: { $regex: `^${category.trim()}$`, $options: "i" },
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

    // Filter by speciality slug
    if (speciality && speciality.trim()) {
      const matchedSpeciality = await MedicalSpeciality.findOne({
        slug: speciality.trim(),
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
          select: "name price originalPrice image slug requiresRx badge molecules",
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
          select: "name price originalPrice image slug requiresRx badge molecules",
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
    const slug = slugify(productData.name, { lower: true });
    
    // Auto badges based on inventory levels
    let badge = productData.badge || "";
    const stock = parseInt(productData.stock) || 0;
    if (stock === 0) badge = "Out of Stock";
    else if (stock <= 10) badge = "Low Stock";

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

    const product = await Product.create({
      ...productData,
      category: categoryId,
      slug,
      badge,
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

    if (updateData.name) {
      updateData.slug = slugify(updateData.name, { lower: true });
    }

    // Auto update stock badges
    if (updateData.stock !== undefined) {
      const stock = parseInt(updateData.stock) || 0;
      if (stock === 0) updateData.badge = "Out of Stock";
      else if (stock <= 10) updateData.badge = "Low Stock";
      else if (product.badge === "Out of Stock" || product.badge === "Low Stock") {
        updateData.badge = ""; // Clear badge if stock is replenished
      }
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
