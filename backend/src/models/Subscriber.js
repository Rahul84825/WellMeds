import mongoose from "mongoose";

const subscriberSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,})+$/,
        "Please provide a valid email address",
      ],
    },
    source: {
      type: String,
      default: "maintenance_page",
    },
    subscribedAt: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ["Subscribed", "Unsubscribed"],
      default: "Subscribed",
    },
    notified: {
      type: Boolean,
      default: false,
    },
    notifiedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export const Subscriber = mongoose.model("Subscriber", subscriberSchema);
