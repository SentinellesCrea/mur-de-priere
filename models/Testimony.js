import mongoose from "mongoose";

const TestimonySchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  testimony: { type: String, required: true },
  date: { type: Date, default: Date.now },
  isNew: { type: Boolean, default: true },
  likes: { type: Number, default: 0 },
});

export default mongoose.models.Testimony || mongoose.model("Testimony", TestimonySchema);
