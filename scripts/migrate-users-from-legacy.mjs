import "dotenv/config";
import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/PrayerWallDB";

const UserSchema = new mongoose.Schema(
  {
    firstName: String,
    lastName: String,
    email: { type: String, unique: true, lowercase: true, trim: true },
    password: { type: String, select: false },
    phone: String,
    profileImage: String,
    role: { type: String, enum: ["admin", "volunteer", "supervisor"], index: true },
    status: { type: String, enum: ["pending", "validated", "rejected", "disabled"], index: true },
    isValidated: Boolean,
    passwordResetVersion: Number,
    deletedAt: Date,
    legacyModel: { type: String, enum: ["Admin", "Volunteer", null], default: null, index: true },
    legacyId: { type: mongoose.Schema.Types.ObjectId, default: null, index: true },
  },
  { timestamps: true }
);

const AdminProfileSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", unique: true, index: true },
    isOwner: { type: Boolean, default: false },
    legacyAdminId: { type: mongoose.Schema.Types.ObjectId, ref: "Admin", index: true },
  },
  { timestamps: true }
);

const VolunteerProfileSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", unique: true, index: true },
    isAvailable: { type: Boolean, default: false, index: true },
    completedMissions: { type: Number, default: 0 },
    legacyVolunteerId: { type: mongoose.Schema.Types.ObjectId, ref: "Volunteer", index: true },
  },
  { timestamps: true }
);

const SupervisorProfileSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", unique: true, index: true },
    canModeratePrayers: { type: Boolean, default: true },
    canModerateTestimonies: { type: Boolean, default: true },
    canManageResources: { type: Boolean, default: true },
    canManageVolunteers: { type: Boolean, default: true },
    legacyVolunteerId: { type: mongoose.Schema.Types.ObjectId, ref: "Volunteer", index: true },
  },
  { timestamps: true }
);

const LegacyAdminSchema = new mongoose.Schema({}, { strict: false, collection: "admins" });
const LegacyVolunteerSchema = new mongoose.Schema({}, { strict: false, collection: "volunteers" });

const User = mongoose.models.User || mongoose.model("User", UserSchema);
const AdminProfile = mongoose.models.AdminProfile || mongoose.model("AdminProfile", AdminProfileSchema);
const VolunteerProfile =
  mongoose.models.VolunteerProfile || mongoose.model("VolunteerProfile", VolunteerProfileSchema);
const SupervisorProfile =
  mongoose.models.SupervisorProfile || mongoose.model("SupervisorProfile", SupervisorProfileSchema);
const LegacyAdmin = mongoose.models.LegacyAdmin || mongoose.model("LegacyAdmin", LegacyAdminSchema);
const LegacyVolunteer =
  mongoose.models.LegacyVolunteer || mongoose.model("LegacyVolunteer", LegacyVolunteerSchema);

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function legacyStatus(account) {
  if (account.deletedAt) return "disabled";
  if (account.status === "rejected") return "rejected";
  if (account.isValidated || account.status === "validated" || account.role === "admin") return "validated";
  return "pending";
}

async function migrateAdmin(admin) {
  if (!admin.email || !admin.password) return "skipped";

  const user = await User.findOneAndUpdate(
    { email: normalizeEmail(admin.email) },
    {
      $set: {
        firstName: admin.firstName || "Admin",
        lastName: admin.lastName || "",
        email: normalizeEmail(admin.email),
        password: admin.password,
        phone: admin.phone || "",
        profileImage: admin.profileImage || "",
        role: "admin",
        status: "validated",
        isValidated: true,
        legacyModel: "Admin",
        legacyId: admin._id,
      },
    },
    { upsert: true, new: true }
  );

  await AdminProfile.findOneAndUpdate(
    { userId: user._id },
    { $setOnInsert: { userId: user._id, legacyAdminId: admin._id } },
    { upsert: true }
  );

  return "migrated";
}

async function migrateVolunteer(volunteer) {
  if (!volunteer.email || !volunteer.password) return "skipped";

  const role = volunteer.role === "supervisor" ? "supervisor" : "volunteer";
  const user = await User.findOneAndUpdate(
    { email: normalizeEmail(volunteer.email) },
    {
      $set: {
        firstName: volunteer.firstName || "Membre",
        lastName: volunteer.lastName || "",
        email: normalizeEmail(volunteer.email),
        password: volunteer.password,
        phone: volunteer.phone || "",
        profileImage: volunteer.profileImage || "",
        role,
        status: legacyStatus(volunteer),
        isValidated: Boolean(volunteer.isValidated),
        passwordResetVersion: volunteer.passwordResetVersion || 0,
        deletedAt: volunteer.deletedAt || null,
        legacyModel: "Volunteer",
        legacyId: volunteer._id,
      },
    },
    { upsert: true, new: true }
  );

  if (role === "supervisor") {
    await SupervisorProfile.findOneAndUpdate(
      { userId: user._id },
      { $setOnInsert: { userId: user._id, legacyVolunteerId: volunteer._id } },
      { upsert: true }
    );
  } else {
    await VolunteerProfile.findOneAndUpdate(
      { userId: user._id },
      {
        $setOnInsert: {
          userId: user._id,
          legacyVolunteerId: volunteer._id,
          isAvailable: Boolean(volunteer.isAvailable),
        },
      },
      { upsert: true }
    );
  }

  return "migrated";
}

await mongoose.connect(MONGODB_URI, {
  dbName: "PrayerWallDB",
  bufferCommands: false,
});

const admins = await LegacyAdmin.find().select("+password").lean();
const volunteers = await LegacyVolunteer.find().select("+password +passwordResetVersion +deletedAt").lean();

let migratedAdmins = 0;
let migratedMembers = 0;
let skipped = 0;

for (const admin of admins) {
  const result = await migrateAdmin(admin);
  if (result === "migrated") migratedAdmins += 1;
  else skipped += 1;
}

for (const volunteer of volunteers) {
  const result = await migrateVolunteer(volunteer);
  if (result === "migrated") migratedMembers += 1;
  else skipped += 1;
}

console.log(`✅ Migration terminée`);
console.log(`Admins migrés: ${migratedAdmins}`);
console.log(`Membres bénévole/superviseur migrés: ${migratedMembers}`);
console.log(`Ignorés: ${skipped}`);

await mongoose.disconnect();
