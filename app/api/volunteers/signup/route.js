import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import Volunteer from "@/models/Volunteer";
import dbConnect from "@/lib/dbConnect";

export async function POST(req) {
  try {
    await dbConnect();

    const { firstName, lastName, email, password, phone } = await req.json();

    // 🔍 Vérification des champs requis
    if (!firstName || !lastName || !email || !password || !phone) {
      return NextResponse.json({ error: "Tous les champs sont obligatoires" }, { status: 400 });
    }

    // 📧 Vérifier si un bénévole existe déjà avec cet email
    const existingVolunteer = await Volunteer.findOne({ email });
    if (existingVolunteer) {
      return NextResponse.json({ error: "Cet email est déjà utilisé" }, { status: 400 });
    }

    // ✅ Création du nouveau bénévole
    const newVolunteer = new Volunteer({
      firstName,
      lastName,
      email,
      password, // 🛡️ Le hachage est fait automatiquement via le pre-save middleware
      phone
    });

    await newVolunteer.save();

    return NextResponse.json({ message: "Compte créé avec succès" }, { status: 201 });

  } catch (error) {
    console.error("❌ Erreur serveur :", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
