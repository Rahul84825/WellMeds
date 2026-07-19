import { Prescription } from "../models/Prescription.js";
import { uploadToCloudinary } from "../services/cloudinaryService.js";
import { sendPrescriptionReviewEmail } from "../services/emailService.js";
import { Notification } from "../models/Notification.js";
import { Cart } from "../models/Cart.js";

// ─────────────────────────────────────────────
// PATIENT — Upload a new prescription
// ─────────────────────────────────────────────
export const uploadPrescription = async (req, res, next) => {
  try {
    // Multer array puts files in req.files
    const files = req.files || (req.file ? [req.file] : []);
    if (files.length === 0) {
      return res.status(400).json({ success: false, message: "Please select a prescription document to upload" });
    }

    // Upload all files to Cloudinary
    const uploadPromises = files.map((file) => uploadToCloudinary(file.path, "prescriptions"));
    const fileUrls = await Promise.all(uploadPromises);
    const fileNames = files.map((f) => f.originalname);

    const prescription = await Prescription.create({
      user: req.user._id,
      name: fileNames.join(", "),
      fileUrl: fileUrls[0],
      fileUrls: fileUrls,
      fileNames: fileNames,
      fileSize: files.reduce((acc, f) => acc + (f.size || 0), 0),
      fileType: files[0].mimetype || "",
      status: "Pending Review",
      cartSnapshot: req.body.cartSnapshot ? JSON.parse(req.body.cartSnapshot) : null,
      doctorName: req.body.doctorName || "",
    });

    // Link the prescription to the user's cart
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
      message: `Your prescription "${prescription.name.slice(0, 30)}..." has been uploaded and queued for pharmacist review.`,
      type: "prescription",
      link: "/upload-prescription",
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
    const prescriptions = await Prescription.find({ user: req.user._id }).sort({ createdAt: -1 });
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
    const prescription = await Prescription.findOne({ _id: id, user: req.user._id });
    if (!prescription) {
      return res.status(404).json({ success: false, message: "Prescription not found" });
    }
    res.status(200).json({ success: true, prescription });
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

    // Only allow deletion of pending/rejected prescriptions
    if (prescription.status === "Approved") {
      return res.status(400).json({ success: false, message: "Cannot delete an approved prescription" });
    }

    await prescription.deleteOne();

    // Reset cart if this prescription was active
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

    // "Today's Uploads" filter
    if (status === "today") {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const todayEnd = new Date();
      todayEnd.setHours(23, 59, 59, 999);
      query.createdAt = { $gte: todayStart, $lte: todayEnd };
    }

    let prescriptions = await Prescription.find(query)
      .populate("user", "name email")
      .populate("approvedBy", "name email")
      .sort({ createdAt: -1 });

    // Filter by user name/email/medicine/doctor if search query provided
    if (search) {
      const s = search.toLowerCase();
      prescriptions = prescriptions.filter((rx) => {
        const matchesUser = rx.user?.name?.toLowerCase().includes(s) || rx.user?.email?.toLowerCase().includes(s);
        const matchesFileName = rx.name?.toLowerCase().includes(s);
        const matchesDoctor = rx.doctorName?.toLowerCase().includes(s);
        const matchesStatus = rx.status?.toLowerCase().includes(s);
        
        // Search inside medicine names in cart snapshot list
        let matchesMedicine = false;
        if (rx.cartSnapshot && Array.isArray(rx.cartSnapshot.items)) {
          matchesMedicine = rx.cartSnapshot.items.some((item) => item.name?.toLowerCase().includes(s));
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
// ADMIN — Update prescription status (generic)
// ─────────────────────────────────────────────
export const updatePrescriptionStatus = async (req, res, next) => {
  const { id } = req.params;
  const { status, adminNotes, doctorName } = req.body;

  try {
    const prescription = await Prescription.findById(id).populate("user", "name email");
    if (!prescription) {
      return res.status(404).json({ success: false, message: "Prescription not found" });
    }

    prescription.status = status;
    if (adminNotes !== undefined) {
      prescription.adminNotes = adminNotes;
    }
    if (doctorName !== undefined) {
      prescription.doctorName = doctorName;
    }
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
      link: "/upload-prescription",
    });

    // Notify patient via email
    try {
      await sendPrescriptionReviewEmail(
        prescription.user.email,
        prescription.user.name,
        prescription.name,
        prescription.status,
        prescription.adminNotes
      );
    } catch (err) {
      console.warn("Prescription status notification failed:", err.message);
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
  const { adminNotes, doctorName } = req.body;

  try {
    const prescription = await Prescription.findById(id).populate("user", "name email");
    if (!prescription) {
      return res.status(404).json({ success: false, message: "Prescription not found" });
    }

    prescription.status = "Approved";
    prescription.adminNotes = adminNotes || "";
    prescription.approvedBy = req.user._id;
    prescription.approvedAt = new Date();
    if (doctorName !== undefined) {
      prescription.doctorName = doctorName;
    }
    await prescription.save();

    // Sync Cart status
    const cart = await Cart.findOne({ user: prescription.user._id });
    if (cart && cart.prescription && cart.prescription.toString() === id) {
      cart.prescriptionStatus = "Approved";
      await cart.save();
    }

    // Create Notification
    await Notification.create({
      user: prescription.user._id,
      title: "Prescription Approved",
      message: "Your prescription has been approved by our pharmacist! You can now complete your checkout.",
      type: "prescription",
      link: "/checkout",
    });

    // Notify patient
    try {
      await sendPrescriptionReviewEmail(
        prescription.user.email,
        prescription.user.name,
        prescription.name,
        "Approved",
        adminNotes || ""
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
    prescription.adminNotes = adminNotes || "";
    prescription.approvedBy = null;
    prescription.approvedAt = null;
    if (doctorName !== undefined) {
      prescription.doctorName = doctorName;
    }
    await prescription.save();

    // Sync Cart status
    const cart = await Cart.findOne({ user: prescription.user._id });
    if (cart && cart.prescription && cart.prescription.toString() === id) {
      cart.prescriptionStatus = "Rejected";
      await cart.save();
    }

    // Create Notification
    await Notification.create({
      user: prescription.user._id,
      title: "Prescription Rejected",
      message: `Your prescription was rejected. Reason: ${adminNotes || "Please upload a clearer prescription sheet."}`,
      type: "prescription",
      link: "/upload-prescription",
    });

    // Notify patient
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
