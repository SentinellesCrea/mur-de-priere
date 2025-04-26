import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Admin from "@/models/Admin";
import { getToken } from "@/lib/auth";
import bcrypt from "bcryptjs";

export async function POST(req) {
  try {
    await dbConnect();

    // ✅ Vérification de la connexion admin
    const admin = await getToken("admin", req);
    if (!admin) {
      return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
    }

    const body = await req.json();
    const { name, email, password } = body;

    if (!name || !email || !password) {
      return NextResponse.json({ message: "Champs manquants" }, { status: 400 });
    }

    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return NextResponse.json({ message: "Admin déjà existant" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newAdmin = new Admin({
      name,
      email,
      password: hashedPassword,
    });

    await newAdmin.save();

    return NextResponse.json({ message: "Admin créé avec succès" }, { status: 201 });
  } catch (error) {
    console.error("Erreur création admin :", error);
    return NextResponse.json({ message: "Erreur serveur", error: error.message }, { status: 500 });
  }
}
