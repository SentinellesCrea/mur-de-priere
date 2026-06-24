import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import PrayerRequest from "@/models/PrayerRequest";
import { requireAuth } from "@/lib/auth";
import { deletePrayerById } from "@/lib/deletePrayer";

export async function PATCH(req, { params }) {
  await dbConnect();
  const admin = await requireAuth("admin");
  if (!admin) return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
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
  try {
    await dbConnect();

    const admin = await requireAuth("admin", req);
    if (!admin) {
      return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
    }

    const { id } = await params;
    if (!id) {
      return NextResponse.json({ message: "ID manquant" }, { status: 400 });
    }

    const deleted = await deletePrayerById(id);
    if (!deleted) {
      return NextResponse.json({ message: "Demande non trouvée" }, { status: 404 });
    }

    return NextResponse.json({ message: "Demande supprimée" }, { status: 200 });
  } catch (error) {
    console.error("Erreur DELETE /admin/prayer-request/[id]:", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}
