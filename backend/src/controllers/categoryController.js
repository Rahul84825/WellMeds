import { Category } from "../models/Category.js";
import slugify from "slugify";

export const getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.status(200).json({ success: true, categories });
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
