import mongoose from "mongoose";

const tocItemSchema = new mongoose.Schema(
  {
    id: { type: String, default: "" },
    label: { type: String, default: "" },
    level: { type: Number, default: 2 },
    order: { type: Number, default: 0 },
  },
  { _id: false }
);

const sectionImageSchema = new mongoose.Schema(
  {
    url: { type: String, default: "" },
    alt: { type: String, default: "" },
    caption: { type: String, default: "" },
  },
  { _id: false }
);

const sectionTableSchema = new mongoose.Schema(
  {
    headers: { type: [String], default: [] },
    rows: { type: [[String]], default: [] },
  },
  { _id: false }
);

const sectionSchema = new mongoose.Schema(
  {
    id: { type: String, default: "" },
    heading: { type: String, default: "" },
    subHeading: { type: String, default: "" },
    content: { type: String, default: "" },
    type: {
      type: String,
      default: "text",
    },
    paragraphs: { type: [String], default: [] },
    bullets: { type: [String], default: [] },
    numbered: { type: [String], default: [] },
    images: { type: [sectionImageSchema], default: [] },
    table: { type: sectionTableSchema, default: null },
    callout: { type: String, default: "" },
    order: { type: Number, default: 0 },
  },
  { _id: false }
);

const faqItemSchema = new mongoose.Schema(
  {
    question: { type: String, default: "" },
    answer: { type: String, default: "" },
    order: { type: Number, default: 0 },
  },
  { _id: false }
);

const referenceItemSchema = new mongoose.Schema(
  {
    title: { type: String, default: "" },
    source: { type: String, default: "" },
    url: { type: String, default: "" },
    details: { type: String, default: "" },
    order: { type: Number, default: 0 },
  },
  { _id: false }
);

const expertItemSchema = new mongoose.Schema(
  {
    name: { type: String, default: "" },
    qualification: { type: String, default: "" },
    role: { type: String, default: "" },
    experience: { type: String, default: "" },
    avatar: { type: String, default: "" },
    profileUrl: { type: String, default: "" },
  },
  { _id: false }
);

const articleSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Article title is required"],
      trim: true,
      index: true,
    },
    slug: {
      type: String,
      required: [true, "Article slug is required"],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    excerpt: {
      type: String,
      trim: true,
      default: "",
    },
    content: {
      type: String,
      default: "",
    },
    category: {
      type: String,
      required: [true, "Article category is required"],
      trim: true,
      default: "Health Guides",
      index: true,
    },
    categoryBadge: {
      type: String,
      trim: true,
      default: "",
    },
    topic: {
      type: String,
      trim: true,
      default: "General",
      index: true,
    },
    tags: {
      type: [String],
      default: [],
    },
    readTime: {
      type: String,
      default: "5 min read",
    },
    coverImage: {
      type: String,
      default: "",
    },
    heroImage: {
      type: String,
      default: "",
    },
    author: {
      name: { type: String, default: "Wellmeds Health Team" },
      title: { type: String, default: "Clinical Editorial Team" },
      credentials: { type: String, default: "" },
      avatar: { type: String, default: "" },
      bio: { type: String, default: "" },
    },
    reviewer: {
      name: { type: String, default: "Payal Choudhary" },
      title: { type: String, default: "Clinical Pharmacist" },
      qualifications: { type: String, default: "D.Pharm" },
      avatar: { type: String, default: "" },
      avatarText: { type: String, default: "PC" },
    },
    tableOfContents: {
      type: [tocItemSchema],
      default: [],
    },
    sections: {
      type: [sectionSchema],
      default: [],
    },
    faqs: {
      type: [faqItemSchema],
      default: [],
    },
    references: {
      type: [referenceItemSchema],
      default: [],
    },
    disclaimer: {
      type: String,
      default: "",
    },
    experts: {
      type: [expertItemSchema],
      default: [],
    },
    seo: {
      metaTitle: { type: String, default: "" },
      metaDescription: { type: String, default: "" },
      canonicalUrl: { type: String, default: "" },
      ogImage: { type: String, default: "" },
      keywords: { type: mongoose.Schema.Types.Mixed, default: [] },
      noIndex: { type: Boolean, default: false },
    },
    gradientClass: {
      type: String,
      default: "slide-bg-1",
    },
    isFeatured: {
      type: Boolean,
      default: false,
      index: true,
    },
    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "published",
      index: true,
    },
    active: {
      type: Boolean,
      default: true,
      index: true,
    },
    views: {
      type: Number,
      default: 0,
    },
    displayOrder: {
      type: Number,
      default: 0,
    },
    publishedAt: {
      type: Date,
      default: Date.now,
    },
    lastUpdatedDate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Synchronize status and active flags before save
articleSchema.pre("save", function (next) {
  if (this.status === "published") {
    this.active = true;
  } else if (this.status === "draft" || this.status === "archived") {
    this.active = false;
  } else {
    this.status = this.active ? "published" : "draft";
  }

  // Synchronize coverImage and heroImage
  if (this.heroImage && !this.coverImage) {
    this.coverImage = this.heroImage;
  } else if (this.coverImage && !this.heroImage) {
    this.heroImage = this.coverImage;
  }

  next();
});

export const Article = mongoose.model("Article", articleSchema);
