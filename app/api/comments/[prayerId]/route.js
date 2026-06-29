import { NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/dbConnect";
import Comment from "@/models/Comment";
import PrayerRequest from "@/models/PrayerRequest";
import { cookies } from "next/headers";

export async function GET(request, context) {
  try {
    await dbConnect();

    const { prayerId } = await context.params;

    if (!mongoose.Types.ObjectId.isValid(prayerId)) {
      return NextResponse.json({ message: "ID de prière invalide." }, { status: 400 });
    }

    const prayer = await PrayerRequest.findOne({
      _id: prayerId,
      allowComments: { $ne: false },
      $or: [
        { isModerated: true },
        { isModerated: { $exists: false } },
      ],
    });
    if (!prayer) {
      return NextResponse.json({ message: "Commentaires indisponibles." }, { status: 404 });
    }

    const comments = await Comment.find({
      prayerRequest: prayerId,
      isModerated: true,
    })
      .select("authorName text likes parentComment createdAt updatedAt")
      .sort({ createdAt: -1 })
      .lean();

    const authorToken = (await cookies()).get("commentAuthorToken")?.value;
    if (authorToken) {
      const ownedIds = new Set(
        (
          await Comment.find({ prayerRequest: prayerId, authorToken }).distinct("_id")
        ).map(String)
      );

      for (const comment of comments) {
        comment.canEdit = ownedIds.has(String(comment._id));
      }
    }

    return NextResponse.json(comments);
  } catch (err) {
    console.error("❌ Erreur GET /api/comments/[prayerId] :", err);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}
