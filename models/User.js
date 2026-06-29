import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const ROLES = ["admin", "volunteer", "supervisor"];
const STATUSES = ["pending", "validated", "rejected", "disabled"];

const UserSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, default: "", trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },
    phone: { type: String, default: "", trim: true },
    gender: { type: String, enum: ["male", "female", "other", "prefer_not_to_say", ""], default: "" },
    dateOfBirth: { type: Date, default: null },
    address: { type: String, default: "", trim: true },
    profileImage: { type: String, default: "" },
    role: { type: String, enum: ROLES, required: true, index: true },
    status: { type: String, enum: STATUSES, default: "pending", index: true },
    isValidated: { type: Boolean, default: false, index: true },
    passwordResetVersion: { type: Number, default: 0, select: false },
    deletedAt: { type: Date, default: null, select: false },

    // Compatibilité temporaire avec les collections historiques Admin/Volunteer.
    legacyModel: { type: String, enum: ["Admin", "Volunteer", null], default: null, index: true },
    legacyId: { type: mongoose.Schema.Types.ObjectId, default: null, index: true },
  },
  { timestamps: true }
);

UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const alreadyHashed = /^\$2[aby]\$\d{2}\$/.test(this.password);
    if (!alreadyHashed) {
      this.password = await bcrypt.hash(this.password, 10);
    }
    next();
  } catch (error) {
    next(error);
  }
});

UserSchema.methods.comparePassword = async function (password) {
  return bcrypt.compare(password, this.password);
};

export default mongoose.models.User || mongoose.model("User", UserSchema);
