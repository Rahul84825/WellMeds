import { Prescription } from "../models/Prescription.js";
import { uploadToCloudinary } from "../services/cloudinaryService.js";
import { sendPrescriptionReviewEmail } from "../services/emailService.js";

// ─────────────────────────────────────────────
// PATIENT — Upload a new prescription
// ─────────────────────────────────────────────
export const uploadPrescription = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "Please select a prescription document to upload" });
    }

    const localFilePath = req.file.path;
    const fileUrl = await uploadToCloudinary(localFilePath, "prescriptions");

    const prescription = await Prescription.create({
      user: req.user._id,
      name: req.file.originalname,
      fileUrl,
      fileSize: req.file.size || 0,
      fileType: req.file.mimetype || "",
      status: "Pending Review",
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
    if (status && status !== "all") {
      query.status = status;
    }

    let prescriptions = await Prescription.find(query)
      .populate("user", "name email")
      .populate("approvedBy", "name email")
      .sort({ createdAt: -1 });

    // Filter by user name/email if search query provided
    if (search) {
      const s = search.toLowerCase();
      prescriptions = prescriptions.filter(
        (rx) =>
          rx.user?.name?.toLowerCase().includes(s) ||
          rx.user?.email?.toLowerCase().includes(s) ||
          rx.name?.toLowerCase().includes(s)
      );
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
  const { status, adminNotes } = req.body;

  try {
    const prescription = await Prescription.findById(id).populate("user", "name email");
    if (!prescription) {
      return res.status(404).json({ success: false, message: "Prescription not found" });
    }

    prescription.status = status;
    if (adminNotes !== undefined) {
      prescription.adminNotes = adminNotes;
    }
    await prescription.save();

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
  const { adminNotes } = req.body;

  try {
    const prescription = await Prescription.findById(id).populate("user", "name email");
    if (!prescription) {
      return res.status(404).json({ success: false, message: "Prescription not found" });
    }

    prescription.status = "Approved";
    prescription.adminNotes = adminNotes || "";
    prescription.approvedBy = req.user._id;
    prescription.approvedAt = new Date();
    await prescription.save();

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
  const { adminNotes } = req.body;

  try {
    const prescription = await Prescription.findById(id).populate("user", "name email");
    if (!prescription) {
      return res.status(404).json({ success: false, message: "Prescription not found" });
    }

    prescription.status = "Rejected";
    prescription.adminNotes = adminNotes || "";
    prescription.approvedBy = null;
    prescription.approvedAt = null;
    await prescription.save();

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
