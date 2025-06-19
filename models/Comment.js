import mongoose from "mongoose";

const CommentSchema = new mongoose.Schema(
  {
    prayerRequest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PrayerRequest",
      required: true,
    },
    authorName: {
      type: String,
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
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Comment || mongoose.model("Comment", CommentSchema);
