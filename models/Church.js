import mongoose from "mongoose";
import { buildChurchSearchFields } from "@/lib/churchDirectory";

const ChurchSchema = new mongoose.Schema({
  name: { type: String, required: true },
  address: { type: String, required: true },
  city: { type: String, trim: true, index: true },
  postalCode: { type: String, trim: true, index: true },
  country: { type: String, trim: true, index: true },
  email: String,
  phone: String,
  website: String,
  tradition: {
    type: String,
    enum: ["Catholique", "Protestante", "Évangélique", "Orthodoxe", "Autre"],
    default: "Autre",
    index: true,
  },
  denomination: { type: String, trim: true, index: true },
  networkName: { type: String, trim: true, index: true },
  campusName: { type: String, trim: true },
  aliases: [{ type: String, trim: true }],
  normalizedName: { type: String, select: false },
  normalizedCity: { type: String, select: false },
  normalizedPostalCode: { type: String, select: false },
  normalizedCountry: { type: String, select: false },
  normalizedAliases: { type: [String], select: false },
  searchTokens: { type: [String], select: false },
  locationTokens: { type: [String], select: false },
  region: { type: String, trim: true, index: true },
  countryCode: { type: String, trim: true, uppercase: true, index: true },
  leaderName: { type: String, trim: true },
  languages: [{ type: String, trim: true }],
  serviceTimes: { type: String, trim: true },
  description: { type: String, trim: true },
  accessibility: { type: Boolean, default: false },
  childrenWelcome: { type: Boolean, default: false },
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
  },
},

  isValidated: { type: Boolean, default: false, index: true },
  status: {
    type: String,
    enum: ["pending", "validated", "rejected", "archived", "disabled"],
    default: "pending",
    index: true,
  },
  submittedBy: {
    type: String,
    enum: ["church", "admin", "visitor"],
    default: "church",
  },
  validatedAt: Date,
  validatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  rejectedAt: Date,
  archivedAt: Date,
  disabledAt: Date,
  source: {
    type: String,
    default: "self",
    trim: true,
    index: true,
  },
  sourceId: { type: String, trim: true },
  sourceUrl: { type: String, trim: true },
  lastVerifiedAt: Date,
  verificationStatus: {
    type: String,
    enum: ["unverified", "verified", "outdated"],
    default: "unverified",
    index: true,
  },
  management: {
    status: {
      type: String,
      enum: ["unmanaged", "claim_pending", "managed", "suspended"],
      default: "unmanaged",
    },
    managers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    claimedAt: Date,
    verifiedAt: Date,
  },
}, { timestamps: true });

ChurchSchema.index({ coordinates: "2dsphere" });
ChurchSchema.index({ searchTokens: 1 });
ChurchSchema.index({ locationTokens: 1 });
ChurchSchema.index({ normalizedAliases: 1 });
ChurchSchema.index({ status: 1, normalizedCountry: 1, normalizedCity: 1, name: 1 });
ChurchSchema.index({ status: 1, tradition: 1, denomination: 1, name: 1 });
ChurchSchema.index({ status: 1, networkName: 1, name: 1 });
ChurchSchema.index({ "management.status": 1, status: 1 });
ChurchSchema.index(
  {
    name: "text",
    aliases: "text",
    networkName: "text",
    campusName: "text",
    denomination: "text",
    city: "text",
  },
  {
    name: "church_directory_text",
    default_language: "none",
    weights: {
      name: 10,
      aliases: 10,
      networkName: 8,
      campusName: 7,
      denomination: 5,
      city: 3,
    },
  }
);
ChurchSchema.index(
  { source: 1, sourceId: 1 },
  {
    unique: true,
    partialFilterExpression: { sourceId: { $type: "string" } },
  }
);

ChurchSchema.pre("validate", function prepareSearchFields() {
  Object.assign(this, buildChurchSearchFields(this));
});

export default mongoose.models.Church || mongoose.model("Church", ChurchSchema);
