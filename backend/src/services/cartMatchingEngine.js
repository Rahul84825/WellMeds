import mongoose from "mongoose";

/**
 * Pure Utility & Matching Engine for Production-Grade Prescription Verification
 * Ensures strict, safe evaluation of prescriptions against current cart items.
 */

/**
 * Normalize Rx items from cart or order payload
 * @param {Array} items 
 * @returns {Array} List of normalized Rx items
 */
export const normalizeRxItems = (items = []) => {
  if (!Array.isArray(items)) return [];

  return items
    .filter((item) => {
      const prod = item.product || item;
      return !!(
        item.requiresRx ||
        item.isRx ||
        prod?.requiresRx ||
        prod?.isPrescriptionRequired
      );
    })
    .map((item) => {
      const prod = item.product && typeof item.product === "object" ? item.product : null;
      const pId = prod ? (prod._id || prod.id)?.toString() : (item.product || item._id || item.id)?.toString();
      
      const name = prod?.name || item.name || "";
      const quantity = Number(item.quantity) || 1;
      const strength = prod?.strength || item.strength || "";
      const packSize = prod?.packSize || item.packSize || "";
      const price = prod?.price || item.price || 0;

      return {
        productId: pId,
        name,
        quantity,
        strength,
        packSize,
        price,
      };
    });
};

/**
 * Evaluates whether a single prescription document matches the target Rx cart items
 * @param {Object} prescription Prescription document from database
 * @param {Array} rxCartItems List of normalized Rx cart items
 * @returns {Object} { isMatch, matchType, reason }
 */
export const evaluatePrescriptionCartMatch = (prescription, rxCartItems = [], { requireApproved = true } = {}) => {
  if (!prescription) {
    return {
      isMatch: false,
      matchType: "NO_MATCH",
      reason: "No prescription document provided.",
    };
  }

  if (requireApproved && prescription.status !== "Approved") {
    return {
      isMatch: false,
      matchType: "NO_MATCH",
      reason: `Prescription status is "${prescription.status}" (must be Approved).`,
    };
  }

  // Determine benchmark items to compare against current cart
  let benchmarkItems = [];

  if (prescription.prescribedItems && Array.isArray(prescription.prescribedItems) && prescription.prescribedItems.length > 0) {
    benchmarkItems = prescription.prescribedItems.map((pItem) => {
      const pId = pItem.product ? (pItem.product._id || pItem.product.id || pItem.product)?.toString() : null;
      return {
        productId: pId,
        name: pItem.name || "",
        quantity: Number(pItem.quantity) || 1,
        strength: pItem.strength || "",
        packSize: pItem.packSize || "",
      };
    });
  } else if (prescription.cartSnapshot && Array.isArray(prescription.cartSnapshot.items)) {
    benchmarkItems = prescription.cartSnapshot.items
      .filter((i) => i.requiresRx !== false)
      .map((i) => ({
        productId: (i.productId || i._id || i.id)?.toString(),
        name: i.name || "",
        quantity: Number(i.quantity) || 1,
        strength: i.strength || "",
        packSize: i.packSize || "",
      }));
  }

  if (benchmarkItems.length === 0) {
    return {
      isMatch: false,
      matchType: "NO_MATCH",
      reason: "Prescription record has no associated Rx medicine items.",
    };
  }

  // 1. Compare item counts
  if (rxCartItems.length !== benchmarkItems.length) {
    return {
      isMatch: false,
      matchType: "CART_MODIFIED",
      reason: `Your cart contains ${rxCartItems.length} Rx item(s), but this prescription covers ${benchmarkItems.length} item(s).`,
    };
  }

  // 2. Compare exact products & quantities
  let exactCount = 0;
  for (const cartItem of rxCartItems) {
    const match = benchmarkItems.find((b) => {
      const idMatch = b.productId && cartItem.productId && b.productId === cartItem.productId;
      const nameMatch = b.name && cartItem.name && b.name.trim().toLowerCase() === cartItem.name.trim().toLowerCase();
      return idMatch || nameMatch;
    });

    if (!match) {
      return {
        isMatch: false,
        matchType: "CART_MODIFIED",
        reason: `Product "${cartItem.name}" in your cart is not covered by this prescription.`,
      };
    }

    if (match.quantity !== cartItem.quantity) {
      return {
        isMatch: false,
        matchType: "CART_MODIFIED",
        reason: `Quantity for "${cartItem.name}" in your cart (${cartItem.quantity}) differs from prescription quantity (${match.quantity}).`,
      };
    }

    exactCount++;
  }

  if (exactCount === rxCartItems.length) {
    return {
      isMatch: true,
      matchType: "EXACT_MATCH",
      reason: "An approved prescription matching your current cart was found.",
    };
  }

  return {
    isMatch: false,
    matchType: "CART_MODIFIED",
    reason: "Cart medicines do not match the approved prescription snapshot.",
  };
};

/**
 * Finds all matching approved prescriptions for a user's current cart
 * @param {Array} userPrescriptions List of user prescription documents
 * @param {Array} rxCartItems Normalized Rx cart items
 * @returns {Array} List of matching prescription objects with match metadata
 */
export const findMatchingApprovedPrescriptions = (userPrescriptions = [], rxCartItems = []) => {
  if (!Array.isArray(userPrescriptions) || userPrescriptions.length === 0) return [];

  const approved = userPrescriptions.filter((rx) => rx && rx.status === "Approved");
  const matchingList = [];

  for (const rx of approved) {
    const evalResult = evaluatePrescriptionCartMatch(rx, rxCartItems);
    if (evalResult.isMatch) {
      matchingList.push({
        prescription: rx,
        matchType: evalResult.matchType,
        reason: evalResult.reason,
      });
    }
  }

  return matchingList;
};

/**
 * Evaluates all prescriptions of a user against current cart and returns detailed annotations
 * @param {Array} userPrescriptions List of all user prescription documents
 * @param {Array} rxCartItems Normalized Rx cart items
 * @returns {Array} Annotated list of prescription evaluation objects
 */
export const evaluateAllUserPrescriptions = (userPrescriptions = [], rxCartItems = []) => {
  if (!Array.isArray(userPrescriptions)) return [];

  return userPrescriptions.map((rx) => {
    const evalResult = evaluatePrescriptionCartMatch(rx, rxCartItems);
    return {
      _id: rx._id,
      id: rx.id || rx._id?.toString(),
      name: rx.name,
      fileUrl: rx.fileUrl,
      fileUrls: rx.fileUrls || [rx.fileUrl],
      status: rx.status,
      createdAt: rx.createdAt,
      approvedAt: rx.approvedAt,
      adminNotes: rx.adminNotes,
      doctorName: rx.doctorName,
      isMatch: evalResult.isMatch,
      matchType: evalResult.matchType,
      reason: evalResult.reason,
    };
  });
};
