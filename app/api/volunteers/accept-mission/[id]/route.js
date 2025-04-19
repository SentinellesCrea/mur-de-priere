import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import PrayerRequest from "@/models/PrayerRequest";
import { getToken } from "@/lib/auth";

export async function PUT(req, context) {
  await dbConnect();

  const { id } = context.params;
  const { accepted } = await req.json();

  const volunteer = await getToken("volunteer", req);

  if (!volunteer) {
    return NextResponse.json({ message: "Non autorisé" }, { status: 403 });
  }
  console.log("🧪 volunteer.id :", volunteer.id);
console.log("🧪 params.id :", id);

  // Cherche uniquement si la prière a bien été assignée à ce bénévole
  const prayer = await PrayerRequest.findOne({
    _id: id,
    assignedTo: volunteer.id,
  });

  if (!prayer) {
    return NextResponse.json({ message: "Prière non trouvée ou non assignée à ce bénévole" }, { status: 404 });
  }

  if (accepted) {
    prayer.isAssigned = true;
  } else {
    prayer.assignedTo = null;
    prayer.isAssigned = false;
  }

  await prayer.save();

  return NextResponse.json({ message: "Mise à jour réussie" });
}
