import mongoose from "mongoose";

const TestimonySchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    testimony: { type: String, required: true },
    date: { type: Date, default: Date.now },
    isNewTestimony: { type: Boolean, default: true },

    // ✅ correction ici
    isModerate: { type: Boolean, default: false, index: true },
    needsReview: { type: Boolean, default: true },

    likes: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.models.Testimony ||
  mongoose.model("Testimony", TestimonySchema);
