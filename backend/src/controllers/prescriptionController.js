import { Prescription } from "../models/Prescription.js";
import { uploadToCloudinary } from "../services/cloudinaryService.js";
import { sendPrescriptionReviewEmail } from "../services/emailService.js";
import { Notification } from "../models/Notification.js";
import { Cart } from "../models/Cart.js";
import { Product } from "../models/Product.js";

// ─────────────────────────────────────────────
// PATIENT — Upload a new prescription
// ─────────────────────────────────────────────
export const uploadPrescription = async (req, res, next) => {
  try {
    const files = req.files || (req.file ? [req.file] : []);
    if (files.length === 0) {
      return res.status(400).json({ success: false, message: "Please select a prescription document to upload" });
    }

    // Upload all files to Cloudinary
    const uploadPromises = files.map((file) => uploadToCloudinary(file.path, "prescriptions"));
    const fileUrls = await Promise.all(uploadPromises);
    const fileNames = files.map((f) => f.originalname);

    const initialTimeline = [
      {
        status: "Pending Review",
        title: "Prescription Uploaded",
        description: "Your prescription file has been uploaded successfully and queued for pharmacist review.",
        timestamp: new Date(),
      },
    ];

    const prescription = await Prescription.create({
      user: req.user._id,
      name: fileNames.join(", "),
      fileUrl: fileUrls[0],
      fileUrls: fileUrls,
      fileNames: fileNames,
      fileSize: files.reduce((acc, f) => acc + (f.size || 0), 0),
      fileType: files[0].mimetype || "",
      status: "Pending Review",
      patientNotes: req.body.patientNotes || req.body.notes || "",
      cartSnapshot: req.body.cartSnapshot ? JSON.parse(req.body.cartSnapshot) : null,
      doctorName: req.body.doctorName || "",
      timeline: initialTimeline,
    });

    // Link prescription to user's active cart
    const cart = await Cart.findOne({ user: req.user._id });
    if (cart) {
      cart.prescription = prescription._id;
      cart.prescriptionStatus = "Uploaded";
      await cart.save();
    }

    // Create Notification
    await Notification.create({
      user: req.user._id,
      title: "Prescription Uploaded",
      message: `Your prescription "${prescription.name.slice(0, 30)}..." has been uploaded and queued for verification.`,
      type: "prescription",
      link: `/prescriptions/${prescription._id}`,
    });

    res.status(201).json({
      success: true,
      fileName: prescription.name,
      uploadDate: prescription.createdAt.toISOString(),
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
// PATIENT — Get single prescription by ID
// ─────────────────────────────────────────────
export const getPrescription = async (req, res, next) => {
  const { id } = req.params;
  try {
    const prescription = await Prescription.findOne({ _id: id, user: req.user._id })
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
    const prescription = await Prescription.findOne({ _id: id, user: req.user._id })
      .populate("prescribedItems.product");

    if (!prescription) {
      return res.status(404).json({ success: false, message: "Prescription not found" });
    }

    if (prescription.status !== "Approved") {
      return res.status(400).json({ success: false, message: "Prescription must be approved before checkout" });
    }

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = new Cart({ user: req.user._id, items: [] });
    }

    // If prescribedItems exist, populate them into cart items
    if (prescription.prescribedItems && prescription.prescribedItems.length > 0) {
      for (const pItem of prescription.prescribedItems) {
        const prodId = pItem.product?._id || pItem.product;
        if (!prodId) continue;
        
        const existingIdx = cart.items.findIndex(
          (ci) => ci.product.toString() === prodId.toString()
        );
        if (existingIdx > -1) {
          cart.items[existingIdx].quantity = pItem.quantity || 1;
        } else {
          cart.items.push({
            product: prodId,
            quantity: pItem.quantity || 1,
            price: pItem.price || 0,
          });
        }
      }
    }

    cart.prescription = prescription._id;
    cart.prescriptionStatus = "Approved";
    await cart.save();

    res.status(200).json({
      success: true,
      message: "Prescribed items loaded into cart",
      cart,
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────
// PATIENT — Delete a prescription
// ─────────────────────────────────────────────
export const deletePrescription = async (req, res, next) => {
  const { id } = req.params;
  try {
    const prescription = await Prescription.findOne({ _id: id, user: req.user._id });
    if (!prescription) {
      return res.status(404).json({ success: false, message: "Prescription not found or not authorized" });
    }

    if (prescription.status === "Approved") {
      return res.status(400).json({ success: false, message: "Cannot delete an approved prescription" });
    }

    await prescription.deleteOne();

    const cart = await Cart.findOne({ user: req.user._id });
    if (cart && cart.prescription && cart.prescription.toString() === id) {
      cart.prescription = null;
      cart.prescriptionStatus = "Pending";
      await cart.save();
    }

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
    const { status, search } = req.query;

    const query = {};
    if (status && status !== "all" && status !== "today") {
      query.status = status;
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
      .sort({ createdAt: -1 });

    if (search) {
      const s = search.toLowerCase();
      prescriptions = prescriptions.filter((rx) => {
        const matchesUser = rx.user?.name?.toLowerCase().includes(s) || rx.user?.email?.toLowerCase().includes(s);
        const matchesFileName = rx.name?.toLowerCase().includes(s);
        const matchesDoctor = rx.doctorName?.toLowerCase().includes(s);
        const matchesStatus = rx.status?.toLowerCase().includes(s);
        
        let matchesMedicine = false;
        if (rx.prescribedItems && Array.isArray(rx.prescribedItems)) {
          matchesMedicine = rx.prescribedItems.some((item) => item.name?.toLowerCase().includes(s));
        }

        return matchesUser || matchesFileName || matchesDoctor || matchesStatus || matchesMedicine;
      });
    }

    res.status(200).json({ success: true, prescriptions });
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
    const prescription = await Prescription.findById(id).populate("user", "name email");
    if (!prescription) {
      return res.status(404).json({ success: false, message: "Prescription not found" });
    }

    if (items && Array.isArray(items)) {
      prescription.prescribedItems = items;
    }
    if (pharmacistNotes !== undefined) {
      prescription.pharmacistNotes = pharmacistNotes;
      prescription.adminNotes = pharmacistNotes;
    }
    if (doctorName !== undefined) {
      prescription.doctorName = doctorName;
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

  try {
    const prescription = await Prescription.findById(id).populate("user", "name email");
    if (!prescription) {
      return res.status(404).json({ success: false, message: "Prescription not found" });
    }

    prescription.status = status;
    if (adminNotes !== undefined) {
      prescription.adminNotes = adminNotes;
      prescription.pharmacistNotes = adminNotes;
    }
    if (doctorName !== undefined) {
      prescription.doctorName = doctorName;
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
      else if (status === "Rejected") cart.prescriptionStatus = "Rejected";
      await cart.save();
    }

    // Create Notification
    await Notification.create({
      user: prescription.user._id,
      title: `Prescription Status: ${status}`,
      message: `Your prescription status has been updated to "${status}". Notes: ${adminNotes || "—"}`,
      type: "prescription",
      link: `/prescriptions/${id}`,
    });

    // Email patient
    try {
      await sendPrescriptionReviewEmail(
        prescription.user.email,
        prescription.user.name,
        prescription.name,
        prescription.status,
        prescription.adminNotes
      );
    } catch (err) {
      console.warn("Prescription email notification failed:", err.message);
    }

    res.status(200).json({ success: true, prescription });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────
// ADMIN — Approve a prescription
// ─────────────────────────────────────────────
export const approvePrescription = async (req, res, next) => {
  const { id } = req.params;
  const { adminNotes, doctorName, items } = req.body;

  try {
    const prescription = await Prescription.findById(id).populate("user", "name email");
    if (!prescription) {
      return res.status(404).json({ success: false, message: "Prescription not found" });
    }

    prescription.status = "Approved";
    prescription.adminNotes = adminNotes || "Verified & Approved by Pharmacist";
    prescription.pharmacistNotes = adminNotes || "Verified & Approved by Pharmacist";
    prescription.approvedBy = req.user._id;
    prescription.approvedAt = new Date();
    if (doctorName !== undefined) {
      prescription.doctorName = doctorName;
    }
    if (items && Array.isArray(items) && items.length > 0) {
      prescription.prescribedItems = items;
    }

    prescription.timeline.push({
      status: "Approved",
      title: "Prescription Approved",
      description: "Your prescription has been approved by our licensed pharmacist. You can now proceed to checkout.",
      timestamp: new Date(),
    });

    await prescription.save();

    // Auto-sync Cart
    let cart = await Cart.findOne({ user: prescription.user._id });
    if (!cart) {
      cart = new Cart({ user: prescription.user._id, items: [] });
    }

    // Populate prescribed items into customer's cart
    if (prescription.prescribedItems && prescription.prescribedItems.length > 0) {
      for (const pItem of prescription.prescribedItems) {
        const prodId = pItem.product?._id || pItem.product;
        if (!prodId) continue;
        const existingIdx = cart.items.findIndex(
          (ci) => ci.product.toString() === prodId.toString()
        );
        if (existingIdx > -1) {
          cart.items[existingIdx].quantity = pItem.quantity || 1;
        } else {
          cart.items.push({
            product: prodId,
            quantity: pItem.quantity || 1,
            price: pItem.price || 0,
          });
        }
      }
    }

    cart.prescription = prescription._id;
    cart.prescriptionStatus = "Approved";
    await cart.save();

    // Create Notification
    await Notification.create({
      user: prescription.user._id,
      title: "Prescription Approved",
      message: "Your prescription has been approved by our pharmacist! You can now complete your order checkout.",
      type: "prescription",
      link: `/prescriptions/${id}`,
    });

    // Notify patient
    try {
      await sendPrescriptionReviewEmail(
        prescription.user.email,
        prescription.user.name,
        prescription.name,
        "Approved",
        prescription.adminNotes
      );
    } catch (err) {
      console.warn("Approval email failed:", err.message);
    }

    res.status(200).json({ success: true, prescription });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────
// ADMIN — Reject a prescription
// ─────────────────────────────────────────────
export const rejectPrescription = async (req, res, next) => {
  const { id } = req.params;
  const { adminNotes, doctorName } = req.body;

  try {
    const prescription = await Prescription.findById(id).populate("user", "name email");
    if (!prescription) {
      return res.status(404).json({ success: false, message: "Prescription not found" });
    }

    prescription.status = "Rejected";
    prescription.adminNotes = adminNotes || "Prescription verification declined.";
    prescription.pharmacistNotes = adminNotes || "Prescription verification declined.";
    prescription.approvedBy = null;
    prescription.approvedAt = null;
    if (doctorName !== undefined) {
      prescription.doctorName = doctorName;
    }

    prescription.timeline.push({
      status: "Rejected",
      title: "Prescription Rejected",
      description: adminNotes || "Prescription verification declined. Please re-upload a clear prescription document.",
      timestamp: new Date(),
    });

    await prescription.save();

    const cart = await Cart.findOne({ user: prescription.user._id });
    if (cart && cart.prescription && cart.prescription.toString() === id) {
      cart.prescriptionStatus = "Rejected";
      await cart.save();
    }

    // Create Notification
    await Notification.create({
      user: prescription.user._id,
      title: "Prescription Rejected",
      message: `Your prescription verification was declined. Reason: ${adminNotes || "Please upload a clearer prescription sheet."}`,
      type: "prescription",
      link: `/prescriptions/${id}`,
    });

    try {
      await sendPrescriptionReviewEmail(
        prescription.user.email,
        prescription.user.name,
        prescription.name,
        "Rejected",
        adminNotes || "Your prescription did not meet our verification requirements."
      );
    } catch (err) {
      console.warn("Rejection email failed:", err.message);
    }

    res.status(200).json({ success: true, prescription });
  } catch (error) {
    next(error);
  }
};
