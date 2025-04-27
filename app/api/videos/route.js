import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Video from "@/models/Encouragements";

export async function GET() {
  try {
    await dbConnect();

    const videos = await Video.find().sort({ dateAdded: -1 }); // 📅 Tri par date décroissante
    return NextResponse.json(videos);
  } catch (error) {
    console.error("Erreur récupération vidéos :", error);
    return NextResponse.json({ message: "Erreur serveur lors de la récupération des vidéos." }, { status: 500 });
  }
}
