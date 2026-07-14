import mongoose from "mongoose";

const megaMenuItemSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: [true, "Item type is required"],
      enum: ["condition", "speciality", "source", "quick-link"],
    },
    name: {
      type: String,
      required: [true, "Name/Title is required"],
      trim: true,
    },
    slug: {
      type: String,
      trim: true,
    },
    icon: {
      type: String,
      default: "",
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
    visible: {
      type: Boolean,
      default: true,
    },

    // Type-specific fields
    linkedCategory: {
      type: String,
      default: "",
    },
    linkedSpeciality: {
      type: String,
      default: "",
    },
    queryParam: {
      type: String,
      default: "",
    },
    route: {
      type: String,
      default: "",
    },
    isExternal: {
      type: Boolean,
      default: false,
    },
    openInNewTab: {
      type: Boolean,
      default: false,
    },
    isHelpCard: {
      type: Boolean,
      default: false,
    },
    helpSubtext: {
      type: String,
      default: "",
    }
  },
  {
    timestamps: true,
  }
);

export const MegaMenuItem = mongoose.model("MegaMenuItem", megaMenuItemSchema);
