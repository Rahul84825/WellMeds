import { Order } from "../models/Order.js";
import { Product } from "../models/Product.js";
import { Coupon } from "../models/Coupon.js";
import { CouponUsage } from "../models/CouponUsage.js";
import { Notification } from "../models/Notification.js";
import { Cart } from "../models/Cart.js";
import { WebhookLog } from "../models/WebhookLog.js";
import { Transaction } from "../models/Transaction.js";
import { sendOrderStatusEmail } from "../services/emailService.js";

// Helper to compute order details from product database prices
const computeOrderTotals = async (items, couponCode, userId) => {
  let subtotal = 0;
  let orderRequiresRx = false;
  const validatedItems = [];

  for (const item of items) {
    const product = await Product.findById(item.product || item.id);
    if (!product) {
      throw new Error(`Product not found: ${item.name || item.product || item.id}`);
    }
    if (!product.inStock) {
      throw new Error(`Product is out of stock: ${product.name}`);
    }
    if (product.requiresRx || product.isPrescriptionRequired) {
      orderRequiresRx = true;
    }

    const itemPrice = product.price;
    subtotal += itemPrice * item.quantity;

    validatedItems.push({
      product: product._id,
      name: product.name,
      quantity: item.quantity,
      price: itemPrice,
    });
  }

  let shipping = subtotal === 0 ? 0 : subtotal >= 499 ? 0 : 49;
  let discountAmount = 0;
  let couponObj = null;

  if (couponCode) {
    couponObj = await Coupon.findOne({ code: couponCode.toUpperCase() });
    if (!couponObj) {
      throw new Error("Invalid coupon code");
    }
    if (couponObj.status !== "Active") {
      throw new Error("This coupon is inactive");
    }
    const now = new Date();
    if (couponObj.startDate && couponObj.startDate > now) {
      throw new Error("This coupon is not active yet");
    }
    if (couponObj.expiryDate && couponObj.expiryDate < now) {
      throw new Error("This coupon has expired");
    }
    const minOrder = couponObj.minimumOrder || 0;
    if (subtotal < minOrder) {
      throw new Error(`Minimum order value of ₹${minOrder} is required for this coupon`);
    }
    if (couponObj.usageLimit !== null && couponObj.usedCount >= couponObj.usageLimit) {
      throw new Error("Coupon usage limit reached");
    }
    const userUsageCount = await CouponUsage.countDocuments({ coupon: couponObj._id, user: userId });
    if (userUsageCount >= couponObj.perUserLimit) {
      throw new Error("You have already used this coupon");
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

  const tax = subtotal * 0.12;
  const finalAmount = Math.max(0, subtotal - discountAmount + shipping + tax);

  return {
    subtotal,
    shipping,
    tax,
    discountAmount,
    finalAmount,
    orderRequiresRx,
    validatedItems,
    couponObj,
  };
};

// Create Razorpay Order & Save DRAFT Order in DB
export const createRazorpayOrder = async (req, res, next) => {
  const { items, couponCode, customer, email, shippingAddress, rxFile, requiresRx } = req.body;

  try {
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: "Order items are required" });
    }

    const totals = await computeOrderTotals(items, couponCode, req.user._id);

    // Initialise Razorpay Order
    let razorpayOrder;
    if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
      const Razorpay = (await import("razorpay")).default;
      const razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
      });

      const options = {
        amount: Math.round(totals.finalAmount * 100), // paise
        currency: "INR",
        receipt: `rcpt_${Math.floor(Math.random() * 1000000)}`,
      };

      razorpayOrder = await razorpay.orders.create(options);
    } else {
      console.warn("Razorpay credentials missing. Generating dev mock order...");
      razorpayOrder = {
        id: `mock_order_${Math.floor(100000 + Math.random() * 900000)}`,
        amount: Math.round(totals.finalAmount * 100),
        currency: "INR",
      };
    }

    // Save DRAFT Order in DB
    const orderId = `ord-${Math.floor(1000 + Math.random() * 9000)}`;
    const timeline = [
      { status: "Order Created", message: "Draft order has been initialized on checkout click.", timestamp: new Date() },
      { status: "Payment Pending", message: "Razorpay payment checkout session created.", timestamp: new Date() },
    ];

    await Order.create({
      orderId,
      user: req.user._id,
      customer: customer || req.user.name,
      email: email || req.user.email,
      items: totals.validatedItems,
      coupon: totals.couponObj ? totals.couponObj._id : null,
      couponCode: totals.couponObj ? totals.couponObj.code : null,
      discountAmount: totals.discountAmount,
      subtotal: totals.subtotal,
      shipping: totals.shipping,
      tax: totals.tax,
      total: totals.finalAmount,
      finalAmount: totals.finalAmount,
      requiresRx: totals.orderRequiresRx,
      rxUploaded: totals.orderRequiresRx,
      rxFile: rxFile || null,
      shippingAddress: shippingAddress || "N/A",
      paymentMethod: "card",
      paymentStatus: "Pending",
      status: "Pending", // Draft state
      razorpayOrderId: razorpayOrder.id,
      timeline,
    });

    res.status(200).json({
      success: true,
      razorpayOrder,
      subtotal: totals.subtotal,
      shipping: totals.shipping,
      tax: totals.tax,
      discountAmount: totals.discountAmount,
      finalAmount: totals.finalAmount,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Complete/Finalise Order (Frontend Callback Handler)
export const placeOrder = async (req, res, next) => {
  const orderData = req.body;

  try {
    const {
      items,
      couponCode,
      shippingAddress,
      paymentMethod,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    } = orderData;

    // Check if order was already completed (Idempotency)
    if (paymentMethod !== "cod" && razorpayOrderId) {
      const existingOrder = await Order.findOne({ razorpayOrderId });
      if (existingOrder) {
        if (existingOrder.paymentStatus === "Paid") {
          return res.status(200).json({ success: true, order: existingOrder });
        }
        
        // Complete the existing draft order
        if (razorpayOrderId.startsWith("mock_order_")) {
          console.warn("Dev mode fallback: verified payment signature bypass");
        } else {
          const crypto = await import("crypto");
          const hmac = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET);
          hmac.update(razorpayOrderId + "|" + razorpayPaymentId);
          const generatedSignature = hmac.digest("hex");

          if (generatedSignature !== razorpaySignature) {
            return res.status(400).json({ success: false, message: "Payment signature validation failed." });
          }
        }

        existingOrder.paymentStatus = "Paid";
        existingOrder.status = existingOrder.requiresRx ? "Prescription Review" : "Confirmed";
        existingOrder.razorpayPaymentId = razorpayPaymentId;
        existingOrder.razorpaySignature = razorpaySignature;

        // Timeline Updates
        existingOrder.timeline.push(
          { status: "Payment Captured", message: `Transaction verified via callback: ${razorpayPaymentId}`, timestamp: new Date() }
        );
        if (existingOrder.requiresRx) {
          existingOrder.timeline.push(
            { status: "Prescription Uploaded", message: "Rx prescription document linked.", timestamp: new Date() },
            { status: "Prescription Under Review", message: "Pharmacist verification queue.", timestamp: new Date() }
          );
        } else {
          existingOrder.timeline.push(
            { status: "Confirmed", message: "Order has been confirmed and is being packed.", timestamp: new Date() }
          );
        }

        await existingOrder.save();

        // Create transaction logs
        await Transaction.findOneAndUpdate(
          { razorpayOrderId },
          {
            paymentId: razorpayPaymentId,
            orderId: existingOrder.orderId,
            paymentMethod: "card",
            amount: existingOrder.total,
            currency: "INR",
            status: "Captured",
            webhookProcessedTime: new Date(),
          },
          { upsert: true, new: true }
        );

        // Record Coupon Usage
        if (existingOrder.couponCode) {
          const coupon = await Coupon.findOne({ code: existingOrder.couponCode });
          if (coupon) {
            await CouponUsage.create({
              coupon: coupon._id,
              user: req.user._id,
              order: existingOrder._id,
              discountAmount: existingOrder.discountAmount,
            });
            coupon.usedCount += 1;
            await coupon.save();
          }
        }

        // Clear Cart (cart document itself remains)
        const cart = await Cart.findOne({ user: req.user._id });
        if (cart) {
          cart.items = [];
          cart.prescription = null;
          cart.prescriptionStatus = "Pending";
          await cart.save();
        }

        // Trigger Notification
        await Notification.create({
          user: req.user._id,
          title: "Order Placed Successfully",
          message: `Your order "${existingOrder.orderId}" has been confirmed!`,
          type: "order",
          link: "/orders",
        });

        // Email
        try {
          await sendOrderStatusEmail(existingOrder.email, existingOrder.customer, existingOrder.orderId, existingOrder.status);
        } catch (err) {
          console.warn("Order email notification failed:", err.message);
        }

        return res.status(200).json({ success: true, order: existingOrder });
      }
    }

    // Cash on Delivery direct placement
    if (paymentMethod === "cod") {
      if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ success: false, message: "Order items are required" });
      }
      const totals = await computeOrderTotals(items, couponCode, req.user._id);

      const orderId = `ord-${Math.floor(1000 + Math.random() * 9000)}`;
      const timeline = [
        { status: "Order Created", message: "COD order registered successfully.", timestamp: new Date() },
      ];
      if (totals.orderRequiresRx) {
        timeline.push(
          { status: "Prescription Uploaded", message: "Prescription linked.", timestamp: new Date() },
          { status: "Prescription Under Review", message: "Pharmacist verification queue.", timestamp: new Date() }
        );
      } else {
        timeline.push(
          { status: "Confirmed", message: "COD order confirmed and is being packed.", timestamp: new Date() }
        );
      }

      const order = await Order.create({
        orderId,
        user: req.user._id,
        customer: req.user.name,
        email: req.user.email,
        items: totals.validatedItems,
        coupon: totals.couponObj ? totals.couponObj._id : null,
        couponCode: totals.couponObj ? totals.couponObj.code : null,
        discountAmount: totals.discountAmount,
        subtotal: totals.subtotal,
        shipping: totals.shipping,
        tax: totals.tax,
        total: totals.finalAmount,
        finalAmount: totals.finalAmount,
        requiresRx: totals.orderRequiresRx,
        rxUploaded: totals.orderRequiresRx,
        rxFile: orderData.rxFile || null,
        shippingAddress,
        paymentMethod,
        paymentStatus: "Pending",
        status: totals.orderRequiresRx ? "Prescription Review" : "Confirmed",
        timeline,
      });

      // Record Coupon Usage
      if (totals.couponObj) {
        await CouponUsage.create({
          coupon: totals.couponObj._id,
          user: req.user._id,
          order: order._id,
          discountAmount: totals.discountAmount,
        });
        totals.couponObj.usedCount += 1;
        await totals.couponObj.save();
      }

      // Clear Cart
      const cart = await Cart.findOne({ user: req.user._id });
      if (cart) {
        cart.items = [];
        cart.prescription = null;
        cart.prescriptionStatus = "Pending";
        await cart.save();
      }

      // Notification
      await Notification.create({
        user: req.user._id,
        title: "Order Placed Successfully",
        message: `Your COD order "${orderId}" has been registered!`,
        type: "order",
        link: "/orders",
      });

      try {
        await sendOrderStatusEmail(order.email, order.customer, order.orderId, order.status);
      } catch (err) {
        console.warn("COD Order email notification failed:", err.message);
      }

      return res.status(201).json({ success: true, order });
    }

    res.status(400).json({ success: false, message: "Invalid payment configurations." });
  } catch (error) {
    next(error);
  }
};

