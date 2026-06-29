import mongoose from "mongoose";

const VolunteerProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    isAvailable: { type: Boolean, default: false, index: true },
    completedMissions: { type: Number, default: 0 },
    gender: { type: String, enum: ["male", "female", "other", "prefer_not_to_say", ""], default: "" },
    dateOfBirth: { type: Date, default: null },
    address: { type: String, default: "", trim: true },
    legacyVolunteerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Volunteer",
      default: null,
      index: true,
    },
  },
  { timestamps: true }
);

export default mongoose.models.VolunteerProfile ||
  mongoose.model("VolunteerProfile", VolunteerProfileSchema);
