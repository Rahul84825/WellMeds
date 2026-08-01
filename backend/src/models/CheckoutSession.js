import mongoose from "mongoose";

const checkoutSessionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    cartSnapshot: {
      items: [
        {
          productId: { type: String, required: true },
          name: { type: String, default: "" },
          quantity: { type: Number, required: true, min: 1 },
          price: { type: Number, default: 0 },
          requiresRx: { type: Boolean, default: false },
        },
      ],
      subtotal: { type: Number, default: 0 },
      requiresRx: { type: Boolean, default: false },
    },
    prescription: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Prescription",
      default: null,
    },
    status: {
      type: String,
      enum: [
        "ACTIVE",
        "LOCKED",
        "PENDING_VERIFICATION",
        "VERIFIED",
        "PAYMENT_PENDING",
        "PAYMENT_SUCCESS",
        "EXPIRED",
        "CANCELLED",
      ],
      default: "ACTIVE",
    },
    isLocked: {
      type: Boolean,
      default: false,
    },
    lockReason: {
      type: String,
      default: "",
    },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    },
  },
  {
    timestamps: true,
  }
);

// Virtual: Check if session has expired
checkoutSessionSchema.virtual("isExpired").get(function () {
  return Date.now() > this.expiresAt.getTime();
});

export const CheckoutSession = mongoose.model("CheckoutSession", checkoutSessionSchema);
