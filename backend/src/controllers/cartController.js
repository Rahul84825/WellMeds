import { Cart } from "../models/Cart.js";
import { Product } from "../models/Product.js";

// Helper to compare a prescription's cart snapshot with current cart items
const isSnapshotMatchingCart = (snapshot, cartItems) => {
  if (!snapshot || !Array.isArray(snapshot.items)) return false;
  
  // Filter RX items from cart
  const rxCart = cartItems
    .filter((item) => item.product && (item.product.requiresRx || item.product.isPrescriptionRequired))
    .map((item) => ({
      productId: (item.product._id || item.product.id || item.product).toString(),
      quantity: item.quantity,
    }));
  
  const snapshotItems = snapshot.items;
  if (rxCart.length !== snapshotItems.length) return false;
  
  return rxCart.every((cartItem) => {
    const match = snapshotItems.find((snapItem) => snapItem.productId === cartItem.productId);
    if (!match) return false;
    return match.quantity === cartItem.quantity;
  });
};

// Helper to clean/validate prescription link in cart
const cleanCartPrescription = async (cart) => {
  if (!cart) return;
  
  // Check if cart contains RX items
  const hasRx = cart.items.some(
    (item) => item.product && (item.product.requiresRx || item.product.isPrescriptionRequired)
  );
  
  if (!hasRx) {
    cart.prescription = null;
    cart.prescriptionStatus = "Pending";
    return;
  }
  
  if (cart.prescription) {
    let rx = cart.prescription;
    if (!rx.status) {
      // Need to populate or it's just an ObjectId
      const { Prescription } = await import("../models/Prescription.js");
      rx = await Prescription.findById(cart.prescription);
    }
    
    if (rx) {
      const isMatching = isSnapshotMatchingCart(rx.cartSnapshot, cart.items);
      if (!isMatching) {
        cart.prescription = null;
        cart.prescriptionStatus = "Pending";
      } else {
        // Sync status
        const rxStatus = rx.status;
        if (rxStatus === "Pending Review") cart.prescriptionStatus = "Uploaded";
        else if (rxStatus === "Under Verification") cart.prescriptionStatus = "Under Review";
        else if (rxStatus === "Approved") cart.prescriptionStatus = "Approved";
        else if (rxStatus === "Rejected") cart.prescriptionStatus = "Rejected";
        else if (rxStatus === "Expired") cart.prescriptionStatus = "Expired";
      }
    } else {
      cart.prescription = null;
      cart.prescriptionStatus = "Pending";
    }
  } else {
    cart.prescriptionStatus = "Pending";
  }
};

export const getCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id })
      .populate("items.product")
      .populate("prescription");
    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }
    
    const originalPrescription = cart.prescription ? cart.prescription._id?.toString() : null;
    const originalStatus = cart.prescriptionStatus;
    
    await cleanCartPrescription(cart);
    
    // Save if changed
    const currentPrescription = cart.prescription ? (cart.prescription._id || cart.prescription).toString() : null;
    if (originalPrescription !== currentPrescription || originalStatus !== cart.prescriptionStatus) {
      await cart.save();
    }
    
    res.status(200).json({ 
      success: true, 
      items: cart.items,
      prescriptionStatus: cart.prescriptionStatus,
      prescription: cart.prescription
    });
  } catch (error) {
    next(error);
  }
};

export const addToCart = async (req, res, next) => {
  const { productId, quantity } = req.body;

  try {
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    const requestedQuantity = quantity || 1;

    if (product.stock < requestedQuantity) {
      return res.status(400).json({ 
        success: false, 
        message: `Insufficient stock. Only ${product.stock} item(s) available.` 
      });
    }

    let cart = await Cart.findOne({ user: req.user._id }).populate("items.product");
    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }

    const itemIndex = cart.items.findIndex((item) => {
      if (!item || !item.product) return false;
      const pId = item.product._id ? item.product._id.toString() : item.product.toString();
      return pId === productId;
    });

    if (itemIndex > -1) {
      const newQuantity = cart.items[itemIndex].quantity + requestedQuantity;
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

    // Refresh and clean prescription status
    const populatedCart = await Cart.findOne({ user: req.user._id }).populate("items.product");
    populatedCart.items = cart.items;
    await cleanCartPrescription(populatedCart);
    await populatedCart.save();

    const updatedCart = await Cart.findOne({ user: req.user._id })
      .populate("items.product")
      .populate("prescription");

    res.status(200).json({ 
      success: true, 
      items: updatedCart ? updatedCart.items : [],
      prescriptionStatus: updatedCart ? updatedCart.prescriptionStatus : "Pending",
      prescription: updatedCart ? updatedCart.prescription : null
    });
  } catch (error) {
    next(error);
  }
};

export const updateQuantity = async (req, res, next) => {
  const { productId, quantity } = req.body;

  try {
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    let cart = await Cart.findOne({ user: req.user._id }).populate("items.product");
    if (!cart) {
      return res.status(404).json({ success: false, message: "Cart not found" });
    }

    const itemIndex = cart.items.findIndex((item) => {
      if (!item || !item.product) return false;
      const pId = item.product._id ? item.product._id.toString() : item.product.toString();
      return pId === productId;
    });

    if (itemIndex > -1) {
      if (quantity <= 0) {
        cart.items.splice(itemIndex, 1);
      } else {
        if (quantity > product.stock) {
          return res.status(400).json({ 
            success: false, 
            message: `Cannot set quantity to ${quantity}. Only ${product.stock} item(s) available.` 
          });
        }
        cart.items[itemIndex].quantity = quantity;
      }
    }

    // Clean prescription status
    await cleanCartPrescription(cart);
    await cart.save();

    const updatedCart = await Cart.findOne({ user: req.user._id })
      .populate("items.product")
      .populate("prescription");

    res.status(200).json({ 
      success: true, 
      items: updatedCart ? updatedCart.items : [],
      prescriptionStatus: updatedCart ? updatedCart.prescriptionStatus : "Pending",
      prescription: updatedCart ? updatedCart.prescription : null
    });
  } catch (error) {
    next(error);
  }
};

export const removeFromCart = async (req, res, next) => {
  const { productId } = req.params;

  try {
    const cart = await Cart.findOne({ user: req.user._id }).populate("items.product");
    if (cart) {
      cart.items = cart.items.filter((item) => {
        if (!item || !item.product) return false;
        const pId = item.product._id ? item.product._id.toString() : item.product.toString();
        return pId !== productId;
      });
      await cleanCartPrescription(cart);
      await cart.save();
    }

    const updatedCart = await Cart.findOne({ user: req.user._id })
      .populate("items.product")
      .populate("prescription");

    res.status(200).json({ 
      success: true, 
      items: updatedCart ? updatedCart.items : [],
      prescriptionStatus: updatedCart ? updatedCart.prescriptionStatus : "Pending",
      prescription: updatedCart ? updatedCart.prescription : null
    });
  } catch (error) {
    next(error);
  }
};

export const clearCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (cart) {
      cart.items = [];
      cart.prescription = null;
      cart.prescriptionStatus = "Pending";
      await cart.save();
    }
    res.status(200).json({ success: true, items: [], prescriptionStatus: "Pending", prescription: null });
  } catch (error) {
    next(error);
  }
};
