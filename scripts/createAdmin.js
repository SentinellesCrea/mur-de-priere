// /scripts/createAdmin.js

import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import Admin from "../models/Admin.js";

dotenv.config(); // Charge les variables d'env

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/PrayerWallDB";

async function createAdmin() {
  try {
    await mongoose.connect(MONGODB_URI, { dbName: "PrayerWallDB" });
    console.log("✅ Connecté à MongoDB");

    const email = "daveron@gmail.com";
    const plainPassword = "motdepasse123";

    //await Admin.deleteMany({ email: "daveron@gmail.com" }); // ⚠️ à enlever ensuite
    //console.log("🧹 Ancien admin supprimé (si existait)");

    const existing = await Admin.findOne({ email });
    if (existing) {
      console.log("⚠️ Un admin avec cet email existe déjà.");
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    const newAdmin = new Admin({
      email,
      password: hashedPassword,
    });

    await newAdmin.save();

    console.log("✅ Admin créé avec succès !");
    console.log("Email :", email);
    console.log("Mot de passe :", plainPassword);
    process.exit(0);
  } catch (err) {
    console.error("❌ Erreur :", err);
    process.exit(1);
  }
}

createAdmin();
