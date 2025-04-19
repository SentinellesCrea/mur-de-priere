// 🔒 /api/admin/encouragement
import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Encouragement from "@/models/videos";
import { getToken } from "@/lib/auth";

export async function GET(req) {
  try {
    await dbConnect();
    const admin = await getToken("admin", req);
    if (!admin) return NextResponse.json({ message: "Non autorisé" }, { status: 401 });

    const videos = await Encouragement.find().sort({ createdAt: -1 });
    return NextResponse.json(videos);
  } catch (error) {
    console.error("Erreur GET encouragement:", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
};

export const POST = async (req) => {
  try {
    await dbConnect();
    const admin = await getToken("admin");
    if (!admin) return NextResponse.json({ message: "Non autorisé" }, { status: 401 });

    const { title, url, message } = await req.json();
    if (!title || !url) {
      return NextResponse.json({ message: "Champs requis manquants" }, { status: 400 });
    }

    const newVideo = new Encouragement({ title, url, message });
    await newVideo.save();

    return NextResponse.json(newVideo, { status: 201 });
  } catch (error) {
    console.error("Erreur POST encouragement:", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
};