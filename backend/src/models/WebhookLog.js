import mongoose from "mongoose";

const webhookLogSchema = new mongoose.Schema(
  {
    eventId: {
      type: String,
      required: true,
      unique: true,
    },
    paymentId: {
      type: String,
      default: null,
    },
    orderId: {
      type: String,
      default: null,
    },
    receivedTimestamp: {
      type: Date,
      default: Date.now,
    },
    verificationStatus: {
      type: String,
      enum: ["Verified", "Failed"],
      required: true,
    },
    processingStatus: {
      type: String,
      enum: ["Success", "Error", "Duplicate", "Pending"],
      default: "Pending",
    },
    retryCount: {
      type: Number,
      default: 0,
    },
    payload: {
      type: Object,
      default: {},
    },
    error: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export const WebhookLog = mongoose.model("WebhookLog", webhookLogSchema);
