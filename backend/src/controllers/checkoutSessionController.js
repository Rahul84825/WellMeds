import { CheckoutSession } from "../models/CheckoutSession.js";
import { Cart } from "../models/Cart.js";
import { Prescription } from "../models/Prescription.js";

// Helper to check if session expired and auto-expire it
const checkExpiry = async (session) => {
  if (!session) return null;
  if (session.status !== "PAYMENT_SUCCESS" && session.expiresAt < new Date()) {
    session.status = "EXPIRED";
    session.isLocked = false;
    await session.save();
  }
  return session;
};

export const initSession = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Check existing active/locked session
    let session = await CheckoutSession.findOne({
      user: userId,
      status: { $in: ["LOCKED", "PENDING_VERIFICATION", "VERIFIED", "PAYMENT_PENDING"] },
    }).populate("prescription");

    if (session) {
      await checkExpiry(session);
      if (session.status !== "EXPIRED") {
        return res.status(200).json({
          success: true,
          session,
          isLocked: session.isLocked,
        });
      }
    }

    // Get active cart
    const cart = await Cart.findOne({ user: userId }).populate("items.product");
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Cart is empty.",
      });
    }

    // Compute cart snapshot
    const hasRx = cart.items.some(
      (i) => i.product && (i.product.requiresRx || i.product.isPrescriptionRequired)
    );

    const itemsSnapshot = cart.items.map((i) => ({
      productId: (i.product._id || i.product.id || i.product).toString(),
      name: i.product.name || "",
      quantity: i.quantity,
      price: i.product.price || 0,
      requiresRx: !!(i.product.requiresRx || i.product.isPrescriptionRequired),
    }));

    const subtotal = itemsSnapshot.reduce((acc, i) => acc + i.price * i.quantity, 0);

    const isLocked = hasRx && cart.prescriptionStatus === "Uploaded";
    const status = isLocked ? "PENDING_VERIFICATION" : "ACTIVE";

    session = await CheckoutSession.create({
      user: userId,
      cartSnapshot: {
        items: itemsSnapshot,
        subtotal,
        requiresRx: hasRx,
      },
      prescription: cart.prescription || null,
      status,
      isLocked,
      lockReason: isLocked
        ? "Prescription is under pharmacist verification. Cart is locked."
        : "",
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });

    res.status(200).json({
      success: true,
      session,
      isLocked: session.isLocked,
    });
  } catch (error) {
    next(error);
  }
};

