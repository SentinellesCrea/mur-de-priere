import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Volunteer from "@/models/Volunteer";
import bcrypt from "bcryptjs"; // Remplace bcrypt par bcryptjs
import jwt from "jsonwebtoken";

export async function POST(req) {
  await dbConnect();
  const { email, password } = await req.json();

  try {
    const volunteer = await Volunteer.findOne({ email });
    if (!volunteer) {
      return NextResponse.json({ message: "Utilisateur non trouvé" }, { status: 404 });
    }

    const isMatch = await bcrypt.compare(password, volunteer.password);
    if (!isMatch) {
      return NextResponse.json({ message: "Mot de passe incorrect" }, { status: 401 });
    }

    const token = jwt.sign({ id: volunteer._id, email: volunteer.email }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    return NextResponse.json({ message: "Connexion réussie", token }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Erreur serveur", error }, { status: 500 });
  }
}
