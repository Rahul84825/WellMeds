import { CheckoutSession } from "../models/CheckoutSession.js";

/**
 * Middleware to enforce backend cart locking.
 * Rejects cart modifications with 409 Conflict if an active locked checkout session exists.
 */
export const checkCartLock = async (req, res, next) => {
  try {
    if (!req.user || !req.user._id) {
      return next();
    }

    const session = await CheckoutSession.findOne({
      user: req.user._id,
      status: { $in: ["LOCKED", "PENDING_VERIFICATION", "VERIFIED", "PAYMENT_PENDING"] },
      expiresAt: { $gt: new Date() },
    }).sort({ updatedAt: -1 });

    if (session && session.isLocked && session.status !== "VERIFIED") {
      let msg = "Your cart is currently locked because your prescription is under pharmacist verification.";
      if (session.status === "PAYMENT_PENDING") {
        msg = "Payment is currently processing. Cart items cannot be modified.";
      }

      return res.status(409).json({
        success: false,
        code: "CART_LOCKED",
        message: msg,
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
