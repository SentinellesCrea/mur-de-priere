import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import PrayerRequest from "@/models/PrayerRequest";
import { requireAuth } from "@/lib/auth";

export async function GET() {
  await dbConnect();
  const admin = await requireAuth("admin");
  if (!admin) return NextResponse.json({ message: "Non autorisé" }, { status: 401 });

  const prayers = await PrayerRequest.find({ isModerated: false })
    .select("name prayerRequest category subcategory datePublication needsReview")
    .sort({ datePublication: -1 })
    .lean();
  return NextResponse.json(prayers);
}
