import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Volunteer from "@/models/Volunteer";
import { getToken } from "@/lib/auth";

export async function GET(req) {
  try {
    await dbConnect();

    // ✅ Sécurisation : accès uniquement superviseur
    const supervisor = await getToken("supervisor", req);
    if (!supervisor) {
      return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
    }

    // ✅ Bénévoles validés uniquement (hors superviseurs)
    const volunteers = await Volunteer.find({
      isValidated: true,
      role: { $ne: "supervisor" }
    }).select("-password");

    return NextResponse.json(volunteers, { status: 200 });

  } catch (error) {
    console.error("❌ Erreur GET /supervisor/volunteers :", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}
