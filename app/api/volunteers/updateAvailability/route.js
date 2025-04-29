import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Volunteer from "@/models/Volunteer";
import { getToken } from "@/lib/auth"; // ta fonction sécurisée déjà prête

export async function PUT(request) {
  try {
    await dbConnect();
    const volunteer = await getToken(); // sécurisation via cookie

    if (!volunteer) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { isAvailable } = await request.json();

    // Update en base
    await Volunteer.findByIdAndUpdate(volunteer._id, {
      isAvailable: !!isAvailable,
    });

    return NextResponse.json({ message: "Disponibilité mise à jour !" });
  } catch (error) {
    console.error("Erreur update disponibilité:", error.message);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}
