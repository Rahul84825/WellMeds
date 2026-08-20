import { Order } from "../models/Order.js";
import { Product } from "../models/Product.js";
import { Coupon } from "../models/Coupon.js";
import { CouponUsage } from "../models/CouponUsage.js";
import { Notification } from "../models/Notification.js";
import { Cart } from "../models/Cart.js";
import { WebhookLog } from "../models/WebhookLog.js";
import { Transaction } from "../models/Transaction.js";
import { CheckoutSession } from "../models/CheckoutSession.js";
import {
  sendOrderConfirmation,
  sendOrderStatusUpdate,
  sendOrderCancelled,
  sendOrderStatusEmail,
} from "../services/emailService.js";


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

    let itemPrice = product.price;
    let displayName = product.name;
    const targetVariant = item.variantName ? String(item.variantName).trim() : "";
    const targetVariantId = item.variantId ? String(item.variantId).trim() : "";

    if (targetVariant && Array.isArray(product.variants) && product.variants.length > 0) {
      const foundVariant = product.variants.find(
        (v) => (targetVariantId && v._id?.toString() === targetVariantId) || v.name?.toLowerCase() === targetVariant.toLowerCase()
      );
      if (foundVariant) {
        itemPrice = foundVariant.sellingPrice !== undefined ? foundVariant.sellingPrice : foundVariant.price;
        displayName = `${product.name} - ${foundVariant.name}`;
      }
    }

    subtotal += itemPrice * item.quantity;

    validatedItems.push({
      product: product._id,
      name: displayName,
      quantity: item.quantity,
      price: itemPrice,
      variantName: targetVariant,
      variantId: targetVariantId,
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

  const roundMoney = (num) => Math.round((Number(num) + Number.EPSILON) * 100) / 100;
  const roundedSubtotal = roundMoney(subtotal);
  const roundedDiscountAmount = roundMoney(discountAmount);
  // GST is already included in product prices
  const tax = 0;
  const finalAmount = roundMoney(Math.max(0, roundedSubtotal - roundedDiscountAmount + shipping));

  return {
    subtotal: roundedSubtotal,
    shipping,
    tax,
    discountAmount: roundedDiscountAmount,
    finalAmount,
    orderRequiresRx,
    validatedItems,
    couponObj,
  };
};

/**
 * Shared Idempotent Payment Finalization Function
 * Executed by both placeOrder (client callback signature check) and handleWebhook (Razorpay Webhook).
 * Ensures stock deduction, coupon consumption, cart clearing, and email triggers happen EXACTLY ONCE.
 */
export const finalizeOrderPayment = async (order, razorpayPaymentId, razorpaySignature = "", paymentMethod = "razorpay", source = "callback") => {
  // Idempotency check 1: if order is already marked Paid, return existing order
  if (order.paymentStatus === "Paid") {
    return { success: true, order, duplicate: true };
  }

  // Idempotency check 2: if another order document already processed this razorpayPaymentId, return that paid order
  if (razorpayPaymentId) {
    const existingPaymentOrder = await Order.findOne({ razorpayPaymentId });
    if (existingPaymentOrder && existingPaymentOrder._id.toString() !== order._id.toString()) {
      console.log(`[Order Payment] Payment ID ${razorpayPaymentId} already assigned to order ${existingPaymentOrder.orderId}. Reusing.`);
      return { success: true, order: existingPaymentOrder, duplicate: true };
    }
  }

  order.paymentStatus = "Paid";
  order.status = order.requiresRx ? "Prescription Review" : "Confirmed";
  order.razorpayPaymentId = razorpayPaymentId;
  if (razorpaySignature) {
    order.razorpaySignature = razorpaySignature;
  }

  // Update Order Timeline
  order.timeline.push({
    status: "Payment Captured",
    message: `Payment verified via ${source}: ${razorpayPaymentId}`,
    timestamp: new Date(),
  });

  if (order.requiresRx) {
    order.timeline.push(
      { status: "Prescription Uploaded", message: "Rx prescription document linked.", timestamp: new Date() },
      { status: "Prescription Under Review", message: "Pharmacist verification queue.", timestamp: new Date() }
    );
  } else {
    order.timeline.push(
      { status: "Confirmed", message: "Order confirmed and being prepared for packing.", timestamp: new Date() }
    );
  }

  await order.save();

  // 1. Safely Decrement Product Stock Inventory (if stockQuantity is tracked)
  if (order.items && Array.isArray(order.items)) {
    for (const item of order.items) {
      try {
        const prodId = item.product || item.id;
        if (prodId) {
          const product = await Product.findById(prodId);
          if (product && typeof product.stockQuantity === "number") {
            product.stockQuantity = Math.max(0, product.stockQuantity - (item.quantity || 1));
            if (product.stockQuantity === 0) {
              product.inStock = false;
            }
            await product.save();
          }
        }
      } catch (stockErr) {
        console.warn(`[Inventory] Stock update warning for product ${item.name}:`, stockErr.message);
      }
    }
  }

  // 2. Log Payment Transaction
  await Transaction.findOneAndUpdate(
    { razorpayOrderId: order.razorpayOrderId },
    {
      paymentId: razorpayPaymentId,
      orderId: order.orderId,
      paymentMethod: paymentMethod || "razorpay",
      amount: order.total || order.finalAmount,
      currency: "INR",
      status: "Captured",
      webhookProcessedTime: new Date(),
    },
    { upsert: true, new: true }
  );

  // 3. Record Coupon Usage (Only once upon verified payment)
  if (order.couponCode) {
    const coupon = await Coupon.findOne({ code: order.couponCode });
    if (coupon) {
      const existingUsage = await CouponUsage.findOne({ order: order._id });
      if (!existingUsage) {
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
  }

  // 4. Clear Customer's Active Cart & Archive CheckoutSession
  const cart = await Cart.findOne({ user: order.user });
  if (cart) {
    cart.items = [];
    cart.prescription = null;
    cart.prescriptionStatus = "Pending";
    await cart.save();
  }

  await CheckoutSession.findOneAndUpdate(
    { user: order.user, status: { $ne: "PAYMENT_SUCCESS" } },
    {
      status: "PAYMENT_SUCCESS",
      isLocked: false,
      lockReason: "Order completed successfully.",
    }
  );

  // 5. In-App Notification
  await Notification.create({
    user: order.user,
    title: "Payment Confirmed",
    message: `Your payment was verified. Order "${order.orderId}" has been confirmed!`,
    type: "order",
    link: "/orders",
  });

  // 6. Trigger Itemized Order Confirmation Email
  sendOrderConfirmation(order);

  return { success: true, order, duplicate: false };
};

// Create Razorpay Order & Save DRAFT Order in DB (Exclusive Razorpay Gateway)
export const createRazorpayOrder = async (req, res, next) => {
  const { items, couponCode, customer, email, shippingAddress, rxFile, requiresRx, deliveryCoordinates } = req.body;

  try {
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: "Order items are required" });
    }

    // Optional coordinates capture for shipment tracking
    let checkedCoordinates = null;
    if (deliveryCoordinates && deliveryCoordinates.latitude && deliveryCoordinates.longitude) {
      const lat = parseFloat(deliveryCoordinates.latitude);
      const lng = parseFloat(deliveryCoordinates.longitude);
      if (!isNaN(lat) && !isNaN(lng)) {
        checkedCoordinates = {
          latitude: lat,
          longitude: lng,
        };
      }
    }

    const totals = await computeOrderTotals(items, couponCode, req.user._id);

    // Strict Backend Rx Guard: If order contains Rx products, verify matching approved prescription exists
    let verifiedRxDoc = null;
    if (totals.orderRequiresRx) {
      const { Prescription } = await import("../models/Prescription.js");
      const { Cart } = await import("../models/Cart.js");
      const { CheckoutSession } = await import("../models/CheckoutSession.js");
      const { normalizeRxItems, evaluatePrescriptionCartMatch } = await import("../services/cartMatchingEngine.js");

      // Filter & normalize only items that actually require a prescription
      const rxCartItems = normalizeRxItems(totals.validatedItems);

      // Check user's explicitly linked Cart prescription first
      const userCart = await Cart.findOne({ user: req.user._id }).populate("prescription");
      if (userCart && userCart.prescription) {
        const evalRes = evaluatePrescriptionCartMatch(userCart.prescription, rxCartItems);
        if (evalRes.isMatch) {
          verifiedRxDoc = userCart.prescription;
        }
      }

      // Fallback check: CheckoutSession linked prescription
      if (!verifiedRxDoc) {
        const session = await CheckoutSession.findOne({ user: req.user._id, status: "VERIFIED" }).populate("prescription");
        if (session && session.prescription) {
          const evalRes = evaluatePrescriptionCartMatch(session.prescription, rxCartItems);
          if (evalRes.isMatch) {
            verifiedRxDoc = session.prescription;
          }
        }
      }

      // Final check: find any approved prescription belonging to this user that matches current cart
      if (!verifiedRxDoc) {
        const userApprovedPrescriptions = await Prescription.find({ user: req.user._id, status: "Approved" }).sort({ createdAt: -1 });
        for (const rx of userApprovedPrescriptions) {
          const evalRes = evaluatePrescriptionCartMatch(rx, rxCartItems);
          if (evalRes.isMatch) {
            verifiedRxDoc = rx;
            break;
          }
        }
      }

      if (!verifiedRxDoc) {
        return res.status(400).json({
          success: false,
          message: "Prescription verification required. Your current cart medicines or quantities do not match any approved prescription.",
        });
      }
    }


    // Initialise Razorpay Order Session
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
      console.warn("Razorpay credentials missing in environment. Generating dev fallback session...");
      razorpayOrder = {
        id: `mock_order_${Math.floor(100000 + Math.random() * 900000)}`,
        amount: Math.round(totals.finalAmount * 100),
        currency: "INR",
      };
    }

    // Reuse or create single DRAFT Order document in DB
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
    let existingDraft = await Order.findOne({
      user: req.user._id,
      paymentStatus: "Pending",
      status: "Pending",
      createdAt: { $gte: twoHoursAgo },
    });

    let draftOrder;
    if (existingDraft) {
      existingDraft.customer = customer || req.user.name;
      existingDraft.email = email || req.user.email;
      existingDraft.items = totals.validatedItems;
      existingDraft.coupon = totals.couponObj ? totals.couponObj._id : null;
      existingDraft.couponCode = totals.couponObj ? totals.couponObj.code : null;
      existingDraft.discountAmount = totals.discountAmount;
      existingDraft.subtotal = totals.subtotal;
      existingDraft.shipping = totals.shipping;
      existingDraft.tax = totals.tax;
      existingDraft.total = totals.finalAmount;
      existingDraft.finalAmount = totals.finalAmount;
      existingDraft.requiresRx = totals.orderRequiresRx;
      existingDraft.rxUploaded = totals.orderRequiresRx;
      existingDraft.rxFile = verifiedRxDoc ? verifiedRxDoc.fileUrl : rxFile || null;
      existingDraft.prescription = verifiedRxDoc ? verifiedRxDoc._id : null;
      existingDraft.shippingAddress = shippingAddress || "N/A";
      existingDraft.deliveryCoordinates = checkedCoordinates;
      existingDraft.paymentMethod = "razorpay";
      existingDraft.razorpayOrderId = razorpayOrder.id;
      existingDraft.timeline.push({
        status: "Payment Retry",
        message: `Checkout modal re-opened. Updated Razorpay Session: ${razorpayOrder.id}`,
        timestamp: new Date(),
      });
      draftOrder = await existingDraft.save();
    } else {
      const orderId = `ord-${Math.floor(1000 + Math.random() * 9000)}`;
      const timeline = [
        { status: "Order Created", message: "Draft order initialized on checkout click.", timestamp: new Date() },
        { status: "Payment Pending", message: "Razorpay payment checkout session initialized.", timestamp: new Date() },
      ];

      draftOrder = await Order.create({
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
        rxFile: verifiedRxDoc ? verifiedRxDoc.fileUrl : rxFile || null,
        prescription: verifiedRxDoc ? verifiedRxDoc._id : null,
        shippingAddress: shippingAddress || "N/A",
        deliveryCoordinates: checkedCoordinates,
        paymentMethod: "razorpay",
        paymentStatus: "Pending",
        status: "Pending",
        razorpayOrderId: razorpayOrder.id,
        timeline,
      });
    }



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

// Complete/Finalise Order (Client Signature Verification Callback Handler)
export const placeOrder = async (req, res, next) => {
  const orderData = req.body;

  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = orderData;

    if (!razorpayOrderId || !razorpayPaymentId) {
      return res.status(400).json({ success: false, message: "Razorpay Order ID and Payment ID are required." });
    }

    const existingOrder = await Order.findOne({ razorpayOrderId });
    if (!existingOrder) {
      return res.status(404).json({ success: false, message: "Draft order record not found." });
    }

    if (existingOrder.paymentStatus === "Paid") {
      return res.status(200).json({ success: true, order: existingOrder });
    }

    // Signature Verification
    if (razorpayOrderId.startsWith("mock_order_")) {
      console.warn("Dev mode fallback: payment signature bypass for mock order session");
    } else {
      if (!razorpaySignature) {
        return res.status(400).json({ success: false, message: "Payment signature is missing." });
      }
      const crypto = await import("crypto");
      const hmac = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET);
      hmac.update(razorpayOrderId + "|" + razorpayPaymentId);
      const generatedSignature = hmac.digest("hex");

      if (generatedSignature !== razorpaySignature) {
        return res.status(400).json({ success: false, message: "Payment signature validation failed." });
      }
    }

    // Finalize payment idempotently
    const result = await finalizeOrderPayment(
      existingOrder,
      razorpayPaymentId,
      razorpaySignature,
      "razorpay",
      "client_callback"
    );

    return res.status(200).json({ success: true, order: result.order });
  } catch (error) {
    next(error);
  }
};

