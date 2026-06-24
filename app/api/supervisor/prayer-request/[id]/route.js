import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import PrayerRequest from "@/models/PrayerRequest";
import { requireAuth } from "@/lib/auth";
import { deletePrayerById } from "@/lib/deletePrayer";

async function authorize() {
  await dbConnect();
  return requireAuth("supervisor");
}

export async function PATCH(req, { params }) {
  if (!(await authorize())) return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
  const { id } = await params;
  const prayer = await PrayerRequest.findByIdAndUpdate(
    id,
    { isModerated: true, needsReview: false },
    { new: true }
  );
  if (!prayer) return NextResponse.json({ message: "Demande non trouvée" }, { status: 404 });
  return NextResponse.json({ message: "Demande approuvée" });
}

export async function DELETE(req, { params }) {
  if (!(await authorize())) return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
  const { id } = await params;
  const prayer = await deletePrayerById(id);
  if (!prayer) return NextResponse.json({ message: "Demande non trouvée" }, { status: 404 });
  return NextResponse.json({ message: "Demande supprimée" });
}
