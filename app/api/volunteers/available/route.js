// app/api/volunteers/available/route.js
import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Volunteer from "@/models/Volunteer";

export async function GET() {
  try {
    await dbConnect();

    const availableVolunteers = await Volunteer.find({
      isAvailable: true,
      isValidated: true,
      status: "validated",
    }).select("-password"); // Jamais envoyer les mots de passe !

    return NextResponse.json(availableVolunteers, { status: 200 });
  } catch (error) {
    console.error("Erreur API /volunteers/available :", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}
