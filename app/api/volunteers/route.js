import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Volunteer from "@/models/Volunteer";
import { requireAuth } from "@/lib/auth";
import bcrypt from "bcryptjs";

// ✅ POST : Créer un nouveau bénévole
export async function POST(req) {
  await dbConnect();

  try {
    const body = await req.json();
    const { firstName, lastName, email, phone, password } = body;

    if (!firstName || !lastName || !email || !phone || !password) {
      return NextResponse.json(
        { message: "Tous les champs sont obligatoires" },
        { status: 400 }
      );
    }

    const existingVolunteer = await Volunteer.findOne({ email });
    if (existingVolunteer) {
      return NextResponse.json(
        { message: "Cet email est déjà utilisé" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newVolunteer = await Volunteer.create({
      firstName,
      lastName,
      email,
      phone,
      password: hashedPassword,
    });


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

// ✅ GET : Liste sécurisée uniquement pour l'admin
export async function GET() {
  try {
    await dbConnect();

    const user = await requireAuth();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Accès interdit" }, { status: 403 });
    }

    const volunteers = await Volunteer.find().select("-password");

    return NextResponse.json(volunteers, { status: 200 });
  } catch (error) {
    console.error("❌ Erreur serveur :", error);
    return NextResponse.json(
      { message: "Erreur serveur" },
      { status: 500 }
    );
  }
}
