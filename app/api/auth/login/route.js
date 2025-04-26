import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Volunteer from "@/models/Volunteer";
import jwt from "jsonwebtoken";

export async function POST(req) {
  try {
    await dbConnect();

    const { email, password } = await req.json();
    const volunteer = await Volunteer.findOne({ email });

    if (!volunteer || !(await volunteer.comparePassword(password))) {
      return NextResponse.json({ error: "Identifiants invalides" }, { status: 401 });
    }

    // 🔒 Vérifie que le compte est validé
    if (!volunteer.isValidated) {
      return NextResponse.json({ error: "Votre compte n'a pas encore été validé" }, { status: 403 });
    }

    // ✅ Création du token
    const token = jwt.sign(
      { id: volunteer._id, role: "volunteer" },
      process.env.JWT_SECRET,
      { expiresIn: "10m" }
    );

    const response = NextResponse.json({ message: "Connexion réussie" });

    // ✅ Stockage sécurisé dans un cookie
    response.cookies.set("volunteerToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      maxAge: 10 * 60, //10 minutes
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("❌ Erreur connexion bénévole :", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
