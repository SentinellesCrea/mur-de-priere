// app/api/volunteers/getAvailability/route.js

import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Volunteer from "@/models/Volunteer";
import { requireAuth } from "@/lib/auth";

export async function GET(req) {
  try {
    await dbConnect();

    const volunteer = await requireAuth("volunteer", req);
    if (!volunteer) {
      return NextResponse.json({ message: "Bénévole introuvable" }, { status: 404 });
    }

    const volunteerData = await Volunteer.findById(volunteer._id);

    if (!volunteerData) {
      return NextResponse.json({ message: "Bénévole introuvable dans la base de données" }, { status: 404 });
    }

    return NextResponse.json({ isAvailable: volunteerData.isAvailable }, { status: 200 });
  } catch (error) {
    console.error("Erreur lors de la récupération de la disponibilité:", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}
