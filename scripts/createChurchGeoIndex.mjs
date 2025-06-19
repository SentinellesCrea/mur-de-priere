// /scripts/createChurchGeoIndex.js
import dbConnect from "../lib/dbConnect.js";
import mongoose from "mongoose";

const run = async () => {
  try {
    await dbConnect();
    const db = mongoose.connection.db;

    console.log("🔍 Création de l'index géospatial pour 'churches.coordinates'...");
    await db.collection("churches").createIndex({ "coordinates": "2dsphere" });

    console.log("✅ Index 2dsphere créé avec succès !");
    process.exit(0);
  } catch (error) {
    console.error("❌ Erreur lors de la création de l'index :", error.message);
    process.exit(1);
  }
};

run();
