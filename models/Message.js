import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema({
  conversationId: { type: String, required: true },
  sender: { type: String, enum: ["volunteer", "guest"], required: true },
  message: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
}, { timestamps: true });

export default mongoose.models.Message || mongoose.model("Message", MessageSchema);
