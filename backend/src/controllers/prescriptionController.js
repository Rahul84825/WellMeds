import mongoose from "mongoose";
import { Prescription } from "../models/Prescription.js";
import { uploadToCloudinary } from "../services/cloudinaryService.js";
import {
  sendPrescriptionReceivedCustomer,
  sendPrescriptionReceivedAdmin,
  sendPrescriptionCartReady,
  sendPrescriptionApproved,
  sendPrescriptionRejected,
  sendPrescriptionReviewEmail,
} from "../services/emailService.js";
import { Notification } from "../models/Notification.js";
import { Cart } from "../models/Cart.js";
import { Product } from "../models/Product.js";
import { CheckoutSession } from "../models/CheckoutSession.js";
import {
  normalizeRxItems,
  evaluatePrescriptionCartMatch,
} from "../services/cartMatchingEngine.js";

// Helper to escape regex special characters
const escapeRegex = (string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

// ─────────────────────────────────────────────
// PATIENT — Upload a new prescription
// ─────────────────────────────────────────────
export const uploadPrescription = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const paymentInProgress = await CheckoutSession.exists({
      user: userId,
      status: "PAYMENT_PENDING",
      isLocked: true,
      expiresAt: { $gt: new Date() },
    });
    if (paymentInProgress) {
      return res.status(409).json({
        success: false,
        code: "PAYMENT_IN_PROGRESS",
        message: "Payment is currently processing. Please wait for its result before changing prescription details.",
      });
    }

    const files = req.files || (req.file ? [req.file] : []);
    if (files.length === 0) {
      return res.status(400).json({ success: false, message: "Please select a prescription document to upload" });
    }

    // Upload all files to Cloudinary
    const uploadPromises = files.map((file) => uploadToCloudinary(file.path, "prescriptions"));
    const fileUrls = await Promise.all(uploadPromises);
    const fileNames = files.map((f) => f.originalname.replace(/[^a-zA-Z0-9._-]/g, ""));

    const initialTimeline = [
      {
        status: "Pending Review",
        title: "Prescription Uploaded",
        description: "Your prescription file has been uploaded successfully and queued for pharmacist review.",
        timestamp: new Date(),
      },
    ];

    // Server-Authoritative Source Evaluation
    // Never trust client source or client cartSnapshot. Verify against MongoDB Cart.
    const requestedSource = req.body.source === "CHECKOUT_UPLOAD" ? "CHECKOUT_UPLOAD" : "DIRECT_UPLOAD";

    let actualSource = "DIRECT_UPLOAD";
    let snapshotData = null;
    let linkedCartId = null;

    if (requestedSource === "CHECKOUT_UPLOAD") {
      const cart = await Cart.findOne({ user: userId }).populate("items.product");
      if (cart && cart.items && cart.items.length > 0) {
        const hasRxItems = cart.items.some(
          (i) => i.product && (i.product.requiresRx || i.product.isPrescriptionRequired)
        );

        if (hasRxItems) {
          actualSource = "CHECKOUT_UPLOAD";
          linkedCartId = cart._id;
          
          // Generate authoritative snapshot server-side from MongoDB cart
          const itemsSnapshot = cart.items.map((i) => ({
            productId: (i.product?._id || i.product?.id || i.product).toString(),
            name: i.product?.name || "",
            quantity: i.quantity,
            price: i.product?.price || i.price || 0,
            requiresRx: !!(i.product?.requiresRx || i.product?.isPrescriptionRequired),
          }));

          snapshotData = {
            items: itemsSnapshot,
            subtotal: itemsSnapshot.reduce((acc, i) => acc + i.price * i.quantity, 0),
            requiresRx: true,
          };
        }
      }
    }

    // Sanitize user-submitted notes and doctorName
    const patientNotes = typeof req.body.patientNotes === "string" 
      ? req.body.patientNotes.slice(0, 1000).trim() 
      : (typeof req.body.notes === "string" ? req.body.notes.slice(0, 1000).trim() : "");
    const doctorName = typeof req.body.doctorName === "string" ? req.body.doctorName.slice(0, 200).trim() : "";

    const prescription = await Prescription.create({
      user: userId,
      name: fileNames.join(", "),
      fileUrl: fileUrls[0],
      fileUrls: fileUrls,
      fileNames: fileNames,
      fileSize: files.reduce((acc, f) => acc + (f.size || 0), 0),
      fileType: files[0].mimetype || "",
      status: "Pending Review",
      patientNotes,
      cartSnapshot: snapshotData,
      source: actualSource,
      cart: linkedCartId,
      doctorName,
      timeline: initialTimeline,
    });

    // Workflow B: If verified CHECKOUT_UPLOAD, lock the existing cart server-side
    if (actualSource === "CHECKOUT_UPLOAD") {
      const cart = await Cart.findOne({ user: userId });
      if (cart) {
        cart.prescription = prescription._id;
        cart.prescriptionStatus = "Uploaded";
        cart.isLocked = true;
        cart.cartSource = "CHECKOUT_UPLOAD";
        cart.lockReason = "Your prescription is under pharmacist verification. Cart is temporarily locked.";
        await cart.save();
      }

      if (snapshotData) {
        await CheckoutSession.findOneAndUpdate(
          { user: userId, status: { $ne: "PAYMENT_SUCCESS" } },
          {
            user: userId,
            cartSnapshot: snapshotData,
            prescription: prescription._id,
            status: "PENDING_VERIFICATION",
            isLocked: true,
            lockReason: "Prescription is under pharmacist verification. Cart is locked.",
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
          },
          { upsert: true, new: true }
        );
      }
    }

    // Create Notification
    await Notification.create({
      user: userId,
      title: "Prescription Uploaded",
      message: `Your prescription "${prescription.name.slice(0, 30)}..." has been uploaded and queued for verification.`,
      type: "prescription",
      link: `/prescriptions/${prescription._id}`,
    });

    // Send emails safely
    try {
      sendPrescriptionReceivedCustomer(
        req.user.email,
        req.user.name,
        prescription._id,
        prescription.name
      );
      sendPrescriptionReceivedAdmin(
        req.user.name,
        prescription._id,
        prescription.name
      );
    } catch (err) {
      console.warn("Prescription received email dispatch failed:", err.message);
    }

    res.status(201).json({
      success: true,
      fileName: prescription.name,
      uploadDate: prescription.createdAt.toISOString(),
      source: prescription.source,
      prescription,
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────
// PATIENT — Get my prescriptions
// ─────────────────────────────────────────────
export const getMyPrescriptions = async (req, res, next) => {
  try {
    const prescriptions = await Prescription.find({ user: req.user._id })
      .populate("prescribedItems.product")
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, prescriptions });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────
// PATIENT / ADMIN — Get single prescription by ID
// ─────────────────────────────────────────────
export const getPrescription = async (req, res, next) => {
  const { id } = req.params;
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ success: false, message: "Prescription not found" });
    }

    const isUserAdmin = req.user && req.user.role === "admin";
    const query = isUserAdmin ? { _id: id } : { _id: id, user: req.user._id };

    const prescription = await Prescription.findOne(query)
      .populate("prescribedItems.product")
      .populate("approvedBy", "name email");

    if (!prescription) {
      return res.status(404).json({ success: false, message: "Prescription not found" });
    }
    res.status(200).json({ success: true, prescription });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────
// PATIENT — Transfer approved prescribed items to cart
// ─────────────────────────────────────────────
export const checkoutPrescription = async (req, res, next) => {
  const { id } = req.params;
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ success: false, message: "Prescription not found" });
    }

    const prescription = await Prescription.findOne({ _id: id, user: req.user._id })
      .populate("prescribedItems.product");

    if (!prescription) {
      return res.status(404).json({ success: false, message: "Prescription not found" });
    }

    if (prescription.status !== "Approved") {
      return res.status(400).json({ 
        success: false, 
        message: `Cannot checkout an unapproved prescription (Current status: ${prescription.status}).` 
      });
    }

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = new Cart({ user: req.user._id, items: [] });
    }

    cart.prescription = prescription._id;
    cart.prescriptionStatus = prescription.status;

    // Validate stock and authoritative pricing for prescribed items
    if (prescription.prescribedItems && prescription.prescribedItems.length > 0) {
      for (const pItem of prescription.prescribedItems) {
        const prodId = pItem.product?._id || pItem.product;
        if (!prodId) continue;
        
        const dbProduct = await Product.findById(prodId);
        if (!dbProduct) continue;

        const effectivePrice = pItem.price || dbProduct.price || 0;
        const targetQty = Number(pItem.quantity) || 1;

        const existingIdx = cart.items.findIndex(
          (ci) => ci.product && ci.product.toString() === prodId.toString()
        );
        if (existingIdx > -1) {
          cart.items[existingIdx].quantity = targetQty;
          cart.items[existingIdx].price = effectivePrice;
        } else {
          cart.items.push({
            product: prodId,
            quantity: targetQty,
            price: effectivePrice,
          });
        }
      }
    }

    await cart.save();

    res.status(200).json({
      success: true,
      message: `Prescription linked to cart (${prescription.status})`,
      cart,
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────
// PATIENT / ADMIN — Delete a prescription
// ─────────────────────────────────────────────
export const deletePrescription = async (req, res, next) => {
  const { id } = req.params;
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ success: false, message: "Prescription not found" });
    }

    const isUserAdmin = req.user && req.user.role === "admin";
    const query = isUserAdmin ? { _id: id } : { _id: id, user: req.user._id };

    const prescription = await Prescription.findOne(query);
    if (!prescription) {
      return res.status(404).json({ success: false, message: "Prescription not found" });
    }

    // Protect against deleting prescription while payment is in progress
    const paymentInProgress = await CheckoutSession.exists({
      prescription: id,
      status: "PAYMENT_PENDING",
      isLocked: true,
      expiresAt: { $gt: new Date() },
    });
    if (paymentInProgress) {
      return res.status(409).json({
        success: false,
        code: "PAYMENT_IN_PROGRESS",
        message: "Cannot delete prescription while payment is processing.",
      });
    }

    await prescription.deleteOne();

    const cart = await Cart.findOne({ user: prescription.user });
    if (cart && cart.prescription && cart.prescription.toString() === id) {
      cart.prescription = null;
      cart.prescriptionStatus = "Pending";
      cart.isLocked = false;
      cart.cartSource = "NORMAL";
      await cart.save();
    }

    await CheckoutSession.updateMany(
      { prescription: id },
      { $set: { prescription: null, status: "ACTIVE", isLocked: false } }
    );

    res.status(200).json({ success: true, message: "Prescription deleted successfully" });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────
