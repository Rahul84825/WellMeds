import { Coupon } from "../models/Coupon.js";
import { CouponUsage } from "../models/CouponUsage.js";
import { Order } from "../models/Order.js";

// Customer: validate coupon
export const validateCouponCode = async (req, res, next) => {
  const { code, subtotal } = req.body;

  try {
    if (!code) {
      return res.status(400).json({ success: false, message: "Coupon code is required" });
    }

    const coupon = await Coupon.findOne({ code: code.toUpperCase() });
    
    if (!coupon) {
      return res.status(404).json({ success: false, message: "Invalid coupon code" });
    }

    // Use canonical status field only
    if (coupon.status !== "Active") {
      return res.status(400).json({ success: false, message: "This coupon is inactive" });
    }

    const now = new Date();
    if (coupon.startDate && coupon.startDate > now) {
      return res.status(400).json({ success: false, message: "This coupon is not active yet" });
    }

    if (coupon.expiryDate && coupon.expiryDate < now) {
      return res.status(400).json({ success: false, message: "This coupon has expired" });
    }

    // Use canonical minimumOrder field only
    const minOrder = coupon.minimumOrder || 0;
    if (subtotal < minOrder) {
      return res.status(400).json({ 
        success: false, 
        message: `Minimum order value of ₹${minOrder} is required for this coupon` 
      });
    }

    // Check global usage limit
    if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({ success: false, message: "Coupon usage limit reached" });
    }

    // Check per-user limit
    const userUsageCount = await CouponUsage.countDocuments({ coupon: coupon._id, user: req.user._id });
    if (userUsageCount >= coupon.perUserLimit) {
      return res.status(400).json({ success: false, message: "You have already used this coupon" });
    }

    // Calculate discount using canonical discountValue field
    const discountVal = coupon.discountValue;
    let discount = 0;
    if (coupon.discountType === "percentage") {
      discount = (subtotal * discountVal) / 100;
      if (coupon.maximumDiscount > 0) {
        discount = Math.min(discount, coupon.maximumDiscount);
      }
    } else {
      discount = Math.min(discountVal, subtotal);
    }

    res.status(200).json({
      success: true,
      message: "Coupon validated successfully",
      coupon: {
        id: coupon._id,
        code: coupon.code,
        name: coupon.name,
        description: coupon.description,
        discountType: coupon.discountType,
        discountValue: discountVal,
        minimumOrder: minOrder,
        maximumDiscount: coupon.maximumDiscount,
        freeDelivery: coupon.freeDelivery
      },
      discountAmount: discount,
      finalAmount: Math.max(0, subtotal - discount)
    });
  } catch (error) {
    next(error);
  }
};

// Fallback compatibility for applyCoupon
export const applyCoupon = async (req, res, next) => {
  return validateCouponCode(req, res, next);
};

// Customer: list active coupons
export const getCoupons = async (req, res, next) => {
  try {
    const now = new Date();
    const coupons = await Coupon.find({
      status: "Active",
      startDate: { $lte: now },
      expiryDate: { $gt: now }
    });
    res.status(200).json({ success: true, coupons });
  } catch (error) {
    next(error);
  }
};

// Admin: Get all coupons with analytics
export const adminGetCoupons = async (req, res, next) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    const totalOrdersCount = await Order.countDocuments();

    const couponsWithAnalytics = await Promise.all(
      coupons.map(async (coupon) => {
        // Query orders that applied this coupon and are successful (not Cancelled)
        const orders = await Order.find({ 
          couponCode: coupon.code,
          status: { $ne: "Cancelled" }
        });

        const totalUses = orders.length;
        const totalDiscountGiven = orders.reduce((sum, order) => sum + (order.discountAmount || 0), 0);
        const revenueGenerated = orders.reduce((sum, order) => sum + (order.finalAmount || order.total || 0), 0);
        const remainingUses = coupon.usageLimit === null ? "Unlimited" : Math.max(0, coupon.usageLimit - totalUses);
        const conversionRate = totalOrdersCount > 0 
          ? parseFloat(((totalUses / totalOrdersCount) * 100).toFixed(1))
          : 0;

        return {
          ...coupon.toObject(),
          id: coupon._id.toString(),
          analytics: {
            totalUses,
            remainingUses,
            revenueGenerated,
            totalDiscountGiven,
            conversionRate
          }
        };
      })
    );

    res.status(200).json({ success: true, coupons: couponsWithAnalytics });
  } catch (error) {
    next(error);
  }
};

// Admin: Create Coupon
export const adminCreateCoupon = async (req, res, next) => {
  const couponData = req.body;

  try {
    const couponExists = await Coupon.findOne({ code: couponData.code.toUpperCase() });
    if (couponExists) {
      return res.status(400).json({ success: false, message: "Coupon code already exists" });
    }

    const coupon = await Coupon.create({
      ...couponData,
      createdBy: req.user._id
    });

    res.status(201).json({ success: true, coupon });
  } catch (error) {
    next(error);
  }
};

// Admin: Update Coupon
export const adminUpdateCoupon = async (req, res, next) => {
  const { id } = req.params;
  const updateData = req.body;

  try {
    const coupon = await Coupon.findById(id);
    if (!coupon) {
      return res.status(404).json({ success: false, message: "Coupon not found" });
    }

    // Update coupon properties
    Object.assign(coupon, updateData);
    await coupon.save();

    res.status(200).json({ success: true, coupon });
  } catch (error) {
    next(error);
  }
};

// Admin: Delete Coupon
export const adminDeleteCoupon = async (req, res, next) => {
  const { id } = req.params;

  try {
    const coupon = await Coupon.findById(id);
    if (!coupon) {
      return res.status(404).json({ success: false, message: "Coupon not found" });
    }

    await coupon.deleteOne();
    res.status(200).json({ success: true, message: "Coupon deleted successfully" });
  } catch (error) {
    next(error);
  }
};

// Aliases for compatibility with customer couponRoutes
export const createCoupon = adminCreateCoupon;
export const deleteCoupon = adminDeleteCoupon;
