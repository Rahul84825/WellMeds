import { Product } from "../models/Product.js";
import { Category } from "../models/Category.js";
import slugify from "slugify";

export const getProducts = async (req, res, next) => {
  const { search, category, brand, filter, sort, limit, page } = req.query;

  try {
    const query = {};

    // Search query match
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { brand: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    // Category filter matching
    if (category) {
      query.category = category;
    }

    // Custom UI filter mapping
    if (filter) {
      if (filter === "imported") {
        // Mock filter: map to specific brands or criteria
        query.brand = { $in: ["HealthGuard", "BioCare Tech"] };
      } else if (filter === "condition" || filter === "speciality" || filter === "molecule") {
        // Prescription medicines are mapped to super speciality filtering
        query.category = "Prescription";
      }
    }

    // Sorting options setup
    let sortOptions = { createdAt: -1 };
    if (sort) {
      if (sort === "price-asc") sortOptions = { price: 1 };
      else if (sort === "price-desc") sortOptions = { price: -1 };
      else if (sort === "rating") sortOptions = { rating: -1 };
    }

    // Pagination
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 12;
    const skipNum = (pageNum - 1) * limitNum;

    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .sort(sortOptions)
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
    const product = await Product.findById(id);
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

    const product = await Product.create({
      ...productData,
      slug,
      badge,
    });

    // Increment category product count
    await Category.findOneAndUpdate(
      { name: product.category },
      { $inc: { count: 1 } }
    );

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

    const updatedProduct = await Product.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    // Sync counts if category changed
    if (updateData.category && updateData.category !== product.category) {
      await Category.findOneAndUpdate({ name: product.category }, { $inc: { count: -1 } });
      await Category.findOneAndUpdate({ name: updateData.category }, { $inc: { count: 1 } });
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

    // Decrement category count
    await Category.findOneAndUpdate(
      { name: product.category },
      { $inc: { count: -1 } }
    );

    res.status(200).json({ success: true, message: "Product deleted successfully" });
  } catch (error) {
    next(error);
  }
};
