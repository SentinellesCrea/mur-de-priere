import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/PrayerWallDB";

if (!MONGODB_URI) {
    throw new Error("❌ ERREUR : La variable MONGODB_URI n'est pas définie !");
}

let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
    if (cached.conn) {
        return cached.conn;
    }

    if (!cached.promise) {
        console.log("🔄 Connexion à MongoDB...");
        cached.promise = mongoose.connect(MONGODB_URI, {
            dbName: "PrayerWallDB", // Mets le nom exact de ta base ici
            bufferCommands: false,
        }).then((mongoose) => {
            console.log("✅ Connecté à MongoDB !");
            return mongoose;
        });
    }

    try {
        cached.conn = await cached.promise;
    } catch (error) {
        cached.promise = null;
        console.error("❌ Erreur de connexion à MongoDB :", error);
        throw error;
    }

    return cached.conn;
}

export default dbConnect;