// ADMIN — Get all prescriptions
// ─────────────────────────────────────────────
export const getPrescriptions = async (req, res, next) => {
  try {
    const { status, search, source } = req.query;

    const query = {};
    if (status && status !== "all" && status !== "today") {
      query.status = status;
    }

    if (source && source !== "all") {
      query.source = source;
    }

    if (status === "today") {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const todayEnd = new Date();
      todayEnd.setHours(23, 59, 59, 999);
      query.createdAt = { $gte: todayStart, $lte: todayEnd };
    }

    let prescriptions = await Prescription.find(query)
      .populate("user", "name email mobile phone")
      .populate("approvedBy", "name email")
      .populate("prescribedItems.product")
      .populate({
        path: "cart",
        populate: { path: "items.product" },
      })
      .sort({ createdAt: -1 });

    // Safe sanitized search (Limit search input length to 100 chars to avoid ReDoS)
    if (search && typeof search === "string" && search.trim()) {
      const s = search.trim().slice(0, 100).toLowerCase();
      prescriptions = prescriptions.filter((rx) => {
        const matchesUser = rx.user?.name?.toLowerCase().includes(s) || rx.user?.email?.toLowerCase().includes(s) || rx.user?.mobile?.includes(s);
        const matchesFileName = rx.name?.toLowerCase().includes(s);
        const matchesDoctor = rx.doctorName?.toLowerCase().includes(s);
        const matchesStatus = rx.status?.toLowerCase().includes(s);
        const matchesId = (rx.id || rx._id)?.toString().toLowerCase().includes(s);
        
        let matchesMedicine = false;
        if (rx.prescribedItems && Array.isArray(rx.prescribedItems)) {
          matchesMedicine = rx.prescribedItems.some((item) => item.name?.toLowerCase().includes(s));
        }

        return matchesUser || matchesFileName || matchesDoctor || matchesStatus || matchesMedicine || matchesId;
      });
    }

    res.status(200).json({ success: true, prescriptions });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────
// ADMIN — Create a Locked Cart for Direct Upload RX (Workflow A)
// ─────────────────────────────────────────────
export const createCartForPrescription = async (req, res, next) => {
  const { id } = req.params;
  const { items, pharmacistNotes, doctorName } = req.body;

  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ success: false, message: "Prescription not found" });
    }

    const prescription = await Prescription.findById(id).populate("user", "name email mobile");
    if (!prescription) {
      return res.status(404).json({ success: false, message: "Prescription not found" });
    }

    // Must be a DIRECT_UPLOAD prescription
    if (prescription.source && prescription.source !== "DIRECT_UPLOAD") {
      return res.status(400).json({
        success: false,
        message: "Cart builder is only available for Direct Upload prescriptions. For Checkout prescriptions, use the approve/reject flow.",
      });
    }

    // Idempotency: Prevent duplicate cart creation if already approved
    if (prescription.status === "Approved") {
      return res.status(400).json({
        success: false,
        message: "Prescription cart has already been built and approved for this prescription.",
      });
    }

    if (prescription.status === "Rejected") {
      return res.status(400).json({
        success: false,
        message: "Cannot create cart for a rejected prescription.",
      });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: "Please select at least one product to create a cart." });
    }

    // Validate each item against database products, variants & authoritative prices
    const validatedItems = [];
    const prescribedItemsList = [];

    for (const item of items) {
      const prodId = item.product?._id || item.product || item.productId;
      if (!prodId || !mongoose.Types.ObjectId.isValid(prodId)) {
        return res.status(400).json({ success: false, message: `Invalid product identifier: ${item.name || prodId}` });
      }

      const product = await Product.findById(prodId);
      if (!product) {
        return res.status(400).json({ success: false, message: `Product not found in database: ${item.name || prodId}` });
      }

      const qty = parseInt(item.quantity) || 1;
      if (qty < 1) {
        return res.status(400).json({ success: false, message: `Quantity must be at least 1 for ${product.name}` });
      }

      const targetVariant = item.variantName ? String(item.variantName).trim() : "";
      const targetVariantId = item.variantId ? String(item.variantId).trim() : "";

      let effectiveStock = product.stock;
      // Authoritative Price: Never trust client price
      let effectivePrice = product.price;

      if (targetVariant && Array.isArray(product.variants) && product.variants.length > 0) {
        const foundVariant = product.variants.find(
          (v) => (targetVariantId && v._id?.toString() === targetVariantId) || v.name?.toLowerCase() === targetVariant.toLowerCase()
        );
        if (foundVariant) {
          effectiveStock = foundVariant.stock !== undefined ? foundVariant.stock : product.stock;
          effectivePrice = foundVariant.sellingPrice !== undefined ? foundVariant.sellingPrice : (foundVariant.price !== undefined ? foundVariant.price : product.price);
        }
      }

      if (effectiveStock < qty) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}. Available: ${effectiveStock}, Requested: ${qty}`,
        });
      }

      validatedItems.push({
        product: product._id,
        quantity: qty,
        variantName: targetVariant,
        variantId: targetVariantId,
        price: effectivePrice,
      });

      prescribedItemsList.push({
        product: product._id,
        name: targetVariant ? `${product.name} (${targetVariant})` : product.name,
        dosage: typeof item.dosage === "string" ? item.dosage.slice(0, 200) : "As prescribed",
        quantity: qty,
        price: effectivePrice,
        originalPrice: product.originalPrice || product.price || effectivePrice,
        isRx: !!(product.requiresRx || product.isPrescriptionRequired),
        image: product.image || "",
      });
    }

    // Update customer's Cart
    let cart = await Cart.findOne({ user: prescription.user._id });
    if (!cart) {
      cart = new Cart({ user: prescription.user._id, items: [] });
    }

    cart.items = validatedItems;
    cart.prescription = prescription._id;
    cart.prescriptionStatus = "Approved";
    cart.isLocked = true;
    cart.cartSource = "DIRECT_UPLOAD";
    cart.lockReason = "Items in this cart were prepared by our pharmacy team and cannot be modified.";
    await cart.save();

    // Create / Update CheckoutSession so lock and verification are synchronized
    const itemsSnapshot = prescribedItemsList.map((i) => ({
      productId: i.product.toString(),
      name: i.name,
      quantity: i.quantity,
      price: i.price,
      requiresRx: i.isRx,
    }));
    const subtotal = itemsSnapshot.reduce((acc, i) => acc + i.price * i.quantity, 0);

    await CheckoutSession.findOneAndUpdate(
      { user: prescription.user._id, status: { $ne: "PAYMENT_SUCCESS" } },
      {
        user: prescription.user._id,
        cartSnapshot: {
          items: itemsSnapshot,
          subtotal,
          requiresRx: true,
        },
        prescription: prescription._id,
        status: "VERIFIED",
        isLocked: true,
        lockReason: "Prescription cart prepared and verified by pharmacy team.",
        expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000),
      },
      { upsert: true, new: true }
    );

    // Update Prescription document
    prescription.status = "Approved";
    prescription.prescribedItems = prescribedItemsList;
    if (pharmacistNotes !== undefined) {
      const cleanNotes = typeof pharmacistNotes === "string" ? pharmacistNotes.slice(0, 1000) : "";
      prescription.pharmacistNotes = cleanNotes;
      prescription.adminNotes = cleanNotes;
    }
    if (doctorName !== undefined) {
      prescription.doctorName = typeof doctorName === "string" ? doctorName.slice(0, 200) : "";
    }
    prescription.approvedBy = req.user._id;
    prescription.approvedAt = new Date();
    prescription.cart = cart._id;
    prescription.cartSnapshot = {
      items: itemsSnapshot,
      subtotal,
      requiresRx: true,
    };
    prescription.timeline.push({
      status: "Cart Created",
      title: "Prescription Cart Prepared",
      description: `Pharmacist prepared ${validatedItems.length} item(s) in customer's locked cart.`,
      timestamp: new Date(),
    });

    await prescription.save();

    // Create Notification
    await Notification.create({
      user: prescription.user._id,
      title: "Prescription Cart Ready",
      message: "Your prescription medicines have been prepared by our pharmacist. Open your cart to review and checkout.",
      type: "prescription",
      link: "/cart",
    });

    // Send Cart Ready Email safely
    try {
      sendPrescriptionCartReady(
        prescription.user.email,
        prescription.user.name,
        prescription._id,
        prescription.prescribedItems,
        prescription.adminNotes
      );
    } catch (err) {
      console.warn("Prescription cart ready email dispatch failed:", err.message);
    }

    const populatedPrescription = await Prescription.findById(id)
      .populate("user", "name email mobile phone")
      .populate("prescribedItems.product")
      .populate({ path: "cart", populate: { path: "items.product" } });

    res.status(200).json({
      success: true,
      message: "Locked prescription cart created successfully.",
      prescription: populatedPrescription,
      cart,
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────
// ADMIN — Update prescription prescribed items
// ─────────────────────────────────────────────
export const updatePrescriptionItems = async (req, res, next) => {
  const { id } = req.params;
  const { items, pharmacistNotes, doctorName } = req.body;

  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ success: false, message: "Prescription not found" });
    }

    const prescription = await Prescription.findById(id).populate("user", "name email");
    if (!prescription) {
      return res.status(404).json({ success: false, message: "Prescription not found" });
    }

    if (items && Array.isArray(items)) {
      prescription.prescribedItems = items;
    }
    if (pharmacistNotes !== undefined) {
      const cleanNotes = typeof pharmacistNotes === "string" ? pharmacistNotes.slice(0, 1000) : "";
      prescription.pharmacistNotes = cleanNotes;
      prescription.adminNotes = cleanNotes;
    }
    if (doctorName !== undefined) {
      prescription.doctorName = typeof doctorName === "string" ? doctorName.slice(0, 200) : "";
    }

    prescription.timeline.push({
      status: "Under Verification",
      title: "Medicines Verified by Pharmacist",
      description: `Pharmacist verified ${items ? items.length : 0} prescribed item(s).`,
      timestamp: new Date(),
    });

    await prescription.save();
    res.status(200).json({ success: true, prescription });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────
