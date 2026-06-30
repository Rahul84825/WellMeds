import mongoose from "mongoose";

const importRequestSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    medicineName: {
      type: String,
      required: true,
    },
    saltName: {
      type: String,
      default: "",
    },
    brand: {
      type: String,
      default: "",
    },
    country: {
      type: String,
      default: "",
    },
    quantity: {
      type: Number,
      required: true,
      default: 1,
    },
    prescription: {
      type: String, // file path / url
      default: null,
    },
    phone: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["Pending", "Processing", "Approved", "Rejected"],
      default: "Pending",
    },
    assignedPharmacist: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for short id
importRequestSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

export const ImportRequest = mongoose.model("ImportRequest", importRequestSchema);
