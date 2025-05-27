import mongoose from "mongoose";

const ConversationSchema = new mongoose.Schema({
  conversationId: { type: String, required: true, unique: true },
  volunteerId: { type: mongoose.Schema.Types.ObjectId, ref: "Volunteer", required: true },
  prayerName: { type: String },       // pour affichage
  prayerEmail: { type: String },
  prayerPhone: { type: String },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Conversation || mongoose.model("Conversation", ConversationSchema);