export const getCartRxStatus = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const cart = await Cart.findOne({ user: userId })
      .populate("items.product")
      .populate("prescription");

    if (!cart || !cart.items || cart.items.length === 0) {
      return res.status(200).json({
        success: true,
        requiresRx: false,
        rxStatus: "NOT_REQUIRED",
        isEligible: true,
        message: "Cart is empty.",
        prescription: null,
      });
    }

    // Filter Rx items from current cart
    const rxCartItems = cart.items.filter(
      (item) => item.product && (item.product.requiresRx || item.product.isPrescriptionRequired)
    );

    if (rxCartItems.length === 0) {
      return res.status(200).json({
        success: true,
        requiresRx: false,
        rxStatus: "NOT_REQUIRED",
        isEligible: true,
        message: "No prescription required for current cart items.",
        prescription: null,
      });
    }

    // Cart contains Rx items. Check CheckoutSession status & Prescription status.
    let session = await CheckoutSession.findOne({
      user: userId,
      status: { $in: ["LOCKED", "PENDING_VERIFICATION", "VERIFIED", "PAYMENT_PENDING"] },
    }).populate("prescription");

    if (session) {
      await checkExpiry(session);
      if (session.status === "EXPIRED") {
        session = null;
      }
    }

    // Helper for snapshot matching
    const matchesCartSnapshot = (snapshot) => {
      if (!snapshot || !Array.isArray(snapshot.items)) return false;
      const snapshotItems = snapshot.items;
      if (rxCartItems.length !== snapshotItems.length) return false;

      return rxCartItems.every((cartItem) => {
        const prodId = (cartItem.product._id || cartItem.product.id || cartItem.product).toString();
        const match = snapshotItems.find((s) => s.productId === prodId || s.productId?.toString() === prodId);
        if (!match) return false;
        return match.quantity === cartItem.quantity;
      });
    };

    let targetPrescription = cart.prescription || (session ? session.prescription : null);

    // If cart/session has no linked prescription, check user's prescriptions for a matching one
    if (!targetPrescription) {
      const userPrescriptions = await Prescription.find({ user: userId }).sort({ createdAt: -1 });
      targetPrescription = userPrescriptions.find((rx) => matchesCartSnapshot(rx.cartSnapshot));
    }

    let rxStatus = "Prescription Required";
    let isEligible = false;
    let lockReason = "";
    let reason = "";

    if (targetPrescription) {
      const isSnapshotValid = matchesCartSnapshot(targetPrescription.cartSnapshot);

      if (targetPrescription.status === "Approved") {
        if (isSnapshotValid) {
          rxStatus = "Verified";
          isEligible = true;
        } else {
          rxStatus = "Needs Re-verification";
          isEligible = false;
          reason = "Your cart items or quantities have changed since your prescription was approved. Re-verification is required.";
        }
      } else if (
        targetPrescription.status === "Pending Review" ||
        targetPrescription.status === "Under Verification"
      ) {
        if (isSnapshotValid) {
          rxStatus = "Pending Verification";
          isEligible = false;
          lockReason = "Prescription is under pharmacist verification. Please wait.";
        } else {
          rxStatus = "Needs Re-verification";
          isEligible = false;
          reason = "Your cart items have changed since uploading your prescription.";
        }
      } else if (targetPrescription.status === "Rejected") {
        rxStatus = "Rejected";
        isEligible = false;
        reason = targetPrescription.adminNotes || "Your prescription verification was declined by our pharmacist.";
      }
    }

    // Sync CheckoutSession if state changed
    if (session && session.status === "VERIFIED" && rxStatus !== "Verified") {
      session.status = "ACTIVE";
      session.isLocked = false;
      await session.save();
    }

    res.status(200).json({
      success: true,
      requiresRx: true,
      rxStatus,
      isEligible,
      reason,
      lockReason,
      sessionStatus: session ? session.status : "ACTIVE",
      prescription: targetPrescription
        ? {
            _id: targetPrescription._id,
            name: targetPrescription.name,
            fileUrl: targetPrescription.fileUrl,
            status: targetPrescription.status,
            adminNotes: targetPrescription.adminNotes,
          }
        : null,
    });
  } catch (error) {
    next(error);
  }
};

export const getSessionStatus = async (req, res, next) => {
  try {
    const userId = req.user._id;

    let session = await CheckoutSession.findOne({
      user: userId,
      status: { $in: ["LOCKED", "PENDING_VERIFICATION", "VERIFIED", "PAYMENT_PENDING"] },
    }).populate("prescription");

    if (session) {
      await checkExpiry(session);
      if (session.status === "EXPIRED") {
        session = null;
      }
    }

    res.status(200).json({
      success: true,
      isLocked: session ? session.isLocked : false,
      status: session ? session.status : "ACTIVE",
      session,
    });
  } catch (error) {
    next(error);
  }
};

export const modifyCart = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Find active locked session
    const session = await CheckoutSession.findOne({
      user: userId,
      status: { $in: ["LOCKED", "PENDING_VERIFICATION", "VERIFIED", "PAYMENT_PENDING"] },
    });

    if (session) {
      session.status = "CANCELLED";
      session.isLocked = false;
      session.lockReason = "Cancelled by user to modify cart.";
      await session.save();
    }

    // Reset prescription link on cart
    const cart = await Cart.findOne({ user: userId });
    if (cart) {
      cart.prescription = null;
      cart.prescriptionStatus = "Pending";
      await cart.save();
    }

    res.status(200).json({
      success: true,
      message: "Cart unlocked. Current prescription verification has been cancelled. Please upload a new prescription for your updated medicines.",
      isLocked: false,
    });
  } catch (error) {
    next(error);
  }
};
