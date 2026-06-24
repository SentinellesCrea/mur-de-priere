import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import dbConnect from "@/lib/dbConnect";
import Admin from "@/models/Admin";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { enforceRateLimit } from "@/lib/apiSecurity";

export async function POST(req) {
  try {
    await dbConnect();
    const limited = enforceRateLimit(req, {
      key: "admin-login",
      limit: 8,
      windowMs: 15 * 60 * 1000,
    });
    if (limited) return limited;

    const { email, password } = await req.json();
    if (typeof password !== "string") {
      return NextResponse.json({ message: "Identifiants incorrects" }, { status: 401 });
    }

    const admin = await Admin.findOne({
      email: String(email || "").trim().toLowerCase(),
    }).select("+password");
    if (!admin) {
      return NextResponse.json({ message: "Identifiants incorrects" }, { status: 401 });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return NextResponse.json({ message: "Identifiants incorrects" }, { status: 401 });
    }

    const token = jwt.sign(
      { id: admin._id, role: "admin" },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    const response = NextResponse.json({ message: "Connexion réussie" });

    // ✅ Utilisation correcte de cookies() avec await
    const cookieStore = await cookies();
    cookieStore.set({
      name: "adminToken",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      path: "/",
      maxAge: 60 * 60 * 24, // 24 heures
    });

    return response;
  } catch (error) {
    console.error("Erreur connexion admin:", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}
