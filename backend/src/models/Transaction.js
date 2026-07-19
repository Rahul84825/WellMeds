import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    paymentId: {
      type: String,
      default: null,
      unique: true,
      sparse: true,
    },
    razorpayOrderId: {
      type: String,
      required: true,
    },
    orderId: {
      type: String,
      default: null,
    },
    paymentMethod: {
      type: String,
      default: "card",
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: "INR",
    },
    status: {
      type: String,
      default: "Pending", // Pending, Captured, Failed, Refunded
    },
    webhookProcessedTime: {
      type: Date,
      default: null,
    },
    refundStatus: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export const Transaction = mongoose.model("Transaction", transactionSchema);
