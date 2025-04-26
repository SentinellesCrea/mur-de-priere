// app/api/volunteers/updateAvailability/route.js

import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Volunteer from "@/models/Volunteer";
import { getToken } from "@/lib/auth";

export async function PUT(req) {
  try {
    await dbConnect();

    const volunteer = await getToken();
    if (!volunteer) {
      return NextResponse.json({ message: "Bénévole non connecté" }, { status: 401 });
    }

    const { isAvailable } = await req.json();
    if (typeof isAvailable !== "boolean") {
      return NextResponse.json({ message: "Valeur de disponibilité invalide" }, { status: 400 });
    }

    const updatedVolunteer = await Volunteer.findByIdAndUpdate(
      volunteer._id,
      { isAvailable },
      { new: true }
    );

    if (!updatedVolunteer) {
      return NextResponse.json({ message: "Erreur lors de la mise à jour" }, { status: 500 });
    }

    return NextResponse.json(updatedVolunteer, { status: 200 });
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la disponibilité :", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}
