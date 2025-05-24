// app/api/volunteers/assignedMissions/route.js

import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import PrayerRequest from "@/models/PrayerRequest";
import { getToken } from "@/lib/auth";

export async function GET(req) {
  try {
    await dbConnect();

    const volunteer = await getToken("volunteer", req);
    if (!volunteer) {
      return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
    }

    const assignedMissions = await PrayerRequest.find({
      assignedTo: volunteer._id,
      isAssigned: false,
    });

    return NextResponse.json(assignedMissions, { status: 200 });
  } catch (error) {
    console.error("Erreur GET /assignedMissions:", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}
