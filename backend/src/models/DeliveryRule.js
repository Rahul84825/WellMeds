import mongoose from "mongoose";

const deliveryRuleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Rule name is required"],
      trim: true,
    },
    type: {
      type: String,
      enum: ["flat", "order_total_slab", "pincode_slab", "state_slab"],
      default: "flat",
    },
    minOrderAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    maxOrderAmount: {
      type: Number,
      default: null,
    },
    charge: {
      type: Number,
      required: [true, "Delivery charge is required"],
      default: 99,
      min: 0,
    },
    freeDeliveryThreshold: {
      type: Number,
      default: 2000, // Free delivery on orders above ₹2000
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    priority: {
      type: Number,
      default: 0,
    },
    description: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

export const DeliveryRule = mongoose.model("DeliveryRule", deliveryRuleSchema);
