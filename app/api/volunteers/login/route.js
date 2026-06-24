import { NextResponse } from "next/server";
import Volunteer from "@/models/Volunteer";
import dbConnect from "@/lib/dbConnect";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { enforceRateLimit } from "@/lib/apiSecurity";

export async function POST(req) {
  try {
    await dbConnect();
    const limited = enforceRateLimit(req, {
      key: "volunteer-login",
      limit: 10,
      windowMs: 15 * 60 * 1000,
    });
    if (limited) return limited;

    const { email, password } = await req.json();
    if (typeof password !== "string") {
      return NextResponse.json({ error: "Email ou mot de passe incorrect" }, { status: 401 });
    }
    const volunteer = await Volunteer.findOne({
      email: String(email || "").trim().toLowerCase(),
    }).select("+password");

    if (!volunteer) {
      return NextResponse.json({ error: "Email ou mot de passe incorrect" }, { status: 401 });
    }

    const isMatch = await bcrypt.compare(password, volunteer.password);
    if (!isMatch) {
      return NextResponse.json({ error: "Email ou mot de passe incorrect" }, { status: 401 });
    }

    if (!volunteer.isValidated || volunteer.status === "rejected") {
      return NextResponse.json({ error: "Votre compte n'est pas encore validé" }, { status: 403 });
    }

    const role = volunteer.role || "volunteer";
    if (!["volunteer", "supervisor"].includes(role)) {
      return NextResponse.json({ error: "Rôle non autorisé" }, { status: 403 });
    }

    const token = jwt.sign(
      { id: volunteer._id, role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    // ✅ cookies() est synchronisée dans une API route
    const cookieStore = await cookies();
    cookieStore.set("volunteerToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Lax",
      path: "/",
      maxAge: 60 * 60 * 24,
    });

    return NextResponse.json({ message: "Connexion réussie", role });

  } catch (error) {
    console.error("❌ Erreur POST /volunteers/login :", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