// ADMIN — Update prescription status (generic)
// ─────────────────────────────────────────────
export const updatePrescriptionStatus = async (req, res, next) => {
  const { id } = req.params;
  const { status, adminNotes, doctorName, items } = req.body;

  const validStatuses = ["Pending Review", "Under Verification", "Approved", "Rejected", "Expired"];
  if (status && !validStatuses.includes(status)) {
    return res.status(400).json({
      success: false,
      message: `Invalid prescription status. Allowed: ${validStatuses.join(", ")}`,
    });
  }

  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ success: false, message: "Prescription not found" });
    }

    const prescription = await Prescription.findById(id).populate("user", "name email");
    if (!prescription) {
      return res.status(404).json({ success: false, message: "Prescription not found" });
    }

    prescription.status = status;
    if (adminNotes !== undefined) {
      const cleanNotes = typeof adminNotes === "string" ? adminNotes.slice(0, 1000) : "";
      prescription.adminNotes = cleanNotes;
      prescription.pharmacistNotes = cleanNotes;
    }
    if (doctorName !== undefined) {
      prescription.doctorName = typeof doctorName === "string" ? doctorName.slice(0, 200) : "";
    }
    if (items && Array.isArray(items)) {
      prescription.prescribedItems = items;
    }

    prescription.timeline.push({
      status: status,
      title: `Status: ${status}`,
      description: adminNotes || `Prescription status updated to ${status}`,
      timestamp: new Date(),
    });

    await prescription.save();

    // Sync Cart status
    const cart = await Cart.findOne({ user: prescription.user._id });
    if (cart && cart.prescription && cart.prescription.toString() === id) {
      if (status === "Under Verification") cart.prescriptionStatus = "Under Review";
      else if (status === "Expired") cart.prescriptionStatus = "Expired";
      else if (status === "Approved") cart.prescriptionStatus = "Approved";
      else if (status === "Rejected") {
        cart.items = [];
        cart.prescription = null;
        cart.isLocked = false;
        cart.cartSource = "NORMAL";
        cart.prescriptionStatus = "Rejected";
      }
      await cart.save();
    }

    if (status === "Pending Review" || status === "Under Verification") {
      await CheckoutSession.updateMany(
        { user: prescription.user._id, prescription: prescription._id, status: { $ne: "PAYMENT_SUCCESS" } },
        { $set: { status: "PENDING_VERIFICATION", isLocked: true, lockReason: "Prescription is under pharmacist verification. Cart is locked.", expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) } }
      );
    } else if (status === "Approved") {
      await CheckoutSession.findOneAndUpdate(
        { user: prescription.user._id, status: { $ne: "PAYMENT_SUCCESS" } },
        { user: prescription.user._id, prescription: prescription._id, status: "VERIFIED", isLocked: true, lockReason: "Prescription verified by pharmacist. Cart is ready for checkout payment.", expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) },
        { upsert: true, new: true, sort: { updatedAt: -1 } }
      );
    } else if (status === "Rejected" || status === "Expired") {
      await CheckoutSession.updateMany(
        { user: prescription.user._id, prescription: prescription._id, status: { $ne: "PAYMENT_SUCCESS" } },
        { $set: { status: status === "Rejected" ? "CANCELLED" : "EXPIRED", isLocked: false, lockReason: status === "Rejected" ? "Prescription rejected by pharmacist." : "Prescription expired." } }
      );
    }

    // Create Notification
    await Notification.create({
      user: prescription.user._id,
      title: `Prescription Status: ${status}`,
      message: `Your prescription status has been updated to "${status}". Notes: ${adminNotes || "—"}`,
      type: "prescription",
      link: `/prescriptions/${id}`,
    });

    // Email patient safely
    try {
      if (status === "Approved") {
        sendPrescriptionApproved(prescription.user.email, prescription.user.name, prescription._id, prescription.prescribedItems, adminNotes);
      } else if (status === "Rejected") {
        sendPrescriptionRejected(prescription.user.email, prescription.user.name, prescription._id, adminNotes, prescription.source || "CHECKOUT_UPLOAD");
      } else {
        await sendPrescriptionReviewEmail(
          prescription.user.email,
          prescription.user.name,
          prescription.name,
          prescription.status,
          prescription.adminNotes
        );
      }
    } catch (err) {
      console.warn("Prescription email notification failed:", err.message);
    }

    res.status(200).json({ success: true, prescription });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────
