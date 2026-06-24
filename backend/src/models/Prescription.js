import mongoose from "mongoose";

const prescriptionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Original file name from the user's device
    name: {
      type: String,
      required: true,
    },
    // Cloudinary / disk URL
    fileUrl: {
      type: String,
      required: true,
    },
    // File metadata
    fileSize: {
      type: Number, // bytes
      default: 0,
    },
    fileType: {
      type: String, // e.g. "image/jpeg", "application/pdf"
      default: "",
    },
    // Verification workflow
    status: {
      type: String,
      enum: ["Pending Review", "Under Verification", "Approved", "Rejected", "Expired"],
      default: "Pending Review",
    },
    adminNotes: {
      type: String,
      default: "",
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    approvedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual: short hex id
prescriptionSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

// Virtual: formatted date
prescriptionSchema.virtual("date").get(function () {
  return this.createdAt.toISOString().split("T")[0];
});

// Virtual: human-readable file size
prescriptionSchema.virtual("fileSizeFormatted").get(function () {
  if (!this.fileSize) return "Unknown size";
  const kb = this.fileSize / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  return `${(kb / 1024).toFixed(2)} MB`;
});

export const Prescription = mongoose.model("Prescription", prescriptionSchema);
