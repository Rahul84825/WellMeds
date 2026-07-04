import { SurgicalCategory } from "../models/SurgicalCategory.js";
import { Product } from "../models/Product.js";
import { deleteFromCloudinary } from "../services/cloudinaryService.js";
import slugify from "slugify";

// @desc    Get all active surgical categories (Public)
// @route   GET /api/surgical-categories
export const getSurgicalCategories = async (req, res, next) => {
  try {
    const categories = await SurgicalCategory.find({ isActive: true }).sort({ displayOrder: 1, name: 1 });
    
    // Dynamically calculate product count for each category
    const categoriesWithCount = await Promise.all(
      categories.map(async (cat) => {
        const count = await Product.countDocuments({ surgicalCategory: cat._id, isSurgical: true });
        return {
          ...cat.toObject(),
          productCount: count,
        };
      })
    );

    res.status(200).json({ success: true, categories: categoriesWithCount });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single surgical category by slug (Public)
// @route   GET /api/surgical-categories/:slug
export const getSurgicalCategoryBySlug = async (req, res, next) => {
  const { slug } = req.params;
  try {
    const category = await SurgicalCategory.findOne({ slug, isActive: true });
    if (!category) {
      return res.status(404).json({ success: false, message: "Surgical Category not found" });
    }
    res.status(200).json({ success: true, category });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all surgical categories for admin dashboard (Admin Only)
// @route   GET /api/surgical-categories/admin/all
export const adminGetSurgicalCategories = async (req, res, next) => {
  const { search, page, limit } = req.query;
  try {
    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } }
      ];
    }

    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 20;
    const skipNum = (pageNum - 1) * limitNum;

    const [totalCount, categories] = await Promise.all([
      SurgicalCategory.countDocuments(query),
      SurgicalCategory.find(query)
        .sort({ displayOrder: 1, name: 1 })
        .skip(skipNum)
        .limit(limitNum)
    ]);

    const categoriesWithCount = await Promise.all(
      categories.map(async (cat) => {
        const count = await Product.countDocuments({ surgicalCategory: cat._id });
        return {
          ...cat.toObject(),
          productCount: count
        };
      })
    );

    res.status(200).json({
      success: true,
      categories: categoriesWithCount,
      total: totalCount,
      page: pageNum,
      pages: Math.ceil(totalCount / limitNum),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new surgical category (Admin Only)
// @route   POST /api/surgical-categories
export const createSurgicalCategory = async (req, res, next) => {
  const categoryData = req.body;
  try {
    if (!categoryData.name) {
      return res.status(400).json({ success: false, message: "Category name is required" });
    }

    // Auto-generate slug if not provided, else slugify manual value
    const slugVal = categoryData.slug 
      ? slugify(categoryData.slug, { lower: true })
      : slugify(categoryData.name, { lower: true });

    const categoryExists = await SurgicalCategory.findOne({ slug: slugVal });
    if (categoryExists) {
      return res.status(400).json({ success: false, message: "Surgical Category with this slug or name already exists" });
    }

    const category = await SurgicalCategory.create({
      ...categoryData,
      slug: slugVal
    });

    res.status(201).json({ success: true, category });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a surgical category (Admin Only)
// @route   PUT /api/surgical-categories/:id
export const updateSurgicalCategory = async (req, res, next) => {
  const { id } = req.params;
  const updateData = req.body;
  try {
    const category = await SurgicalCategory.findById(id);
    if (!category) {
      return res.status(404).json({ success: false, message: "Surgical Category not found" });
    }

    // Prepare slug
    if (updateData.name) {
      category.name = updateData.name;
      if (!updateData.slug) {
        category.slug = slugify(updateData.name, { lower: true });
      }
    }

    if (updateData.slug) {
      category.slug = slugify(updateData.slug, { lower: true });
    }

    // Image change detection to delete orphans
    if (updateData.image !== undefined && updateData.image !== category.image) {
      if (category.image) {
        await deleteFromCloudinary(category.image);
      }
      category.image = updateData.image;
    }

    if (updateData.bannerImage !== undefined && updateData.bannerImage !== category.bannerImage) {
      if (category.bannerImage) {
        await deleteFromCloudinary(category.bannerImage);
      }
      category.bannerImage = updateData.bannerImage;
    }

    if (updateData.description !== undefined) category.description = updateData.description;
    if (updateData.icon !== undefined) category.icon = updateData.icon;
    if (updateData.displayOrder !== undefined) category.displayOrder = parseInt(updateData.displayOrder) || 0;
    if (updateData.isActive !== undefined) category.isActive = !!updateData.isActive;
    if (updateData.seoTitle !== undefined) category.seoTitle = updateData.seoTitle;
    if (updateData.seoDescription !== undefined) category.seoDescription = updateData.seoDescription;

    await category.save();
    res.status(200).json({ success: true, category });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a surgical category (Admin Only)
// @route   DELETE /api/surgical-categories/:id
export const deleteSurgicalCategory = async (req, res, next) => {
  const { id } = req.params;
  try {
    const category = await SurgicalCategory.findById(id);
    if (!category) {
      return res.status(404).json({ success: false, message: "Surgical Category not found" });
    }

    // VALIDATION: Cannot delete category if products belong to it.
    const productCount = await Product.countDocuments({ surgicalCategory: id });
    if (productCount > 0) {
      return res.status(400).json({ 
        success: false, 
        message: `Cannot delete category. There are ${productCount} products belonging to this category. Please move or reassign the products first.` 
      });
    }

    // Delete associated images
    if (category.image) {
      await deleteFromCloudinary(category.image);
    }
    if (category.bannerImage) {
      await deleteFromCloudinary(category.bannerImage);
    }

    await category.deleteOne();
    res.status(200).json({ success: true, message: "Surgical Category deleted successfully" });
  } catch (error) {
    next(error);
  }
};

// @desc    Bulk reorder surgical categories (Admin Only)
// @route   PUT /api/surgical-categories/reorder
export const bulkReorderSurgicalCategories = async (req, res, next) => {
  const { orders } = req.body; // Array of { id, displayOrder }
  try {
    if (!Array.isArray(orders)) {
      return res.status(400).json({ success: false, message: "Invalid orders payload. Must be an array." });
    }

    const bulkOps = orders.map((item) => ({
      updateOne: {
        filter: { _id: item.id },
        update: { $set: { displayOrder: parseInt(item.displayOrder) || 0 } }
      }
    }));

    await SurgicalCategory.bulkWrite(bulkOps);
    res.status(200).json({ success: true, message: "Categories reordered successfully." });
  } catch (error) {
    next(error);
  }
};
