import mongoose from "mongoose";
import dbConnect from "../lib/dbConnect.js";

// Modèle temporaire (déclaré ici)
const ChurchSchema = new mongoose.Schema({
  name: String,
  address: String,
  coordinates: {
    type: {
      type: String,
      enum: ["Point"],
      default: "Point",
    },
    coordinates: {
      type: [Number],
      index: "2dsphere",
    },
  },
  isValidated: Boolean,
}, { collection: "churches" }); // ✅ force le bon nom ici

const Church = mongoose.models.ChurchFix || mongoose.model("ChurchFix", ChurchSchema);

const run = async () => {
  try {
    await dbConnect();
    const db = mongoose.connection.db;

    console.log("🔍 Vérification des documents Church...");

    const churches = await Church.find({});
    let corrected = 0;

    for (const church of churches) {
      const coords = church.coordinates?.coordinates;

      if (!church.coordinates?.type || church.coordinates.type !== "Point" ||
          !Array.isArray(coords) || coords.length !== 2 ||
          typeof coords[0] !== "number" || typeof coords[1] !== "number"
      ) {
        console.log(`🛠️ Correction de ${church.name}...`);

        const newLng = church.coordinates?.lng ?? 0;
        const newLat = church.coordinates?.lat ?? 0;

        church.coordinates = {
          type: "Point",
          coordinates: [newLng, newLat],
        };

        await church.save();
        corrected++;
      }
    }

    console.log(`✅ Corrections appliquées à ${corrected} église(s).`);

    console.log("🧭 Vérification de l'index 2dsphere...");
    await db.collection("churches").createIndex({ coordinates: "2dsphere" });

    console.log("✅ Index 2dsphere confirmé sur 'coordinates'.");
    process.exit(0);
  } catch (error) {
    console.error("❌ Erreur :", error.message);
    process.exit(1);
  }
};

run();
