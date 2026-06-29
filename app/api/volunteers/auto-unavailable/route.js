import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Volunteer from "@/models/Volunteer";
import User from "@/models/User";
import VolunteerProfile from "@/models/VolunteerProfile";
import { requireAuth } from "@/lib/auth";

export async function POST(req) {
  try {
    await dbConnect();

    const volunteer = await requireAuth("volunteer", req);
    if (!volunteer) {
      return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
    }

    await Promise.all([
      Volunteer.findByIdAndUpdate(volunteer._id, { isAvailable: false }),
      volunteer.userId ? User.findByIdAndUpdate(volunteer.userId, { isAvailable: false }) : Promise.resolve(),
      volunteer.userId
        ? VolunteerProfile.findOneAndUpdate(
            { userId: volunteer.userId },
            { isAvailable: false },
            { upsert: true, new: true }
          )
        : Promise.resolve(),
    ]);

    return NextResponse.json({ message: "Statut mis à jour (auto-off)" });
  } catch (error) {
    console.error("Erreur auto-unavailable:", error.message);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}
