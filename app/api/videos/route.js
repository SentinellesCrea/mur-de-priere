import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Video from "@/models/Encouragements";

export async function GET(req) {
  await dbConnect();

  try {
    // Récupérer la page depuis les paramètres d'URL
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1", 10); // page 1 par défaut
    const limit = 10; // 🔥 10 vidéos par page

    const videos = await Video.find()
      .sort({ dateAdded: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    // ✅ Facultatif : Compter le total pour pagination frontend
    const totalVideos = await Video.countDocuments();

    return NextResponse.json({
      videos,
      currentPage: page,
      totalPages: Math.ceil(totalVideos / limit),
      totalVideos,
    }, { status: 200 });
  } catch (error) {
    console.error("Erreur API vidéos publiques :", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}
