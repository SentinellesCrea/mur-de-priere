import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Volunteer from "@/models/Volunteer";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export async function POST(req) {
  await dbConnect();
  
  const { email, password } = await req.json();

  try {
    const volunteer = await Volunteer.findOne({ email });

    if (!volunteer) {
      // 🔒 Ne pas révéler que l'email n'existe pas
      return NextResponse.json({ message: "Identifiants incorrects" }, { status: 401 });
    }

    const isMatch = await bcrypt.compare(password, volunteer.password);
    if (!isMatch) {
      // 🔒 Même message que pour l'email
      return NextResponse.json({ message: "Identifiants incorrects" }, { status: 401 });
    }

    const token = jwt.sign(
      { id: volunteer._id, email: volunteer.email, role: "volunteer" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return NextResponse.json({ message: "Connexion réussie", token }, { status: 200 });
  } catch (error) {
    console.error("Erreur connexion bénévole:", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}
