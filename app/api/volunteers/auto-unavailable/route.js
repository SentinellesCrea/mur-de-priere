import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Volunteer from "@/models/Volunteer";
import { getToken } from "@/lib/auth"; // ta fonction sécurisée déjà prête


export async function POST(req) {
  try {
    await dbConnect();

    const volunteer = await getToken("volunteer");
    if (!volunteer) {
      return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
    }

    await Volunteer.findByIdAndUpdate(volunteer._id, { isAvailable: false });

    return NextResponse.json({ message: "Statut mis à jour (auto-off)" });
  } catch (error) {
    console.error("Erreur auto-unavailable:", error.message);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}