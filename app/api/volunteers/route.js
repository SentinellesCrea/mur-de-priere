import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Volunteer from "@/models/Volunteer";
import bcrypt from "bcryptjs";

// ✅ POST : Créer un nouveau bénévole
export async function POST(req) {
  await dbConnect();
  console.log("📩 Requête reçue pour créer un bénévole");

  try {
    const body = await req.json();
    const { firstName, lastName, email, phone, password } = body;

    if (!firstName || !lastName || !email || !phone || !password) {
      console.log("⚠️ Champs manquants");
      return NextResponse.json(
        { message: "Tous les champs sont obligatoires" },
        { status: 400 }
      );
    }

    const existingVolunteer = await Volunteer.findOne({ email });
    if (existingVolunteer) {
      console.log("🚨 Email déjà utilisé");
      return NextResponse.json(
        { message: "Cet email est déjà utilisé" },
        { status: 400 }
      );
    }

    // ✅ Hachage du mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    const newVolunteer = await Volunteer.create({
      firstName,
      lastName,
      email,
      phone,
      password: hashedPassword,
    });

    console.log("✅ Bénévole créé :", newVolunteer._id);

    return NextResponse.json(
      { message: "Bénévole enregistré avec succès", volunteer: newVolunteer },
      { status: 201 }
    );
  } catch (error) {
    console.error("❌ Erreur serveur :", error);
    return NextResponse.json(
      { message: "Erreur serveur", error: error.message },
      { status: 500 }
    );
  }
}

// ✅ GET : Liste de tous les bénévoles (non protégé ici)
export async function GET() {
  try {
    await dbConnect();
    const volunteers = await Volunteer.find().select("-password"); // on masque le mot de passe

    return NextResponse.json(volunteers, { status: 200 });
  } catch (error) {
    console.error("❌ Erreur serveur :", error);
    return NextResponse.json(
      { message: "Erreur serveur" },
      { status: 500 }
    );
  }
}
