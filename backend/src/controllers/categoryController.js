import { Category } from "../models/Category.js";
import slugify from "slugify";
import mongoose from "mongoose";

export const getCategories = async (req, res, next) => {
  try {
    const Product = mongoose.model("Product");
    const categories = await Category.find().sort({ name: 1 }).lean();

    const categoryCounts = await Product.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } }
    ]);

    const countMap = {};
    categoryCounts.forEach((item) => {
      if (item._id) {
        countMap[item._id.toString()] = item.count;
      }
    });

    const enrichedCategories = categories.map((cat) => ({
      ...cat,
      count: countMap[cat._id.toString()] || 0
    }));

    res.status(200).json({ success: true, categories: enrichedCategories });
  } catch (error) {
    next(error);
  }
};

export const getCategoryBySlug = async (req, res, next) => {
  const { id } = req.params;
  try {
    let category;
    if (mongoose.Types.ObjectId.isValid(id)) {
      category = await Category.findById(id);
    }
    if (!category) {
      const cleanSlug = id.trim().toLowerCase();
      const nameVariant = cleanSlug.replace(/-/g, " ");
      const slugVariant = slugify(nameVariant, { lower: true });
      category = await Category.findOne({
        $or: [
          { slug: cleanSlug },
          { slug: slugVariant },
          { name: { $regex: `^${cleanSlug.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&")}$`, $options: "i" } },
          { name: { $regex: `^${nameVariant.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&")}$`, $options: "i" } }
        ]
      });
    }

    if (category) {
      const catObj = category.toObject ? category.toObject() : { ...category };
      const Product = mongoose.model("Product");
      const liveCount = await Product.countDocuments({
        $or: [
          { category: category._id },
          { category: category._id?.toString() }
        ]
      });
      catObj.count = liveCount;
      category = catObj;
    } else {
      // Synthesize category details if products exist for this category name
      const nameVariant = id.trim().replace(/-/g, " ");
      const displayName = nameVariant.replace(/\b\w/g, (c) => c.toUpperCase());
      const Product = mongoose.model("Product");
      const liveCount = await Product.countDocuments({
        $or: [
          { medicineCategory: { $regex: `^${id.trim()}$`, $options: "i" } },
          { "productSpecifications.therapeuticCategory": { $regex: `^${id.trim()}$`, $options: "i" } }
        ]
      });
      category = {
        _id: id,
        name: displayName,
        slug: id.toLowerCase(),
        count: liveCount,
        description: `Browse authentic clinical ${displayName} prescription medicines and therapeutic treatments at WellMeds.`,
        status: "Active",
        isActive: true
      };
    }

    res.status(200).json({ success: true, category });
  } catch (error) {
    next(error);
  }
};

export const createCategory = async (req, res, next) => {
  const { name, image } = req.body;

  try {
    if (!name) {
      return res.status(400).json({ success: false, message: "Category name is required" });
    }
    const slug = slugify(name, { lower: true });
    const categoryExists = await Category.findOne({ slug });
    
    if (categoryExists) {
      return res.status(400).json({ success: false, message: "Category already exists" });
    }

    const category = await Category.create({
      name,
      slug,
      image: image || "",
      icon: "category",
      description: "",
      status: "Active",
      isActive: true
    });

    res.status(201).json({ success: true, category });
  } catch (error) {
    next(error);
  }
};

export const updateCategory = async (req, res, next) => {
  const { id } = req.params;
  const { name, image, status } = req.body;

  try {
    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }

    if (name !== undefined) {
      category.name = name;
      category.slug = slugify(name, { lower: true });
    }

    if (image !== undefined) {
      category.image = image;
    }
    
    if (status !== undefined) {
      category.status = status;
      category.isActive = status === "Active";
    }

    await category.save();
    res.status(200).json({ success: true, category });
  } catch (error) {
    next(error);
  }
};

export const deleteCategory = async (req, res, next) => {
  const { id } = req.params;

  try {
    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }

    await category.deleteOne();
    res.status(200).json({ success: true, message: "Category deleted successfully" });
  } catch (error) {
    next(error);
  }
};
