import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Comment from "@/models/Comment";
import PrayerRequest from "@/models/PrayerRequest";

export async function GET() {
  try {
    await dbConnect();

    const publicPrayerIds = await PrayerRequest.find({
      allowComments: { $ne: false },
      $or: [
        { isModerated: true },
        { isModerated: { $exists: false } },
      ],
    }).distinct("_id");

    const counts = await Comment.aggregate([
      {
        $match: {
          isModerated: true, // ✅ champ réel
          prayerRequest: { $in: publicPrayerIds },
        },
      },
      {
        $group: {
          _id: "$prayerRequest", // ✅ champ réel
          count: { $sum: 1 },
        },
      },
    ]);

    const result = {};
    counts.forEach((item) => {
      result[String(item._id)] = item.count;
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("❌ Erreur count commentaires :", error);
    return NextResponse.json(
      { error: "Erreur récupération compteur commentaires" },
      { status: 500 }
    );
  }
}
