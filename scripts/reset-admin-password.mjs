import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";

dotenv.config({ path: ".env.local" });

const AdminSchema = new mongoose.Schema({}, { strict: false, collection: "admins" });
const UserSchema = new mongoose.Schema({}, { strict: false, collection: "users" });
const AdminProfileSchema = new mongoose.Schema({}, { strict: false, collection: "adminprofiles" });

const Admin = mongoose.models.Admin || mongoose.model("Admin", AdminSchema);
const User = mongoose.models.User || mongoose.model("User", UserSchema);
const AdminProfile =
  mongoose.models.AdminProfile || mongoose.model("AdminProfile", AdminProfileSchema);

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function assertPassword(password) {
  if (typeof password !== "string" || password.length < 12 || password.length > 128) {
    throw new Error("ADMIN_PASSWORD doit contenir entre 12 et 128 caractères.");
  }
}

const email = normalizeEmail(process.env.ADMIN_EMAIL);
const password = process.env.ADMIN_PASSWORD;
const mongoUri = process.env.MONGODB_URI || "mongodb://localhost:27017/PrayerWallDB";

assertPassword(password);

await mongoose.connect(mongoUri, {
  dbName: "PrayerWallDB",
  bufferCommands: false,
});

const adminQuery = email ? { email } : {};
const admins = await Admin.find(adminQuery).lean();

if (admins.length === 0) {
  await mongoose.disconnect();
  throw new Error("Aucun compte admin trouvé pour cet email.");
}

if (admins.length > 1) {
  await mongoose.disconnect();
  throw new Error("Plusieurs comptes admin trouvés. Ajoute ADMIN_EMAIL pour cibler le bon compte.");
}

const admin = admins[0];
const hashedPassword = await bcrypt.hash(password, 10);
const normalizedAdminEmail = normalizeEmail(admin.email);

await Admin.updateOne(
  { _id: admin._id },
  {
    $set: {
      password: hashedPassword,
      email: normalizedAdminEmail,
    },
  }
);

const user = await User.findOneAndUpdate(
  { email: normalizedAdminEmail },
  {
    $set: {
      firstName: admin.firstName || "Admin",
      lastName: admin.lastName || "",
      email: normalizedAdminEmail,
      password: hashedPassword,
      phone: admin.phone || "",
      profileImage: admin.profileImage || "",
      role: "admin",
      status: "validated",
      isValidated: true,
      legacyModel: "Admin",
      legacyId: admin._id,
      deletedAt: null,
    },
  },
  { upsert: true, new: true }
);

await AdminProfile.findOneAndUpdate(
  { userId: user._id },
  {
    $setOnInsert: {
      userId: user._id,
      legacyAdminId: admin._id,
    },
  },
  { upsert: true, new: true }
);

await mongoose.disconnect();

console.log(`Mot de passe admin réinitialisé pour ${normalizedAdminEmail}.`);
