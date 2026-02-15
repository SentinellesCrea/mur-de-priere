import mongoose from "mongoose";

const PrayerRequestSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { 
    type: String, 
    trim: true, 
    lowercase: true 
  },
  phone: { type: String, trim: true },

  prayerRequest: { type: String, required: true },

  notify: { type: Boolean, default: false },
  wantsVolunteer: { type: Boolean, default: false },
  isUrgent: { type: Boolean, default: false },

  nombrePriants: { type: Number, default: 0 },

  datePublication: { 
    type: Date, 
    default: Date.now,
    index: true
  },

  reserveTo: { type: mongoose.Schema.Types.ObjectId, ref: "Volunteer", default: null },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "Volunteer", default: null },
  finishedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Volunteer", default: null },

  isAnswered: { type: Boolean, default: false },

  category: {
    type: String,
    enum: [
      "Famille",
      "Santé spirituelle",
      "Santé physique",
      "Relations",
      "Mariage",
      "Ministère",
      "Travail",
      "Finances",
      "Foi",
      "Autres"
    ],
    required: true,
  },

  subcategory: { type: String },

  allowComments: { type: Boolean, default: true },

  authorToken: { type: String, index: true },

  commentCycleStart: { type: Date },
  lastImmediateNotificationAt: { type: Date },
  dailyCommentCount: { type: Number, default: 0 },
  digestSentAt: { type: Date },

}, { timestamps: true });

PrayerRequestSchema.index(
  { dailyCommentCount: 1 },
  { partialFilterExpression: { dailyCommentCount: { $gt: 0 } } }
);

export default mongoose.models.PrayerRequest ||
mongoose.model("PrayerRequest", PrayerRequestSchema);
