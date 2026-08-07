import mongoose from "mongoose";

const addressSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
    },
    mobile: {
      type: String,
      required: [true, "Mobile number is required"],
      trim: true,
      match: [/^[6-9]\d{9}$/, "Please enter a valid 10-digit Indian mobile number"],
    },
    altMobile: {
      type: String,
      default: "",
      trim: true,
      validate: {
        validator: function (v) {
          if (!v) return true;
          return /^[6-9]\d{9}$/.test(v);
        },
        message: "Please enter a valid 10-digit alternate mobile number",
      },
    },
    houseNo: {
      type: String,
      required: [true, "House / Flat / Apartment number is required"],
      trim: true,
    },
    building: {
      type: String,
      required: [true, "Building / Society name is required"],
      trim: true,
    },
    street: {
      type: String,
      required: [true, "Street / Area is required"],
      trim: true,
    },
    landmark: {
      type: String,
      default: "",
      trim: true,
    },
    city: {
      type: String,
      required: [true, "City is required"],
      trim: true,
    },
    state: {
      type: String,
      required: [true, "State is required"],
      trim: true,
    },
    country: {
      type: String,
      default: "India",
      trim: true,
    },
    pincode: {
      type: String,
      required: [true, "PIN Code is required"],
      trim: true,
      match: [/^\d{6}$/, "Please enter a valid 6-digit PIN code"],
    },
    type: {
      type: String,
      enum: ["Home", "Work", "Other"],
      default: "Home",
    },
    deliveryInstructions: {
      type: String,
      default: "",
      trim: true,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
    latitude: {
      type: Number,
      default: null,
    },
    longitude: {
      type: Number,
      default: null,
    },
    placeId: {
      type: String,
      default: "",
      trim: true,
    },
    formattedAddress: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for formatted single-line address display
addressSchema.virtual("displayAddress").get(function () {
  if (this.formattedAddress && this.formattedAddress.trim().length > 0) {
    return this.formattedAddress;
  }
  const parts = [
    this.houseNo,
    this.building,
    this.street,
    this.landmark ? `Near ${this.landmark}` : null,
    `${this.city}, ${this.state} - ${this.pincode}`,
    this.country,
  ].filter(Boolean);
  return parts.join(", ");
});

export const Address = mongoose.model("Address", addressSchema);
