import { Wishlist } from "../models/Wishlist.js";

export const getWishlist = async (req, res, next) => {
  try {
    let wishlist = await Wishlist.findOne({ user: req.user._id }).populate("products");
    if (!wishlist) {
      wishlist = await Wishlist.create({ user: req.user._id, products: [] });
    }
    res.status(200).json({ success: true, products: wishlist.products });
  } catch (error) {
    next(error);
  }
};

export const toggleWishlist = async (req, res, next) => {
  const { productId } = req.body;

  try {
    let wishlist = await Wishlist.findOne({ user: req.user._id });
    if (!wishlist) {
      wishlist = await Wishlist.create({ user: req.user._id, products: [] });
    }

    // Use findIndex with proper ObjectId comparison instead of indexOf
    const prodIndex = wishlist.products.findIndex((id) => id.toString() === productId.toString());
    
    if (prodIndex > -1) {
      // Remove product
      wishlist.products.splice(prodIndex, 1);
    } else {
      // Add product
      wishlist.products.push(productId);
    }

    await wishlist.save();
    const updatedWishlist = await Wishlist.findOne({ user: req.user._id }).populate("products");
    res.status(200).json({ success: true, products: updatedWishlist.products });
  } catch (error) {
    next(error);
  }
};
