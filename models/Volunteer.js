import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const VolunteerSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },
    phone: { type: String, required: true },
    gender: { type: String, enum: ["male", "female", "other", "prefer_not_to_say", ""], default: "" },
    dateOfBirth: { type: Date, default: null },
    address: { type: String, default: "", trim: true },
    profileImage: { type: String, default: "" },
    passwordResetVersion: { type: Number, default: 0, select: false },
    deletedAt: { type: Date, default: null, select: false },
    isValidated: { type: Boolean, default: false }, // ✅ Ajout du statut de validation
    isAvailable: { type: Boolean, default: false },
    role: { type: String, enum: ["volunteer", "supervisor"], default: "volunteer" },
    date: { type: Date, default: Date.now }, // Utilisation correcte de Date.now pour la date personnalisée
    status: {
      type: String,
      enum: ['pending', 'validated', 'rejected'],
      default: 'pending',
    }
  },
  { timestamps: false } // Désactive les timestamps automatiques
);

// Hachage du mot de passe avant sauvegarde
VolunteerSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Comparer un mot de passe avec le haché
VolunteerSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

// Vérifier si le modèle existe déjà pour éviter l'erreur
export default mongoose.models.Volunteer || mongoose.model("Volunteer", VolunteerSchema);
