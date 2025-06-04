import { NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/dbConnect";
import Comment from "@/models/Comment";
import PrayerRequest from "@/models/PrayerRequest";

export async function GET(_, { params }) {
  try {
    await dbConnect();

    const { prayerId } = params;

    if (!mongoose.Types.ObjectId.isValid(prayerId)) {
      return NextResponse.json({ message: "ID de prière invalide." }, { status: 400 });
    }

    const prayer = await PrayerRequest.findById(prayerId);
    if (!prayer) {
      return NextResponse.json({ message: "Demande de prière introuvable." }, { status: 404 });
    }

    const comments = await Comment.find({
      prayerRequest: prayerId,
      isModerated: true,
    }).sort({ createdAt: -1 });

    return NextResponse.json(comments);
  } catch (err) {
    console.error("❌ Erreur GET /api/comments/[prayerId] :", err);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}
