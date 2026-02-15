import mongoose from "mongoose";

const CommentSchema = new mongoose.Schema(
  {
    prayerRequest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PrayerRequest",
      required: true,
      index: true,
    },

    authorName: {
      type: String,
      trim: true,
      maxlength: 50,
      default: "Un intercesseur anonyme",
    },

    text: {
      type: String,
      required: true,
      maxlength: 500,
    },

    isModerated: {
      type: Boolean,
      default: true,
    },

    needsReview: {
      type: Boolean,
      default: false,
    },

    authorToken: {
      type: String,
      index: true,
    },

  },
  {
    timestamps: true,
  }
);

// 🔥 Index pour requêtes rapides
CommentSchema.index({ prayerRequest: 1, createdAt: -1 });

export default mongoose.models.Comment ||
mongoose.model("Comment", CommentSchema);
