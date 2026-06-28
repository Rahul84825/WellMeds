import { Cart } from "../models/Cart.js";
import { Product } from "../models/Product.js";

export const getCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id }).populate("items.product");
    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }
    res.status(200).json({ success: true, items: cart.items });
  } catch (error) {
    next(error);
  }
};

export const addToCart = async (req, res, next) => {
  const { productId, quantity } = req.body;

  try {
    // Fetch product to check stock
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    const requestedQuantity = quantity || 1;

    // Validate stock availability
    if (product.stock < requestedQuantity) {
      return res.status(400).json({ 
        success: false, 
        message: `Insufficient stock. Only ${product.stock} item(s) available.` 
      });
    }

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }

    const itemIndex = cart.items.findIndex((item) => item.product.toString() === productId);
    if (itemIndex > -1) {
      const newQuantity = cart.items[itemIndex].quantity + requestedQuantity;
      // Validate total quantity doesn't exceed stock
      if (newQuantity > product.stock) {
        return res.status(400).json({ 
          success: false, 
          message: `Cannot add ${requestedQuantity} items. Total would be ${newQuantity}, but only ${product.stock} available.` 
        });
      }
      cart.items[itemIndex].quantity = newQuantity;
    } else {
      cart.items.push({ product: productId, quantity: requestedQuantity });
    }

    await cart.save();
    const updatedCart = await Cart.findOne({ user: req.user._id }).populate("items.product");
    res.status(200).json({ success: true, items: updatedCart.items });
  } catch (error) {
    next(error);
  }
};

export const updateQuantity = async (req, res, next) => {
  const { productId, quantity } = req.body;

  try {
    // Fetch product to check stock
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ success: false, message: "Cart not found" });
    }

    const itemIndex = cart.items.findIndex((item) => item.product.toString() === productId);
    if (itemIndex > -1) {
      if (quantity <= 0) {
        cart.items.splice(itemIndex, 1);
      } else {
        // Validate new quantity doesn't exceed stock
        if (quantity > product.stock) {
          return res.status(400).json({ 
            success: false, 
            message: `Cannot set quantity to ${quantity}. Only ${product.stock} item(s) available.` 
          });
        }
        cart.items[itemIndex].quantity = quantity;
      }
      await cart.save();
    }

    const updatedCart = await Cart.findOne({ user: req.user._id }).populate("items.product");
    res.status(200).json({ success: true, items: updatedCart.items });
  } catch (error) {
    next(error);
  }
};

export const removeFromCart = async (req, res, next) => {
  const { productId } = req.params;

  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (cart) {
      cart.items = cart.items.filter((item) => item.product.toString() !== productId);
      await cart.save();
    }

    const updatedCart = await Cart.findOne({ user: req.user._id }).populate("items.product");
    res.status(200).json({ success: true, items: updatedCart.items });
  } catch (error) {
    next(error);
  }
};

export const clearCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (cart) {
      cart.items = [];
      await cart.save();
    }
    res.status(200).json({ success: true, items: [] });
  } catch (error) {
    next(error);
  }
};
