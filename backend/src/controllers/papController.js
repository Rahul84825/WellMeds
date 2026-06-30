import { PAPApplication } from "../models/PAPApplication.js";

// @desc    Apply for Patient Assistance Program (PAP)
// @route   POST /api/pap/apply
// @access  Public
export const applyPAP = async (req, res, next) => {
  try {
    const {
      patientName,
      age,
      phone,
      email,
      medicine,
      doctor,
      hospital,
      income,
      message,
    } = req.body;

    if (!patientName || !phone || !email || !medicine) {
      return res.status(400).json({
        success: false,
        message: "Please fill in all required fields (Patient Name, Phone, Email, Medicine).",
      });
    }

    let prescriptionPath = null;
    let documentsPath = null;

    if (req.files) {
      if (req.files.prescription && req.files.prescription[0]) {
        prescriptionPath = `/uploads/${req.files.prescription[0].filename}`;
      }
      if (req.files.documents && req.files.documents[0]) {
        documentsPath = `/uploads/${req.files.documents[0].filename}`;
      }
    }

    const papApplication = await PAPApplication.create({
      user: req.user ? req.user._id : null,
      patientName,
      age: age ? Number(age) : null,
      phone,
      email,
      medicine,
      doctor,
      hospital,
      prescription: prescriptionPath,
      documents: documentsPath,
      income,
      message,
    });

    res.status(201).json({
      success: true,
      message: "PAP application submitted successfully! A case manager will review your documents within 24 hours.",
      data: papApplication,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all PAP applications (Admin only)
// @route   GET /api/admin/pap-applications
// @access  Private/Admin
export const getPAPApplications = async (req, res, next) => {
  try {
    const { status, search } = req.query;
    let query = {};

    if (status && status !== "all") {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { patientName: { $regex: search, $options: "i" } },
        { medicine: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const applications = await PAPApplication.find(query)
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: applications.length,
      data: applications,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update PAP application status/notes (Admin only)
// @route   PUT /api/admin/pap-applications/:id
// @access  Private/Admin
export const updatePAPApplication = async (req, res, next) => {
  try {
    const { status, notes } = req.body;
    const application = await PAPApplication.findById(req.params.id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "PAP application not found.",
      });
    }

    if (status) {
      application.status = status;
    }

    if (notes !== undefined) {
      application.notes = notes;
    }

    await application.save();

    const updated = await PAPApplication.findById(req.params.id)
      .populate("user", "name email");

    res.status(200).json({
      success: true,
      message: "PAP application updated successfully.",
      data: updated,
    });
  } catch (err) {
    next(err);
  }
};
