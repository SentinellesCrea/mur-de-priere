import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import PrayerRequest from "@/models/PrayerRequest";
import { requireAuth } from "@/lib/auth";

export async function GET(req) {
  try {
    await dbConnect();

    const supervisor = await requireAuth("supervisor", req);
    if (!supervisor) {
      return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
    }

    const missions = await PrayerRequest.find({
      assignedTo: supervisor._id,
      assignedByRole: "supervisor",
      isAnswered: false,
      isModerated: true,
      rejectedAt: { $exists: false },
    })
      .select("name email phone prayerRequest category subcategory isUrgent datePublication assignedAt")
      .sort({ assignedAt: -1, datePublication: -1 })
      .lean();

    return NextResponse.json(missions, { status: 200 });
  } catch (error) {
    console.error("❌ Erreur GET /api/supervisor/self-missions :", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}
