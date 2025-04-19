import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const VolunteerSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String, required: true },
    profileImage: { type: String }, // base64 encodé (data:image/jpeg;base64,...)
    isValidated: { type: Boolean, default: false }, // ✅ Ajout du statut de validation
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