// ADMIN — Approve a prescription (Workflow B: Checkout RX Accept)
// ─────────────────────────────────────────────
export const approvePrescription = async (req, res, next) => {
  const { id } = req.params;
  const { adminNotes, doctorName, items } = req.body;

  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ success: false, message: "Prescription not found" });
    }

    const prescription = await Prescription.findById(id).populate("user", "name email");
    if (!prescription) {
      return res.status(404).json({ success: false, message: "Prescription not found" });
    }

    // Idempotency: Return early if already approved
    if (prescription.status === "Approved") {
      const populatedPrescription = await Prescription.findById(id)
        .populate("user", "name email mobile phone")
        .populate("prescribedItems.product")
        .populate({ path: "cart", populate: { path: "items.product" } });
      return res.status(200).json({ success: true, prescription: populatedPrescription });
    }

    if (prescription.status === "Rejected") {
      return res.status(400).json({ success: false, message: "Cannot approve an already rejected prescription." });
    }

    const cleanNotes = typeof adminNotes === "string" ? adminNotes.slice(0, 1000) : "Verified & Approved by Pharmacist";
    prescription.status = "Approved";
    prescription.adminNotes = cleanNotes;
    prescription.pharmacistNotes = cleanNotes;
    prescription.approvedBy = req.user._id;
    prescription.approvedAt = new Date();
    if (doctorName !== undefined) {
      prescription.doctorName = typeof doctorName === "string" ? doctorName.slice(0, 200) : "";
    }
    if (items && Array.isArray(items) && items.length > 0) {
      prescription.prescribedItems = items;
    }

    prescription.timeline.push({
      status: "Approved",
      title: "Prescription Verified & Approved",
      description: "Your prescription has been verified and approved by our licensed pharmacist. You can now complete checkout.",
      timestamp: new Date(),
    });

    await prescription.save();

    // Sync Cart: Keep locked so medicines cannot be tampered with after pharmacist verified them
    let cart = await Cart.findOne({ user: prescription.user._id }).populate("items.product");
    if (cart) {
      cart.prescription = prescription._id;
      cart.prescriptionStatus = "Approved";
      cart.isLocked = true;
      cart.cartSource = prescription.source || "CHECKOUT_UPLOAD";
      cart.lockReason = "Prescription verified. Cart medicines cannot be modified.";
      await cart.save();
    }

    // Update CheckoutSession to VERIFIED (isLocked=true ensures items cannot be tampered with)
    await CheckoutSession.findOneAndUpdate(
      { user: prescription.user._id, status: { $ne: "PAYMENT_SUCCESS" } },
      {
        user: prescription.user._id,
        prescription: prescription._id,
        status: "VERIFIED",
        isLocked: true,
        lockReason: "Prescription verified by pharmacist. Cart is ready for checkout payment.",
        expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000),
      },
      { upsert: true, new: true }
    );

    // Create Notification
    await Notification.create({
      user: prescription.user._id,
      title: "Prescription Approved",
      message: "Your prescription has been approved by our pharmacist! You can now complete your order checkout.",
      type: "prescription",
      link: `/prescriptions/${id}`,
    });

    // Send Approval Email safely
    try {
      sendPrescriptionApproved(
        prescription.user.email,
        prescription.user.name,
        prescription._id,
        prescription.prescribedItems,
        prescription.adminNotes
      );
    } catch (err) {
      console.warn("Prescription approval email dispatch failed:", err.message);
    }

    const populatedPrescription = await Prescription.findById(id)
      .populate("user", "name email mobile phone")
      .populate("prescribedItems.product")
      .populate({ path: "cart", populate: { path: "items.product" } });

    res.status(200).json({ success: true, prescription: populatedPrescription });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────
