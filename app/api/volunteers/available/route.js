// app/api/volunteers/available/route.js
import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Volunteer from "@/models/Volunteer";
import { requireAuth } from "@/lib/auth";

export async function GET() {
  try {
    await dbConnect();
    const user = await requireAuth();
    if (!user || !["admin", "supervisor"].includes(user.role)) {
      return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
    }

    const availableVolunteers = await Volunteer.find({
      isAvailable: true,
      isValidated: true,
      role: "volunteer",
      status: { $ne: "rejected" },
    }).select("firstName lastName email phone role isAvailable");

    return NextResponse.json(availableVolunteers, { status: 200 });
  } catch (error) {
    console.error("Erreur API /volunteers/available :", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}
