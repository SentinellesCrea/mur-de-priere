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

    const volunteers = await Volunteer.find({ isValidated: true, status: { $ne: "rejected" } })
      .select("firstName lastName email phone role isAvailable isValidated status")

    return NextResponse.json(volunteers, { status: 200 });
  } catch (error) {
    console.error("Erreur API /volunteers/all :", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}
