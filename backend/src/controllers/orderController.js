import { Order } from "../models/Order.js";
import { Product } from "../models/Product.js";
import { Coupon } from "../models/Coupon.js";
import { CouponUsage } from "../models/CouponUsage.js";
import { sendOrderStatusEmail } from "../services/emailService.js";

export const placeOrder = async (req, res, next) => {
  const orderData = req.body;

  try {
    const orderId = `ord-${Math.floor(1000 + Math.random() * 9000)}`;
    let couponObj = null;
    let discountAmount = 0;

    // Validate Coupon if couponCode is provided
    if (orderData.couponCode) {
      couponObj = await Coupon.findOne({ code: orderData.couponCode.toUpperCase() });
      if (!couponObj) {
        return res.status(404).json({ success: false, message: "Invalid coupon code" });
      }

      // Use canonical status field only
      if (couponObj.status !== "Active") {
        return res.status(400).json({ success: false, message: "This coupon is inactive" });
      }

      const now = new Date();
      if (couponObj.startDate && couponObj.startDate > now) {
        return res.status(400).json({ success: false, message: "This coupon is not active yet" });
      }

      if (couponObj.expiryDate && couponObj.expiryDate < now) {
        return res.status(400).json({ success: false, message: "This coupon has expired" });
      }

      // Use canonical minimumOrder field only
      const minOrder = couponObj.minimumOrder || 0;
      if (orderData.subtotal < minOrder) {
        return res.status(400).json({ 
          success: false, 
          message: `Minimum order value of ₹${minOrder} is required for this coupon` 
        });
      }

      // Check global limit
      if (couponObj.usageLimit !== null && couponObj.usedCount >= couponObj.usageLimit) {
        return res.status(400).json({ success: false, message: "Coupon usage limit reached" });
      }

      // Check per-user limit
      const userUsageCount = await CouponUsage.countDocuments({ coupon: couponObj._id, user: req.user._id });
      if (userUsageCount >= couponObj.perUserLimit) {
        return res.status(400).json({ success: false, message: "You have already used this coupon" });
      }

      // Calculate discount amount using canonical discountValue field
      const discountVal = couponObj.discountValue;
      if (couponObj.discountType === "percentage") {
        discountAmount = (orderData.subtotal * discountVal) / 100;
        if (couponObj.maximumDiscount > 0) {
          discountAmount = Math.min(discountAmount, couponObj.maximumDiscount);
        }
      } else {
        discountAmount = Math.min(discountVal, orderData.subtotal);
      }
    }

    // Recalculate final totals
    const subtotal = parseFloat(orderData.subtotal);
    const shipping = parseFloat(orderData.shipping);
    const tax = parseFloat(orderData.tax);
    const finalAmount = Math.max(0, subtotal - discountAmount + shipping + tax);

    // Validate stock and adjust inventory levels
    // Also check if any product requires Rx
    let orderRequiresRx = false;
    for (const item of orderData.items) {
      const product = await Product.findById(item.product || item.id);
      if (!product) {
        return res.status(404).json({ success: false, message: `Product ${item.name} not found` });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({ success: false, message: `Insufficient stock for product ${item.name}` });
      }
      // Check if this product requires prescription
      if (product.requiresRx) {
        orderRequiresRx = true;
      }
    }

    // Create the order with backend-computed requiresRx status
    const order = await Order.create({
      ...orderData,
      orderId,
      user: req.user._id,
      customer: req.user.name,
      email: req.user.email,
      items: orderData.items.map((item) => ({
        product: item.product || item.id,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
      })),
      coupon: couponObj ? couponObj._id : null,
      couponCode: couponObj ? couponObj.code : null,
      discountAmount,
      total: finalAmount, // matches legacy 'total' field
      finalAmount, // matches new extended 'finalAmount' field
      status: orderRequiresRx ? "Prescription Review" : "Processing",
    });

    // Record Coupon Usage and increment count
    if (couponObj) {
      await CouponUsage.create({
        coupon: couponObj._id,
        user: req.user._id,
        order: order._id,
        discountAmount: discountAmount,
      });

      couponObj.usedCount += 1;
      await couponObj.save();
    }

    // Deduct stock levels
    for (const item of orderData.items) {
      const productId = item.product || item.id;
      const product = await Product.findById(productId);
      
      const newStock = Math.max(0, product.stock - item.quantity);
      let badge = product.badge;
      if (newStock === 0) badge = "Out of Stock";
      else if (newStock <= 10) badge = "Low Stock";

      await Product.findByIdAndUpdate(productId, {
        stock: newStock,
        badge,
      });
    }

    // Send order confirmation email
    try {
      await sendOrderStatusEmail(order.email, order.customer, order.orderId, order.status);
    } catch (err) {
      console.warn("Order status email failed:", err.message);
    }

    res.status(201).json({ success: true, order });
  } catch (error) {
    next(error);
  }
};

export const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, orders });
  } catch (error) {
    next(error);
  }
};

export const getOrders = async (req, res, next) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, orders });
  } catch (error) {
    next(error);
  }
};

export const updateOrderStatus = async (req, res, next) => {
  const { id } = req.params; // orderId or _id
  const { status } = req.body;

  try {
    // Find by custom orderId or Mongoose _id
    const order = await Order.findOne({ $or: [{ orderId: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }] });
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    order.status = status;
    await order.save();

    // Trigger status email notification
    try {
      await sendOrderStatusEmail(order.email, order.customer, order.orderId, order.status);
    } catch (err) {
      console.warn("Order status update email failed:", err.message);
    }

    res.status(200).json({ success: true, order });
  } catch (error) {
    next(error);
  }
};

export const cancelOrder = async (req, res, next) => {
  const { id } = req.params;

  try {
    const order = await Order.findOne({ $or: [{ orderId: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }] });
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    if (order.status === "Cancelled") {
      return res.status(400).json({ success: false, message: "Order is already cancelled" });
    }

    order.status = "Cancelled";
    await order.save();

    // Replenish stock levels
    for (const item of order.items) {
      const product = await Product.findById(item.product);
      if (product) {
        const newStock = product.stock + item.quantity;
        let badge = product.badge;
        if (newStock > 10 && (badge === "Out of Stock" || badge === "Low Stock")) {
          badge = "";
        }
        await Product.findByIdAndUpdate(item.product, {
          stock: newStock,
          badge,
        });
      }
    }

    // Send order cancel email
    try {
      await sendOrderStatusEmail(order.email, order.customer, order.orderId, "Cancelled");
    } catch (err) {
      console.warn("Cancel email notification failed:", err.message);
    }

    res.status(200).json({ success: true, order });
  } catch (error) {
    next(error);
  }
};
