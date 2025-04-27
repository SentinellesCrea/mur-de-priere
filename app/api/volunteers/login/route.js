import { NextResponse } from "next/server";
import Volunteer from "@/models/Volunteer";
import dbConnect from "@/lib/dbConnect";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers"; // 🔥 important !

export async function POST(req) {
  try {
    await dbConnect();

    const { email, password } = await req.json();
    const volunteer = await Volunteer.findOne({ email });

    if (!volunteer) {
      return NextResponse.json({ error: "Email ou mot de passe incorrect" }, { status: 401 });
    }

    const isMatch = await bcrypt.compare(password.trim(), volunteer.password);
    if (!isMatch) {
      return NextResponse.json({ error: "Email ou mot de passe incorrect" }, { status: 401 });
    }

    if (!volunteer.isValidated) {
      return NextResponse.json({ error: "Votre compte n'est pas encore validé" }, { status: 403 });
    }

    const token = jwt.sign(
      { id: volunteer._id, role: "volunteer" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // ✅ Créer et enregistrer le cookie ici
    cookies().set({
      name: "volunteerToken",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 jours
    });

    // ✅ Puis retourner la réponse normale
    return NextResponse.json({ message: "Connexion réussie" });

  } catch (error) {
    console.error("Erreur POST /volunteers/login :", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
