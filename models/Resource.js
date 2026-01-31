import mongoose from "mongoose";

/* ================= BLOCK SCHEMA ================= */
const ResourceBlockSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      enum: [
        "hero",
        "text",
        "verse",
        "textImage",
        "image",
        "video",
        "audio",
        "divider",
        "callout",
      ],
    },

    data: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },

    order: {
      type: Number,
      default: 0,
    },
  },
  { _id: false }
);

/* ================= RESOURCE SCHEMA ================= */
const ResourceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },

    category: {
      type: String,
      required: true,
      enum: [
        "priere",
        "meditation",
        "encouragement",
        "enseignement",
        "foi",
        "autres",
      ],
    },

    excerpt: {
      type: String,
      maxlength: 300,
    },

    /* 🖼️ Image principale (cards, SEO, preview) */
    coverImage: {
      type: String,
    },

    /* ⏱️ Temps de lecture estimé (en minutes) */
    readingTime: {
      type: Number,
    },

    status: {
      type: String,
      enum: ["draft", "published"],
      default: "draft",
    },

    blocks: {
      type: [ResourceBlockSchema],
      default: [],
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin", // ou Supervisor / User plus tard
      required: true,
    },

    publishedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       
  }
);

/* ================= MIDDLEWARE ================= */
/* Auto-set publishedAt */
ResourceSchema.pre("save", function (next) {
  if (this.status === "published" && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  next();
});

/* ================= INDEXES ================= */
ResourceSchema.index({ status: 1, category: 1 });

export default mongoose.models.Resource ||
  mongoose.model("Resource", ResourceSchema);
