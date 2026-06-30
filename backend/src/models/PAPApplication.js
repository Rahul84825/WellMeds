import mongoose from "mongoose";

const papApplicationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    patientName: {
      type: String,
      required: true,
    },
    age: {
      type: Number,
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
    medicine: {
      type: String,
      required: true,
    },
    doctor: {
      type: String,
      default: "",
    },
    hospital: {
      type: String,
      default: "",
    },
    prescription: {
      type: String, // file path / url
      default: null,
    },
    documents: {
      type: String, // file path / url
      default: null,
    },
    income: {
      type: String,
      default: "",
    },
    message: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["Pending", "Reviewing", "Approved", "Rejected"],
      default: "Pending",
    },
    notes: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for short id
papApplicationSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

export const PAPApplication = mongoose.model("PAPApplication", papApplicationSchema);
