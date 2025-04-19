import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Video from "@/models/Videos";

export async function GET() {
  await dbConnect();

  try {
    const videos = await Video.find().sort({ dateAdded: -1 });
    return NextResponse.json(videos);
  } catch (error) {
    console.error("Erreur API vidéos publiques :", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}
