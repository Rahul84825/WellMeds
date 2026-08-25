import { CheckoutSession } from "../models/CheckoutSession.js";
import { Cart } from "../models/Cart.js";
import { Prescription } from "../models/Prescription.js";
import {
  normalizeRxItems,
  evaluatePrescriptionCartMatch,
  findMatchingApprovedPrescriptions,
  evaluateAllUserPrescriptions,
} from "../services/cartMatchingEngine.js";

const LIVE_SESSION_STATUSES = ["ACTIVE", "LOCKED", "PENDING_VERIFICATION", "VERIFIED", "PAYMENT_PENDING"];
const CART_LOCKED_STATUSES = ["LOCKED", "PENDING_VERIFICATION"];

const findLatestLiveSession = (userId, populatePrescription = false) => {
  let query = CheckoutSession.findOne({
    user: userId,
    status: { $in: LIVE_SESSION_STATUSES },
  }).sort({ updatedAt: -1 });
  if (populatePrescription) query = query.populate("prescription");
  return query;
};

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
    let session = await findLatestLiveSession(userId, true);

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
        matchingPrescriptions: [],
      });
    }

    // Filter & normalize Rx items from current cart using matching engine
    const rxCartItems = normalizeRxItems(cart.items);

    if (rxCartItems.length === 0) {
      return res.status(200).json({
        success: true,
        requiresRx: false,
        rxStatus: "NOT_REQUIRED",
        isEligible: true,
        message: "No prescription required for current cart items.",
        prescription: null,
        matchingPrescriptions: [],
      });
    }

    // Fetch all user prescriptions
    const userPrescriptions = await Prescription.find({ user: userId }).sort({ createdAt: -1 });

    // Evaluate all prescriptions against current cart
    const allEvaluated = evaluateAllUserPrescriptions(userPrescriptions, rxCartItems);

    // Find all approved prescriptions matching current cart
    const matchingApproved = findMatchingApprovedPrescriptions(userPrescriptions, rxCartItems);

    // Check CheckoutSession status
    let session = await findLatestLiveSession(userId, true);

    if (session) {
      await checkExpiry(session);
      if (session.status === "EXPIRED") {
        session = null;
      }
    }

    let targetPrescription = cart.prescription || (session ? session.prescription : null);

    // If target prescription is set on cart, evaluate it
    let rxStatus = "Prescription Required";
    let isEligible = false;
    let lockReason = "";
    let reason = "";

    if (targetPrescription) {
      const evalResult = evaluatePrescriptionCartMatch(targetPrescription, rxCartItems);

      if (targetPrescription.status === "Approved") {
        if (evalResult.isMatch) {
          rxStatus = "Verified";
          isEligible = true;
          reason = "An approved prescription matching your current cart is selected.";
        } else {
          rxStatus = "Needs Re-verification";
          isEligible = false;
          reason = evalResult.reason || "Your cart items or quantities have changed since your prescription was approved.";
        }
      } else if (
        targetPrescription.status === "Pending Review" ||
        targetPrescription.status === "Under Verification"
      ) {
        const pendingEvalResult = evaluatePrescriptionCartMatch(targetPrescription, rxCartItems, { requireApproved: false });
        if (pendingEvalResult.isMatch) {
          rxStatus = "Pending Verification";
          isEligible = false;
          lockReason = "Prescription is under pharmacist verification. Please wait.";
        } else {
          rxStatus = "Needs Re-verification";
          isEligible = false;
          reason = pendingEvalResult.reason || "Your cart items have changed since uploading your prescription.";
        }
      } else if (targetPrescription.status === "Rejected") {
        rxStatus = "Rejected";
        isEligible = false;
        reason = targetPrescription.adminNotes || "Your prescription verification was declined by our pharmacist.";
      }
    } else if (matchingApproved.length > 0) {
      // If matching approved prescription(s) exist but user hasn't explicitly selected one yet
      rxStatus = "Prescription Required";
      isEligible = false;
      reason = `${matchingApproved.length} approved prescription(s) matching your current cart were found. Please select one or upload a new one.`;
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
            createdAt: targetPrescription.createdAt,
          }
        : null,
      matchingPrescriptions: matchingApproved.map((m) => ({
        _id: m.prescription._id,
        name: m.prescription.name,
        fileUrl: m.prescription.fileUrl,
        createdAt: m.prescription.createdAt,
        approvedAt: m.prescription.approvedAt,
        status: m.prescription.status,
        matchType: m.matchType,
        reason: m.reason,
      })),
      allPrescriptions: allEvaluated,
    });
  } catch (error) {
    next(error);
  }
};

export const getSessionStatus = async (req, res, next) => {
  try {
    const userId = req.user._id;

    let session = await findLatestLiveSession(userId, true);

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

    const paymentSession = await CheckoutSession.exists({
      user: userId,
      status: "PAYMENT_PENDING",
      isLocked: true,
      expiresAt: { $gt: new Date() },
    });
    if (paymentSession) {
      return res.status(409).json({
        success: false,
        code: "PAYMENT_IN_PROGRESS",
        message: "Payment is currently processing. Please wait for its result before modifying your cart.",
      });
    }

    // Only an in-progress prescription review can be cancelled to modify a
    // cart. A payment lock must be released by the payment lifecycle, not by
    // a generic cart endpoint.
    const session = await CheckoutSession.findOne({
      user: userId,
      status: { $in: CART_LOCKED_STATUSES },
      isLocked: true,
      expiresAt: { $gt: new Date() },
    }).sort({ updatedAt: -1 });

    if (session) {
      session.status = "CANCELLED";
      session.isLocked = false;
      session.lockReason = "Cancelled by user to modify cart.";
      await session.save();
    }

    // Reset prescription link only when a verification lock was actually
    // cancelled. Calling this endpoint against an unlocked cart is a no-op.
    const cart = await Cart.findOne({ user: userId });
    if (cart && session) {
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

// Release only a payment lock that the same customer has dismissed or whose
// gateway attempt failed. The verified prescription remains linked to the cart.
export const releasePaymentLock = async (req, res, next) => {
  try {
    const session = await CheckoutSession.findOne({
      user: req.user._id,
      status: "PAYMENT_PENDING",
      isLocked: true,
    }).sort({ updatedAt: -1 });

    if (!session) {
      return res.status(200).json({ success: true, isLocked: false, status: "ACTIVE" });
    }

    session.status = session.prescription ? "VERIFIED" : "ACTIVE";
    session.isLocked = false;
    session.lockReason = "Payment attempt ended. Cart is available for checkout again.";
    session.expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await session.save();

    res.status(200).json({ success: true, isLocked: false, status: session.status });
  } catch (error) {
    next(error);
  }
};
