import { DeliveryRule } from "../models/DeliveryRule.js";

// @desc    Calculate dynamic delivery charge
// @route   POST /api/delivery-rules/calculate
// @access  Public
export const calculateDeliveryFee = async (req, res) => {
  try {
    const { subtotal = 0, pincode, state } = req.body;
    const amount = Number(subtotal) || 0;

    // Fetch active delivery rules sorted by priority descending
    const rules = await DeliveryRule.find({ isActive: true }).sort({ priority: -1 });

    // Free delivery threshold check (default: orders above ₹500 get free shipping)
    const defaultFreeThreshold = 500;
    const defaultFlatFee = 50;

    if (rules.length === 0) {
      const charge = amount >= defaultFreeThreshold ? 0 : defaultFlatFee;
      return res.json({
        success: true,
        charge,
        freeDeliveryThreshold: defaultFreeThreshold,
        message: charge === 0 ? "Eligible for Free Delivery" : `Standard delivery charge ₹${charge}`,
      });
    }

    // Evaluate rules
    let appliedCharge = defaultFlatFee;
    let threshold = defaultFreeThreshold;

    for (const rule of rules) {
      if (rule.freeDeliveryThreshold && amount >= rule.freeDeliveryThreshold) {
        appliedCharge = 0;
        threshold = rule.freeDeliveryThreshold;
        break;
      }
      if (amount >= rule.minOrderAmount && (!rule.maxOrderAmount || amount <= rule.maxOrderAmount)) {
        appliedCharge = rule.charge;
        if (rule.freeDeliveryThreshold) threshold = rule.freeDeliveryThreshold;
        break;
      }
    }

    res.json({
      success: true,
      charge: appliedCharge,
      freeDeliveryThreshold: threshold,
      message: appliedCharge === 0 ? "Eligible for Free Delivery" : `Pan-India Express Delivery ₹${appliedCharge}`,
    });
  } catch (error) {
    console.error("Calculate delivery fee error:", error);
    res.status(500).json({ success: false, message: "Server error calculating delivery fee", charge: 0 });
  }
};

// @desc    Get all delivery rules (Admin)
// @route   GET /api/delivery-rules
// @access  Private/Admin
export const getDeliveryRules = async (req, res) => {
  try {
    const rules = await DeliveryRule.find().sort({ priority: -1, createdAt: -1 });
    res.json({ success: true, count: rules.length, rules });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error fetching delivery rules" });
  }
};

// @desc    Create a delivery rule (Admin)
// @route   POST /api/delivery-rules
// @access  Private/Admin
export const createDeliveryRule = async (req, res) => {
  try {
    const rule = await DeliveryRule.create(req.body);
    res.status(201).json({ success: true, message: "Delivery rule created", rule });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
