import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Volunteer from "@/models/Volunteer";
import Admin from "@/models/Admin";
import { getToken } from "@/lib/auth"; 
import bcrypt from "bcryptjs"; // 👈 On importe bcryptjs

export async function POST(req, { params }) {
  try {
    await dbConnect();

    // Vérifier que l'appelant est un admin connecté
    const adminUser = await getToken("admin");
    if (!adminUser) {
      return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
    }

    const { id } = params;

    const volunteer = await Volunteer.findById(id);
    if (!volunteer) {
      return NextResponse.json({ message: "Bénévole introuvable" }, { status: 404 });
    }

    // Mot de passe temporaire à hasher
    const tempPassword = "MotdepasseTemporaire123!";

    // Hash du mot de passe
    const hashedPassword = await bcrypt.hash(tempPassword, 10); // saltRounds = 10

    // Créer un nouvel admin avec le mot de passe hashé
    const newAdmin = new Admin({
      firstName: volunteer.firstName,
      lastName: volunteer.lastName,
      email: volunteer.email,
      phone: volunteer.phone || "",
      password: hashedPassword, // ✅ On enregistre le hash ici
      role: "admin",
      date: new Date(),
    });

    await newAdmin.save();

    // Supprimer le bénévole après transformation
    await Volunteer.findByIdAndDelete(id);

    return NextResponse.json({ message: "Bénévole transformé en admin avec succès." });
  } catch (error) {
    console.error("Erreur lors de la transformation :", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}