// Webhook Handler (Authoritative payment processing via Razorpay Server Events)
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

      // Idempotent finalization of payment
      await finalizeOrderPayment(order, rzpPaymentId, "", paymentEntity?.method || "razorpay", "webhook");

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
          paymentMethod: paymentEntity?.method || "razorpay",
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

// Get User's Orders (Returns completed orders & recent active checkout attempts, excluding abandoned drafts)
export const getMyOrders = async (req, res, next) => {
  try {
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
    const orders = await Order.find({
      user: req.user._id,
      $or: [
        { paymentStatus: { $in: ["Paid", "Refunded", "Failed", "Cancelled"] } },
        { paymentStatus: "Pending", createdAt: { $gte: thirtyMinutesAgo } },
      ],
    }).sort({ createdAt: -1 });

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
    order.timeline.push({
      status,
      message: `Order marked as ${status} by system operator.`,
      timestamp: new Date(),
    });

    await order.save();

    await Notification.create({
      user: order.user,
      title: `Order Status: ${status}`,
      message: `Your order "${order.orderId}" has been updated to "${status}".`,
      type: "order",
      link: "/orders",
    });

    sendOrderStatusUpdate(order, status);

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

    order.timeline.push({
      status: "Cancelled",
      message: "Order was cancelled by the customer.",
      timestamp: new Date(),
    });

    await order.save();

    sendOrderCancelled(order);

    res.status(200).json({ success: true, order });
  } catch (error) {
    next(error);
  }
};