// ADMIN — Reject a prescription (Workflow B: Checkout RX Reject)
// ─────────────────────────────────────────────
export const rejectPrescription = async (req, res, next) => {
  const { id } = req.params;
  const { adminNotes, doctorName } = req.body;

  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ success: false, message: "Prescription not found" });
    }

    const prescription = await Prescription.findById(id).populate("user", "name email");
    if (!prescription) {
      return res.status(404).json({ success: false, message: "Prescription not found" });
    }

    // Idempotency: Return early if already rejected
    if (prescription.status === "Rejected") {
      const populatedPrescription = await Prescription.findById(id)
        .populate("user", "name email mobile phone")
        .populate("prescribedItems.product")
        .populate({ path: "cart", populate: { path: "items.product" } });
      return res.status(200).json({ success: true, prescription: populatedPrescription });
    }

    const cleanNotes = typeof adminNotes === "string" ? adminNotes.slice(0, 1000) : "Prescription verification declined.";
    prescription.status = "Rejected";
    prescription.adminNotes = cleanNotes;
    prescription.pharmacistNotes = cleanNotes;
    prescription.approvedBy = null;
    prescription.approvedAt = null;
    if (doctorName !== undefined) {
      prescription.doctorName = typeof doctorName === "string" ? doctorName.slice(0, 200) : "";
    }

    prescription.timeline.push({
      status: "Rejected",
      title: "Prescription Rejected",
      description: cleanNotes || "Prescription verification declined. Please re-upload a clear prescription document.",
      timestamp: new Date(),
    });

    await prescription.save();

    // For CHECKOUT_UPLOAD: Delete/clear the associated locked cart completely
    const cart = await Cart.findOne({ user: prescription.user._id });
    if (cart && (cart.prescription?.toString() === id || prescription.source === "CHECKOUT_UPLOAD")) {
      cart.items = [];
      cart.prescription = null;
      cart.isLocked = false;
      cart.cartSource = "NORMAL";
      cart.prescriptionStatus = "Rejected";
      cart.lockReason = "";
      await cart.save();
    }

    // Update CheckoutSession to CANCELLED and unlock
    await CheckoutSession.findOneAndUpdate(
      { user: prescription.user._id, status: { $ne: "PAYMENT_SUCCESS" } },
      {
        status: "CANCELLED",
        isLocked: false,
        lockReason: "Prescription rejected by pharmacist.",
      }
    );

    // Create Notification
    await Notification.create({
      user: prescription.user._id,
      title: "Prescription Rejected",
      message: `Your prescription verification was declined. Reason: ${cleanNotes || "Please upload a clearer prescription sheet."}`,
      type: "prescription",
      link: `/prescriptions/${id}`,
    });

    // Send Rejection Email safely
    try {
      sendPrescriptionRejected(
        prescription.user.email,
        prescription.user.name,
        prescription._id,
        prescription.adminNotes,
        prescription.source || "CHECKOUT_UPLOAD"
      );
    } catch (err) {
      console.warn("Prescription rejection email dispatch failed:", err.message);
    }

    const populatedPrescription = await Prescription.findById(id)
      .populate("user", "name email mobile phone")
      .populate("prescribedItems.product")
      .populate({ path: "cart", populate: { path: "items.product" } });

    res.status(200).json({ success: true, prescription: populatedPrescription });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────
