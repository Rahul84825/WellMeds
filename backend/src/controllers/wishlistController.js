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

    const prodIndex = wishlist.products.indexOf(productId);
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
