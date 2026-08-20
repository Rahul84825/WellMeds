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
        const rxStatus = rx.status;
        if (rxStatus === "Approved") cart.prescriptionStatus = "Approved";
        else if (rxStatus === "Pending Review") cart.prescriptionStatus = "Uploaded";
        else if (rxStatus === "Under Verification") cart.prescriptionStatus = "Under Review";
        else if (rxStatus === "Rejected") cart.prescriptionStatus = "Rejected";
        else if (rxStatus === "Expired") cart.prescriptionStatus = "Expired";
        else cart.prescriptionStatus = "Pending";
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
  const { productId, quantity, variantName, variantId, price } = req.body;

  try {
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    const requestedQuantity = quantity || 1;
    const targetVariant = variantName ? String(variantName).trim() : "";
    const targetVariantId = variantId ? String(variantId).trim() : "";

    // Determine variant stock & price
    let effectiveStock = product.stock;
    let effectivePrice = product.price;

    if (targetVariant && Array.isArray(product.variants) && product.variants.length > 0) {
      const foundVariant = product.variants.find(
        (v) => (targetVariantId && v._id?.toString() === targetVariantId) || v.name?.toLowerCase() === targetVariant.toLowerCase()
      );
      if (foundVariant) {
        effectiveStock = foundVariant.stock !== undefined ? foundVariant.stock : product.stock;
        effectivePrice = foundVariant.sellingPrice !== undefined ? foundVariant.sellingPrice : foundVariant.price;
      }
    }

    if (effectiveStock < requestedQuantity) {
      return res.status(400).json({ 
        success: false, 
        message: `Insufficient stock. Only ${effectiveStock} item(s) available.` 
      });
    }

    let cart = await Cart.findOne({ user: req.user._id }).populate("items.product");
    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }

    const itemIndex = cart.items.findIndex((item) => {
      if (!item || !item.product) return false;
      const pId = item.product._id ? item.product._id.toString() : item.product.toString();
      const itemVar = item.variantName ? String(item.variantName).trim() : "";
      return pId === productId && itemVar.toLowerCase() === targetVariant.toLowerCase();
    });

    if (itemIndex > -1) {
      const newQuantity = cart.items[itemIndex].quantity + requestedQuantity;
      if (newQuantity > effectiveStock) {
        return res.status(400).json({ 
          success: false, 
          message: `Cannot add ${requestedQuantity} items. Total would be ${newQuantity}, but only ${effectiveStock} available.` 
        });
      }
      cart.items[itemIndex].quantity = newQuantity;
      if (targetVariant) {
        cart.items[itemIndex].variantName = targetVariant;
        cart.items[itemIndex].variantId = targetVariantId;
        cart.items[itemIndex].price = effectivePrice;
      }
    } else {
      cart.items.push({
        product: productId,
        quantity: requestedQuantity,
        variantName: targetVariant,
        variantId: targetVariantId,
        price: effectivePrice,
      });
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
  const { productId, quantity, variantName, variantId } = req.body;

  try {
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    let cart = await Cart.findOne({ user: req.user._id }).populate("items.product");
    if (!cart) {
      return res.status(404).json({ success: false, message: "Cart not found" });
    }

    const targetVariant = variantName ? String(variantName).trim().toLowerCase() : "";

    const itemIndex = cart.items.findIndex((item) => {
      if (!item || !item.product) return false;
      const pId = item.product._id ? item.product._id.toString() : item.product.toString();
      const itemVar = item.variantName ? String(item.variantName).trim().toLowerCase() : "";
      if (targetVariant) {
        return pId === productId && itemVar === targetVariant;
      }
      return pId === productId;
    });

    if (itemIndex > -1) {
      if (quantity <= 0) {
        cart.items.splice(itemIndex, 1);
      } else {
        let maxStock = product.stock;
        if (targetVariant && Array.isArray(product.variants)) {
          const found = product.variants.find((v) => v.name?.toLowerCase() === targetVariant);
          if (found && found.stock !== undefined) maxStock = found.stock;
        }
        if (quantity > maxStock) {
          return res.status(400).json({ 
            success: false, 
            message: `Cannot set quantity to ${quantity}. Only ${maxStock} item(s) available.` 
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
  const variantName = req.query.variantName ? String(req.query.variantName).trim().toLowerCase() : "";

  try {
    const cart = await Cart.findOne({ user: req.user._id }).populate("items.product");
    if (cart) {
      cart.items = cart.items.filter((item) => {
        if (!item || !item.product) return false;
        const pId = item.product._id ? item.product._id.toString() : item.product.toString();
        const itemVar = item.variantName ? String(item.variantName).trim().toLowerCase() : "";
        if (variantName) {
          return !(pId === productId && itemVar === variantName);
        }
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
