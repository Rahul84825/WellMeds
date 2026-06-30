import { ImportRequest } from "../models/ImportRequest.js";

// @desc    Create a new imported medicine request
// @route   POST /api/import-requests
// @access  Public
export const createImportRequest = async (req, res, next) => {
  try {
    const {
      medicineName,
      saltName,
      brand,
      country,
      quantity,
      phone,
      email,
      message,
    } = req.body;

    if (!medicineName || !phone || !email || !quantity) {
      return res.status(400).json({
        success: false,
        message: "Please fill in all required fields (Medicine Name, Quantity, Phone, Email).",
      });
    }

    let prescriptionPath = null;
    if (req.file) {
      prescriptionPath = `/uploads/${req.file.filename}`;
    }

    const importRequest = await ImportRequest.create({
      user: req.user ? req.user._id : null,
      medicineName,
      saltName,
      brand,
      country,
      quantity: Number(quantity),
      prescription: prescriptionPath,
      phone,
      email,
      message,
    });

    res.status(201).json({
      success: true,
      message: "Import request submitted successfully! A pharmacist will review it soon.",
      data: importRequest,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all import requests (Admin only)
// @route   GET /api/admin/import-requests
// @access  Private/Admin
export const getImportRequests = async (req, res, next) => {
  try {
    const { status, search } = req.query;
    let query = {};

    if (status && status !== "all") {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { medicineName: { $regex: search, $options: "i" } },
        { saltName: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const requests = await ImportRequest.find(query)
      .populate("user", "name email")
      .populate("assignedPharmacist", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: requests.length,
      data: requests,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update import request status/pharmacist (Admin only)
// @route   PUT /api/admin/import-requests/:id
// @access  Private/Admin
export const updateImportRequest = async (req, res, next) => {
  try {
    const { status, assignedPharmacist } = req.body;
    const request = await ImportRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Import request not found.",
      });
    }

    if (status) {
      request.status = status;
    }

    if (assignedPharmacist !== undefined) {
      request.assignedPharmacist = assignedPharmacist || null;
    }

    await request.save();

    const updated = await ImportRequest.findById(req.params.id)
      .populate("user", "name email")
      .populate("assignedPharmacist", "name email");

    res.status(200).json({
      success: true,
      message: "Import request updated successfully.",
      data: updated,
    });
  } catch (err) {
    next(err);
  }
};
