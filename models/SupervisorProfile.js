import mongoose from "mongoose";

const SupervisorProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    canModeratePrayers: { type: Boolean, default: true },
    canModerateTestimonies: { type: Boolean, default: true },
    canManageResources: { type: Boolean, default: true },
    canManageVolunteers: { type: Boolean, default: true },
    legacyVolunteerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Volunteer",
      default: null,
      index: true,
    },
  },
  { timestamps: true }
);

export default mongoose.models.SupervisorProfile ||
  mongoose.model("SupervisorProfile", SupervisorProfileSchema);
