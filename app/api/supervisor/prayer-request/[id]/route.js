import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import PrayerRequest from "@/models/PrayerRequest";
import { requireAuth } from "@/lib/auth";

async function authorize(req) {
  await dbConnect();
  return requireAuth("supervisor", req);
}

export async function PATCH(req, { params }) {
  if (!(await authorize(req))) return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
  const { id } = await params;
  const prayer = await PrayerRequest.findByIdAndUpdate(
    id,
    {
      $set: { isModerated: true, needsReview: false },
      $unset: { rejectedAt: "", rejectedBy: "" },
    },
    { new: true }
  );
  if (!prayer) return NextResponse.json({ message: "Demande non trouvée" }, { status: 404 });
  return NextResponse.json({ message: "Demande approuvée" });
}

export async function DELETE(req, { params }) {
  const supervisor = await authorize(req);
  if (!supervisor) return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
  const { id } = await params;
  const prayer = await PrayerRequest.findByIdAndUpdate(
    id,
    {
      isModerated: false,
      needsReview: false,
      rejectedAt: new Date(),
      rejectedBy: supervisor._id,
    },
    { new: true }
  );
  if (!prayer) return NextResponse.json({ message: "Demande non trouvée" }, { status: 404 });
  return NextResponse.json({ message: "Demande rejetée" });
}
