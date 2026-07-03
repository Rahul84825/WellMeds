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
    let subtotal = 0;
    let orderRequiresRx = false;
    const validatedItems = [];

    // 1. Validate items and calculate subtotal on the server using database prices
    if (!orderData.items || !Array.isArray(orderData.items) || orderData.items.length === 0) {
      return res.status(400).json({ success: false, message: "Order items are required" });
    }

    for (const item of orderData.items) {
      const product = await Product.findById(item.product || item.id);
      if (!product) {
        return res.status(404).json({ success: false, message: `Product not found` });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({ success: false, message: `Insufficient stock for product ${product.name}` });
      }
      if (product.requiresRx) {
        orderRequiresRx = true;
      }

      const itemPrice = product.price;
      const itemSubtotal = itemPrice * item.quantity;
      subtotal += itemSubtotal;

      validatedItems.push({
        product: product._id,
        name: product.name,
        quantity: item.quantity,
        price: itemPrice,
      });
    }

    // 2. Validate prescription-only status
    if (orderRequiresRx && (!orderData.rxFile || !orderData.rxUploaded)) {
      return res.status(400).json({ 
        success: false, 
        message: "A prescription upload is required for prescription-only medicines." 
      });
    }

    // 3. Calculate shipping on the server (free above ₹499, else ₹49 flat)
    let shipping = subtotal === 0 ? 0 : subtotal >= 499 ? 0 : 49;

    // 4. Validate and apply coupon using server calculated subtotal
    if (orderData.couponCode) {
      couponObj = await Coupon.findOne({ code: orderData.couponCode.toUpperCase() });
      if (!couponObj) {
        return res.status(404).json({ success: false, message: "Invalid coupon code" });
      }

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

      const minOrder = couponObj.minimumOrder || 0;
      if (subtotal < minOrder) {
        return res.status(400).json({ 
          success: false, 
          message: `Minimum order value of ₹${minOrder} is required for this coupon` 
        });
      }

      if (couponObj.usageLimit !== null && couponObj.usedCount >= couponObj.usageLimit) {
        return res.status(400).json({ success: false, message: "Coupon usage limit reached" });
      }

      const userUsageCount = await CouponUsage.countDocuments({ coupon: couponObj._id, user: req.user._id });
      if (userUsageCount >= couponObj.perUserLimit) {
        return res.status(400).json({ success: false, message: "You have already used this coupon" });
      }

      const discountVal = couponObj.discountValue;
      if (couponObj.discountType === "percentage") {
        discountAmount = (subtotal * discountVal) / 100;
        if (couponObj.maximumDiscount > 0) {
          discountAmount = Math.min(discountAmount, couponObj.maximumDiscount);
        }
      } else {
        discountAmount = Math.min(discountVal, subtotal);
      }

      if (couponObj.freeDelivery) {
        shipping = 0;
      }
    }

    // 5. Calculate tax on the server (12% GST)
    const tax = subtotal * 0.12;

    // 6. Calculate final totals on the server
    const finalAmount = Math.max(0, subtotal - discountAmount + shipping + tax);

    // Create the order with backend-computed values
    const order = await Order.create({
      ...orderData,
      orderId,
      user: req.user._id,
      customer: req.user.name,
      email: req.user.email,
      items: validatedItems,
      coupon: couponObj ? couponObj._id : null,
      couponCode: couponObj ? couponObj.code : null,
      discountAmount,
      subtotal,
      shipping,
      tax,
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
    for (const item of validatedItems) {
      const product = await Product.findById(item.product);
      if (product) {
        const newStock = Math.max(0, product.stock - item.quantity);
        let badge = product.badge;
        if (newStock === 0) badge = "Out of Stock";
        else if (newStock <= 10) badge = "Low Stock";

        await Product.findByIdAndUpdate(item.product, {
          stock: newStock,
          badge,
        });
      }
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

    // BOLA Authorization Check: Only the order owner or admin can cancel the order
    if (order.user.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Forbidden: You are not authorized to cancel this order" });
    }

    if (order.status === "Cancelled") {
      return res.status(400).json({ success: false, message: "Order is already cancelled" });
    }

    if (order.status === "Delivered") {
      return res.status(400).json({ success: false, message: "Delivered orders cannot be cancelled" });
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
