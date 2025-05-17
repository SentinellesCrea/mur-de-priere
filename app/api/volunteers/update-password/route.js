import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import dbConnect from "@/lib/dbConnect";
import Volunteer from "@/models/Volunteer";

export async function POST(req) {
  await dbConnect();

  try {
    const { token, newPassword } = await req.json();

    if (!token || !newPassword) {
      return NextResponse.json({ message: "Token ou mot de passe manquant." }, { status: 400 });
    }

    // Vérifie et décode le token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return NextResponse.json({ message: "Lien invalide ou expiré." }, { status: 401 });
    }

    const { id, role } = decoded;

    // On ne permet que les rôles autorisés
    if (!["volunteer", "supervisor"].includes(role)) {
      return NextResponse.json({ message: "Rôle non autorisé." }, { status: 403 });
    }

    const volunteer = await Volunteer.findById(id);
    if (!volunteer) {
      return NextResponse.json({ message: "Utilisateur introuvable." }, { status: 404 });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    volunteer.password = hashedPassword;
    await volunteer.save();

    return NextResponse.json({ message: "Mot de passe mis à jour avec succès." });
  } catch (error) {
    console.error("❌ Erreur update-password:", error);
    return NextResponse.json({ message: "Erreur interne." }, { status: 500 });
  }
}
