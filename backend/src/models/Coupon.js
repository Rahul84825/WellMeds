import mongoose from "mongoose";

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, "Coupon code is required"],
      unique: true,
      trim: true,
      uppercase: true,
    },
    name: {
      type: String,
      default: "",
    },
    description: {
      type: String,
      default: "",
    },
    discountType: {
      type: String,
      enum: ["percentage", "fixed"],
      default: "percentage",
    },
    // CANONICAL FIELD: Use this for discount amount
    discountValue: {
      type: Number,
      required: [true, "Discount value is required"],
      min: [0, "Discount value cannot be negative"],
    },
    // CANONICAL FIELD: Use this for minimum order requirement
    minimumOrder: {
      type: Number,
      default: 0,
      min: [0, "Minimum order value cannot be negative"],
    },
    maximumDiscount: {
      type: Number,
      default: 0,
      min: [0, "Maximum discount cannot be negative"],
    },
    usageLimit: {
      type: Number,
      default: null, // null means unlimited
    },
    usedCount: {
      type: Number,
      default: 0,
    },
    perUserLimit: {
      type: Number,
      default: 1,
    },
    // CANONICAL FIELD: Use this for active status
    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    expiryDate: {
      type: Date,
      required: true,
    },
    applicableCategories: {
      type: [String],
      default: [],
    },
    applicableProducts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
    freeDelivery: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

couponSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

// Pre-save hook to ensure required fields are set
couponSchema.pre("save", function (next) {
  // Ensure discountValue is set (canonical field)
  if (!this.discountValue && this.discountValue !== 0) {
    throw new Error("Discount value is required");
  }

  // Ensure status is set properly
  if (!this.status) {
    this.status = "Active";
  }

  next();
});

export const Coupon = mongoose.model("Coupon", couponSchema);
