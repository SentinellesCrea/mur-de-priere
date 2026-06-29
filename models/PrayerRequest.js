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
  assignedBy: { type: mongoose.Schema.Types.ObjectId },
  assignedByRole: {
    type: String,
    enum: ["admin", "supervisor", "volunteer"],
  },
  assignedAt: { type: Date },
  delegatedBySupervisor: { type: mongoose.Schema.Types.ObjectId, ref: "Volunteer" },
  delegatedAt: { type: Date },
  finishedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Volunteer", default: null },

  isAnswered: { type: Boolean, default: false },
  isAssigned: { type: Boolean, default: false },
  isModerated: { type: Boolean, default: true, index: true },
  needsReview: { type: Boolean, default: false, index: true },
  rejectedAt: { type: Date },
  rejectedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Volunteer" },

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

  authorToken: { type: String, index: true, select: false },

  canEdit: { type: Boolean, default: true },
  
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
