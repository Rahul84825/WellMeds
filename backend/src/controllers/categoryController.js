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
  const { name, icon, description, image, status } = req.body;

  try {
    const slug = slugify(name, { lower: true });
    const categoryExists = await Category.findOne({ slug });
    
    if (categoryExists) {
      return res.status(400).json({ success: false, message: "Category already exists" });
    }

    const category = await Category.create({
      name,
      slug,
      icon: icon || "category",
      description: description || "",
      image: image || "",
      status: status || "Active",
      isActive: status !== "Inactive"
    });

    res.status(201).json({ success: true, category });
  } catch (error) {
    next(error);
  }
};

export const updateCategory = async (req, res, next) => {
  const { id } = req.params;
  const updateData = req.body;

  try {
    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }

    if (updateData.name) {
      category.name = updateData.name;
      category.slug = slugify(updateData.name, { lower: true });
    }

    if (updateData.icon !== undefined) category.icon = updateData.icon;
    if (updateData.description !== undefined) category.description = updateData.description;
    if (updateData.image !== undefined) category.image = updateData.image;
    
    if (updateData.status !== undefined) {
      category.status = updateData.status;
      category.isActive = updateData.status === "Active";
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
