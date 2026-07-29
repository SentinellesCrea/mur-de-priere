// app/api/prayerRequests/count/route.js

import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import PrayerRequest from "@/models/PrayerRequest";

export async function GET() {
  try {
    await dbConnect();

    const count = await PrayerRequest.countDocuments({
      deletedByAuthorAt: null,
      $or: [{ rejectedAt: { $exists: false } }, { rejectedAt: null }],
    });

    return NextResponse.json({ count });
  } catch (error) {
    console.error("Erreur count prières :", error);
    return NextResponse.json(
      { message: "Erreur serveur" },
      { status: 500 }
    );
  }
}
