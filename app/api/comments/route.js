import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Comment from "@/models/Comment";
import PrayerRequest from "@/models/PrayerRequest";

export async function POST(req) {
  try {
    await dbConnect();
    const { prayerRequestId, authorName, text } = await req.json();

    if (!prayerRequestId || !text?.trim()) {
      return NextResponse.json({ message: "Champs requis manquants." }, { status: 400 });
    }

    const prayer = await PrayerRequest.findById(prayerRequestId);
    if (!prayer || prayer.allowComments === false) {
      return NextResponse.json({ message: "Commentaires désactivés pour cette prière." }, { status: 403 });
    }

    const comment = new Comment({
      prayerRequest: prayerRequestId,
      authorName: authorName?.trim() || "Un intercesseur anonyme",
      text,
      isModerated: false,
    });

    await comment.save();

    return NextResponse.json({ message: "Commentaire en attente de modération." }, { status: 201 });
  } catch (err) {
    console.error("❌ Erreur POST /api/comments :", err);
    return NextResponse.json({ message: "Erreur serveur." }, { status: 500 });
  }
}
