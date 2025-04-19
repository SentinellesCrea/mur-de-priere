import mongoose from "mongoose";

const MissionSchema = new mongoose.Schema(
  {
    requesterfirstName: { type: String, required: true },
    requesterlastName: { type: String, default: "" }, // 🔁 maintenant optionnel
    requesterEmail: { type: String, required: true },
    requesterPhone: { type: String }, // déjà optionnel ✅
    prayerRequest: { type: String, required: true },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Volunteer",
      required: true,
    },
    status: {
    type: String,
    enum: ["available", "assigned", "rejected"], // Nouveau champ de statut
    default: "available", // Par défaut, la mission est disponible
    },
    prayerRequestIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "PrayerRequest" }],
  },
  { timestamps: true }
);

export default mongoose.models.Mission || mongoose.model("Mission", MissionSchema);
