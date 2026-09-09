import { CheckoutSession } from "../models/CheckoutSession.js";
import { Cart } from "../models/Cart.js";

/**
 * Middleware to enforce backend cart locking.
 * Rejects cart modifications with 409 Conflict if an active locked cart or checkout session exists.
 */
export const checkCartLock = async (req, res, next) => {
  try {
    if (!req.user || !req.user._id) {
      return next();
    }

    // 1. Check Cart model lock state
    const cart = await Cart.findOne({ user: req.user._id });
    if (cart && cart.isLocked) {
      const isDirect = cart.cartSource === "DIRECT_UPLOAD";
      const msg = isDirect
        ? "Items in this cart were prepared by our pharmacy team and cannot be modified."
        : "Your cart is currently locked under prescription verification.";

      return res.status(409).json({
        success: false,
        code: "CART_LOCKED",
        message: cart.lockReason || msg,
        status: cart.prescriptionStatus || "Locked",
        cartSource: cart.cartSource || "NORMAL",
        isPrescriptionCart: true,
      });
    }

    // 2. Check active CheckoutSession lock state (LOCKED, PENDING_VERIFICATION, VERIFIED, PAYMENT_PENDING)
    const session = await CheckoutSession.findOne({
      user: req.user._id,
      status: { $in: ["LOCKED", "PENDING_VERIFICATION", "VERIFIED", "PAYMENT_PENDING"] },
      expiresAt: { $gt: new Date() },
    }).sort({ updatedAt: -1 });

    if (session && session.isLocked) {
      let msg = "Your cart is currently locked.";
      if (session.status === "PENDING_VERIFICATION") {
        msg = "Your cart is currently locked because your prescription is under pharmacist verification.";
      } else if (session.status === "VERIFIED") {
        msg = "Your prescription has been verified. Cart medicines are locked for checkout and cannot be modified.";
      } else if (session.status === "PAYMENT_PENDING") {
        msg = "Payment is currently processing. Cart items cannot be modified.";
      }

      return res.status(409).json({
        success: false,
        code: "CART_LOCKED",
        message: session.lockReason || msg,
        status: session.status,
        lockReason: session.lockReason || msg,
        sessionId: session._id,
      });
    }

    next();
  } catch (error) {
    console.error("Error in checkCartLock middleware:", error);
    next(error);
  }
};