// PATIENT — Use an existing prescription for the current Rx cart
// ─────────────────────────────────────────────
export const selectPrescriptionForCart = async (req, res, next) => {
  const { id } = req.params;
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ success: false, message: "Prescription not found" });
    }

    const paymentInProgress = await CheckoutSession.exists({
      user: req.user._id,
      status: "PAYMENT_PENDING",
      isLocked: true,
      expiresAt: { $gt: new Date() },
    });
    if (paymentInProgress) {
      return res.status(409).json({
        success: false,
        code: "PAYMENT_IN_PROGRESS",
        message: "Payment is currently processing. Please wait for its result before changing prescription details.",
      });
    }

    const prescription = await Prescription.findOne({ _id: id, user: req.user._id });
    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: "Prescription not found or does not belong to your account.",
      });
    }

    if (!["Approved", "Pending Review", "Under Verification"].includes(prescription.status)) {
      return res.status(400).json({
        success: false,
        message: `This prescription cannot be used for checkout (Current status: ${prescription.status}).`,
      });
    }

    const cart = await Cart.findOne({ user: req.user._id }).populate("items.product");
    if (!cart || !cart.items || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Your cart is empty.",
      });
    }

    const rxCartItems = normalizeRxItems(cart.items);
    if (rxCartItems.length === 0) {
      return res.status(400).json({ success: false, message: "Your cart does not contain any prescription-required products." });
    }

    const isApproved = prescription.status === "Approved";
    const evalResult = evaluatePrescriptionCartMatch(prescription, rxCartItems, { requireApproved: isApproved });

    if (isApproved && !evalResult.isMatch) {
      return res.status(400).json({
        success: false,
        message: evalResult.reason || "This prescription does not match your current cart items.",
      });
    }

    const itemsSnapshot = cart.items.map((item) => ({
      productId: (item.product._id || item.product.id || item.product).toString(),
      name: item.product?.name || "",
      quantity: item.quantity,
      price: item.product?.price || item.price || 0,
      requiresRx: !!(item.product?.requiresRx || item.product?.isPrescriptionRequired),
    }));

    if (!isApproved) {
      prescription.cartSnapshot = {
        items: itemsSnapshot,
        subtotal: itemsSnapshot.reduce((acc, item) => acc + item.price * item.quantity, 0),
        requiresRx: true,
      };
      prescription.timeline.push({
        status: prescription.status,
        title: "Prescription Linked to Cart",
        description: "Customer selected this prescription for pharmacist review against the current cart.",
        timestamp: new Date(),
      });
      await prescription.save();
    }

    cart.prescription = prescription._id;
    cart.prescriptionStatus = isApproved ? "Approved" : "Uploaded";
    await cart.save();

    await CheckoutSession.findOneAndUpdate(
      { user: req.user._id, status: { $ne: "PAYMENT_SUCCESS" } },
      {
        user: req.user._id,
        prescription: prescription._id,
        cartSnapshot: {
          items: itemsSnapshot,
          subtotal: itemsSnapshot.reduce((acc, item) => acc + item.price * item.quantity, 0),
          requiresRx: true,
        },
        status: isApproved ? "VERIFIED" : "PENDING_VERIFICATION",
        isLocked: !isApproved,
        lockReason: isApproved
          ? "Prescription selected and verified for current cart."
          : "Prescription is under pharmacist verification. Cart is locked.",
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
      { upsert: true, new: true }
    );

    res.status(200).json({
      success: true,
      message: isApproved
        ? "Prescription linked and verified for checkout."
        : "Prescription linked to your cart and queued for pharmacist verification.",
      prescription,
      rxStatus: isApproved ? "Verified" : "Pending Verification",
      isEligible: isApproved,
    });
  } catch (error) {
    next(error);
  }
};
