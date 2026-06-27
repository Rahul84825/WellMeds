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
    discountAmount: {
      type: Number,
      min: [0, "Discount amount cannot be negative"],
    },
    discountValue: {
      type: Number,
      required: [true, "Discount value is required"],
      min: [0, "Discount value cannot be negative"],
    },
    minOrderValue: {
      type: Number,
      default: 0,
      min: [0, "Min order value cannot be negative"],
    },
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
    isActive: {
      type: Boolean,
      default: true,
    },
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

// Pre-save hook to synchronize legacy fields (discountAmount, minOrderValue, isActive)
// with the new extended schema fields (discountValue, minimumOrder, status)
couponSchema.pre("save", function (next) {
  if (this.discountValue === undefined && this.discountAmount !== undefined) {
    this.discountValue = this.discountAmount;
  } else if (this.discountAmount === undefined && this.discountValue !== undefined) {
    this.discountAmount = this.discountValue;
  }

  if (this.minimumOrder === undefined && this.minOrderValue !== undefined) {
    this.minimumOrder = this.minOrderValue;
  } else if (this.minOrderValue === undefined && this.minimumOrder !== undefined) {
    this.minOrderValue = this.minimumOrder;
  }

  if (this.status === "Active") {
    this.isActive = true;
  } else if (this.status === "Inactive") {
    this.isActive = false;
  } else {
    this.status = this.isActive ? "Active" : "Inactive";
  }

  next();
});

export const Coupon = mongoose.model("Coupon", couponSchema);
