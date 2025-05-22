import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Volunteer from "@/models/Volunteer";
import { getToken } from "@/lib/auth"; // sécurisation via cookie

// ✅ Route PUT — mise à jour explicite
export async function PUT(request) {
  try {
    await dbConnect();

    const volunteer = await getToken();
    if (!volunteer) {
      return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
    }

    const contentType = request.headers.get("content-type");
    console.log("📥 Content-Type reçu:", contentType);

    let body = {};
    try {
      body = await request.json();
      console.log("📦 Body reçu:", body);
    } catch (err) {
      console.error("❌ Erreur parsing JSON :", err);
      return NextResponse.json({ message: "Requête JSON invalide" }, { status: 400 });
    }

    const { isAvailable } = body;
    if (typeof isAvailable !== "boolean") {
      return NextResponse.json({ message: "`isAvailable` doit être un booléen" }, { status: 400 });
    }

    await Volunteer.findByIdAndUpdate(volunteer._id, { isAvailable });

    return NextResponse.json({ message: "Disponibilité mise à jour avec succès." });
  } catch (error) {
    console.error("❌ Erreur update disponibilité:", error.message);
    return NextResponse.json({ message: "Erreur serveur interne" }, { status: 500 });
  }
}


// ✅ Route POST — désactivation automatique (ex : inactivité)
export async function POST(request) {
  try {
    await dbConnect();

    const volunteer = await getToken("volunteer");
    if (!volunteer) {
      return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
    }

    await Volunteer.findByIdAndUpdate(volunteer._id, { isAvailable: false });

    return NextResponse.json({ message: "Statut de disponibilité désactivé automatiquement." });
  } catch (error) {
    console.error("❌ Erreur auto-off disponibilité:", error.message);
    return NextResponse.json({ message: "Erreur serveur interne" }, { status: 500 });
  }
}