// Webhook Handler (Authoritative payment processing)
export const handleWebhook = async (req, res, next) => {
  const signature = req.headers["x-razorpay-signature"];
  console.log(`[Webhook] Received webhook signature header: ${signature}`);

  if (!signature) {
    return res.status(400).json({ success: false, message: "Missing Razorpay Webhook signature." });
  }

  let isVerified = false;
  try {
    const crypto = await import("crypto");
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET)
      .update(req.rawBody)
      .digest("hex");

    isVerified = expectedSignature === signature;
  } catch (err) {
    console.error("[Webhook] Verification cryptographic error:", err.message);
  }

  const eventId = req.body.id;
  const eventType = req.body.event;
  const paymentEntity = req.body.payload?.payment?.entity;
  const orderEntity = req.body.payload?.order?.entity;

  const rzpOrderId = paymentEntity?.order_id || orderEntity?.id;
  const rzpPaymentId = paymentEntity?.id;

  // Idempotency check 1: check if webhook event ID was already logged/processed
  const existingLog = await WebhookLog.findOne({ eventId });
  if (existingLog) {
    console.log(`[Webhook] Duplicate event ID detected: ${eventId}. Skipping.`);
    return res.status(200).json({ success: true, message: "Duplicate Webhook skipped." });
  }

  // Idempotency check 2: check if payment ID already successfully processed
  if (rzpPaymentId) {
    const existingPaymentLog = await WebhookLog.findOne({ paymentId: rzpPaymentId, processingStatus: "Success" });
    if (existingPaymentLog) {
      console.log(`[Webhook] Duplicate payment ID detected: ${rzpPaymentId}. Skipping.`);
      return res.status(200).json({ success: true, message: "Duplicate payment webhook skipped." });
    }
  }

  const log = await WebhookLog.create({
    eventId,
    paymentId: rzpPaymentId,
    orderId: rzpOrderId,
    verificationStatus: isVerified ? "Verified" : "Failed",
    processingStatus: "Pending",
    payload: req.body,
  });

  if (!isVerified) {
    log.processingStatus = "Error";
    log.error = "Signature validation failed.";
    await log.save();
    return res.status(400).json({ success: false, message: "Invalid signature verification." });
  }

  try {
    // Process captured or paid webhook events
    if (eventType === "payment.captured" || eventType === "order.paid") {
      const order = await Order.findOne({ razorpayOrderId: rzpOrderId });
      if (!order) {
        log.processingStatus = "Error";
        log.error = `No draft order record found for razorpayOrderId: ${rzpOrderId}`;
        await log.save();
        return res.status(200).json({ success: true, message: "Draft order not found, skipping." });
      }

      // Idempotency check 3: if order is already processed as Paid
      if (order.paymentStatus === "Paid") {
        log.processingStatus = "Duplicate";
        await log.save();
        return res.status(200).json({ success: true, message: "Order was already marked paid." });
      }

      // Complete order parameters
      order.paymentStatus = "Paid";
      order.status = order.requiresRx ? "Prescription Review" : "Confirmed";
      order.razorpayPaymentId = rzpPaymentId;

      // Update Order Timeline
      order.timeline.push(
        { status: "Payment Captured", message: `Payment verified via webhook event: ${rzpPaymentId}`, timestamp: new Date() }
      );
      if (order.requiresRx) {
        order.timeline.push(
          { status: "Prescription Uploaded", message: "Rx prescription document linked.", timestamp: new Date() },
          { status: "Prescription Under Review", message: "Pharmacist verification queue.", timestamp: new Date() }
        );
      } else {
        order.timeline.push(
          { status: "Confirmed", message: "Order confirmed and being prepared.", timestamp: new Date() }
        );
      }

      await order.save();

      // Log Payment Transaction
      await Transaction.findOneAndUpdate(
        { razorpayOrderId: rzpOrderId },
        {
          paymentId: rzpPaymentId,
          orderId: order.orderId,
          paymentMethod: paymentEntity?.method || "card",
          amount: order.total,
          currency: paymentEntity?.currency || "INR",
          status: "Captured",
          webhookProcessedTime: new Date(),
          refundStatus: paymentEntity?.refund_status || null,
        },
        { upsert: true, new: true }
      );

      // Record coupon count
      if (order.couponCode) {
        const coupon = await Coupon.findOne({ code: order.couponCode });
        if (coupon) {
          await CouponUsage.create({
            coupon: coupon._id,
            user: order.user,
            order: order._id,
            discountAmount: order.discountAmount,
          });
          coupon.usedCount += 1;
          await coupon.save();
        }
      }

      // Clear User Cart (maintain document architecture)
      const cart = await Cart.findOne({ user: order.user });
      if (cart) {
        cart.items = [];
        cart.prescription = null;
        cart.prescriptionStatus = "Pending";
        await cart.save();
      }

      // Trigger In-app notifications
      await Notification.create({
        user: order.user,
        title: "Payment Confirmed",
        message: `Your payment was verified via Webhook. Order "${order.orderId}" has been confirmed!`,
        type: "order",
        link: "/orders",
      });

      // Send confirmation email
      try {
        await sendOrderStatusEmail(order.email, order.customer, order.orderId, order.status);
      } catch (err) {
        console.warn("[Webhook] Confirmation email failed:", err.message);
      }

      log.processingStatus = "Success";
      await log.save();
      return res.status(200).json({ success: true, message: "Webhook processed order successfully." });
    }

    // Process failed payments
    if (eventType === "payment.failed") {
      const order = await Order.findOne({ razorpayOrderId: rzpOrderId });
      if (order && order.paymentStatus === "Pending") {
        order.paymentStatus = "Failed";
        order.status = "Cancelled";
        order.timeline.push(
          { status: "Cancelled", message: "Razorpay transaction marked as failed.", timestamp: new Date() }
        );
        await order.save();

        await Notification.create({
          user: order.user,
          title: "Payment Transaction Failed",
          message: `Razorpay payment failed for order ${order.orderId}. Please try checking out again.`,
          type: "order",
          link: "/cart",
        });
      }

      // Log failed transaction
      await Transaction.findOneAndUpdate(
        { razorpayOrderId: rzpOrderId },
        {
          paymentId: rzpPaymentId,
          paymentMethod: paymentEntity?.method || "card",
          amount: paymentEntity?.amount ? paymentEntity.amount / 100 : 0,
          currency: paymentEntity?.currency || "INR",
          status: "Failed",
        },
        { upsert: true, new: true }
      );

      log.processingStatus = "Success";
      await log.save();
      return res.status(200).json({ success: true });
    }

    // Process refunds
    if (eventType === "refund.processed" || eventType === "refund.created") {
      const order = await Order.findOne({ razorpayOrderId: rzpOrderId });
      if (order) {
        order.paymentStatus = "Refunded";
        order.timeline.push(
          { status: "Refunded", message: `Refund process initiated: ${eventType}`, timestamp: new Date() }
        );
        await order.save();
      }

      // Log refund status
      await Transaction.findOneAndUpdate(
        { razorpayOrderId: rzpOrderId },
        {
          status: "Refunded",
          refundStatus: eventType === "refund.processed" ? "processed" : "created",
        }
      );

      log.processingStatus = "Success";
      await log.save();
      return res.status(200).json({ success: true });
    }

    // Unmapped events
    log.processingStatus = "Success";
    await log.save();
    res.status(200).json({ success: true, message: "Event ignored." });
  } catch (error) {
    log.processingStatus = "Error";
    log.error = error.message;
    await log.save();
    res.status(500).json({ success: false, message: error.message });
  }
};

