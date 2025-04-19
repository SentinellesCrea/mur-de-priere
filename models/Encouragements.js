import mongoose from "mongoose";

const VideoSchema = new mongoose.Schema({
  title: { type: String, required: true },
  url: { type: String, required: true },
  message: { type: String, required: true }, // 📝 Message d'encouragement associé à la vidéo
  dateAdded: { type: Date, default: Date.now },
});

export default mongoose.models.Video || mongoose.model("Video", VideoSchema);
