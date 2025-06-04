import mongoose from "mongoose";

const ChurchSchema = new mongoose.Schema({
  name: { type: String, required: true },
  address: { type: String, required: true },
  city: String,
  postalCode: String,
  country: String,
  email: String,
  phone: String,
  website: String,
  socialLinks: {
    facebook: String,
    instagram: String,
    youtube: String,
    others: [String],
  },
  isValidated: { type: Boolean, default: false } // Validation manuelle par l’admin
}, { timestamps: true });

export default mongoose.models.Church || mongoose.model("Church", ChurchSchema);
