import mongoose from "mongoose";

const PrayerRequestSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: false },
  phone: { type: String, required: false },
  prayerRequest: { type: String, required: true },
  notify: { type: Boolean, default: false },
  wantsVolunteer: { type: Boolean, default: false },
  isUrgent: { type: Boolean, default: false },
  nombrePriants: { type: Number, default: 0 },
  datePublication: { type: Date, default: Date.now },
  reserveTo: { type: mongoose.Schema.Types.ObjectId, ref: "Volunteer", default: null },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "Volunteer", default: null },
  isAssigned: { type: Boolean, default: false },
  category: {
    type: String,
    enum: ["Famille", "Santé spirituelle", "Santé physique", "Relations", "Mariage", "Ministère", "Travail", "Finances", "Foi", "Autres"],
    required: true,
  },
  subcategory: { type: String },
  finishedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Volunteer", default: null },
  isAnswered: { type: Boolean, default: false },

  // ✅ Nouveau champ pour autoriser ou non les commentaires
  allowComments: { type: Boolean, default: true },
});

export default mongoose.models.PrayerRequest || mongoose.model("PrayerRequest", PrayerRequestSchema);
