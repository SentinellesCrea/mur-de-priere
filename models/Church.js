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
  coordinates: {
  type: {
    type: String,
    enum: ["Point"],
    default: "Point",
    required: true,
  },
  coordinates: {
    type: [Number], // [lng, lat]
    required: true,
    index: "2dsphere", // ✅ très important
  },
},

  isValidated: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.models.Church || mongoose.model("Church", ChurchSchema);