// Check specific order status (Polling endpoint)
export const getOrderStatus = async (req, res, next) => {
  const { razorpayOrderId } = req.params;

  try {
    const order = await Order.findOne({ razorpayOrderId }).populate("user", "name email");
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    res.status(200).json({
      success: true,
      status: order.status,
      paymentStatus: order.paymentStatus,
      orderId: order.orderId,
      order,
    });
  } catch (error) {
    next(error);
  }
};

// Get User's Orders
export const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, orders });
  } catch (error) {
    next(error);
  }
};

// Admin: Get all orders
export const getOrders = async (req, res, next) => {
  try {
    const orders = await Order.find().populate("user", "name email").sort({ createdAt: -1 });
    res.status(200).json({ success: true, orders });
  } catch (error) {
    next(error);
  }
};

// Admin: Update status
export const updateOrderStatus = async (req, res, next) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const order = await Order.findOne({ $or: [{ orderId: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }] });
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    order.status = status;
    // Push status event to order timeline
    order.timeline.push({
      status,
      message: `Order marked as ${status} by system operator.`,
      timestamp: new Date(),
    });

    await order.save();

    // Create in-app Notification
    await Notification.create({
      user: order.user,
      title: `Order Status: ${status}`,
      message: `Your order "${order.orderId}" has been updated to "${status}".`,
      type: "order",
      link: "/orders",
    });

    // Trigger status email
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

// Cancel Order
export const cancelOrder = async (req, res, next) => {
  const { id } = req.params;

  try {
    const order = await Order.findOne({ $or: [{ orderId: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }] });
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

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
    order.paymentStatus = "Cancelled";

    // Push cancelled status event to timeline
    order.timeline.push({
      status: "Cancelled",
      message: "Order was cancelled by the customer.",
      timestamp: new Date(),
    });

    await order.save();

    // Create Notification
    await Notification.create({
      user: order.user,
      title: "Order Cancelled",
      message: `Your order "${order.orderId}" was cancelled.`,
      type: "order",
      link: "/orders",
    });

    res.status(200).json({ success: true, order });
  } catch (error) {
    next(error);
  }
};
