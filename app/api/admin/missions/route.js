// 🔒 /api/admin/missions
import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import PrayerRequest from "@/models/PrayerRequest";
import { getToken } from "@/lib/auth";

export async function GET(req) {
  try {
    await dbConnect();

    const admin = await getToken("admin", req);
    if (!admin) {
      console.warn("⛔ Accès refusé à /admin/missions");
      // ✅ On renvoie un tableau vide pour éviter les erreurs côté front
      return NextResponse.json([], { status: 403 });
    }

    const missions = await PrayerRequest.find({
      wantsVolunteer: true,
      assignedTo: null,
    })
      .select("name email phone category subcategory prayerRequest datePublication isUrgent")
      .sort({ datePublication: -1 });

    return NextResponse.json(missions || [], { status: 200 });
  } catch (error) {
    console.error("❌ Erreur GET /admin/missions :", error);
    // ✅ Même en cas d’erreur, on retourne un tableau vide pour éviter le crash côté front
    return NextResponse.json([], { status: 500 });
  }
};
