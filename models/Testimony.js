import mongoose from "mongoose";

const TestimonySchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  testimony: { type: String, required: true },
  date: { type: Date, default: Date.now },
  isNewTestimony: { type: Boolean, default: true },
  isModerate: { type: String, default: false },
  likes: { type: Number, default: 0 },
});

export default mongoose.models.Testimony || mongoose.model("Testimony", TestimonySchema);
