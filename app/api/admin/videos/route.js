// 🔒 /api/admin/videos/route.js
import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Video from "@/models/Encouragements";
import { getToken } from "@/lib/auth";

// GET - Récupérer toutes les vidéos
export async function GET(req) {
  try {
    await dbConnect();

    const admin = await getToken("admin", req); // ✅ Forçage du rôle
    if (!admin) {
      console.warn("⛔ Admin non trouvé ou non authentifié");
      return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
    }

    const videos = await Video.find().sort({ dateAdded: -1 });
    return NextResponse.json(videos);
  } catch (error) {
    console.error("Erreur GET vidéos:", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
};

// POST - Ajouter une nouvelle vidéo
export const POST = async (req) => {
  try {
    await dbConnect();

    const admin = await getToken("admin"); // ✅ Forçage du rôle
    if (!admin) {
      console.warn("⛔ Tentative de POST sans authentification admin");
      return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
    }

    const { title, url, message } = await req.json();

    if (!title || !url || !message) {
      return NextResponse.json({ message: "Champs manquants" }, { status: 400 });
    }

    const newVideo = await Video.create({ title, url, message });
    return NextResponse.json({ message: "Vidéo ajoutée", video: newVideo }, { status: 201 });
  } catch (error) {
    console.error("Erreur POST vidéo:", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
};
