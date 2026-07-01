import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Admin from "@/models/Admin";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { enforceRateLimit } from "@/lib/apiSecurity";
import { findUserByEmail, upsertUserFromLegacyAdmin } from "@/lib/teamUser";

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

    const normalizedEmail = String(email || "").trim().toLowerCase();
    let authUser = await findUserByEmail(normalizedEmail);
    const legacyAdmin = await Admin.findOne({ email: normalizedEmail }).select("+password");
    let tokenId = authUser?._id;
    let passwordHash = authUser?.password;

    if (authUser && authUser.role !== "admin") {
      return NextResponse.json({ message: "Identifiants incorrects" }, { status: 401 });
    }

    if (!authUser) {
      if (!legacyAdmin) {
        return NextResponse.json({ message: "Identifiants incorrects" }, { status: 401 });
      }

      authUser = await upsertUserFromLegacyAdmin(legacyAdmin);
      tokenId = authUser._id;
      passwordHash = legacyAdmin.password;
    }

    let isMatch = await bcrypt.compare(password, passwordHash);
    if (!isMatch && legacyAdmin) {
      isMatch = await bcrypt.compare(password, legacyAdmin.password);
      if (isMatch) {
        authUser = await upsertUserFromLegacyAdmin(legacyAdmin);
        tokenId = authUser._id;
      }
    }

    if (!isMatch) {
      return NextResponse.json({ message: "Identifiants incorrects" }, { status: 401 });
    }

    if (authUser.status !== "validated" || !authUser.isValidated) {
      return NextResponse.json({ message: "Compte non autorisé" }, { status: 403 });
    }

    const token = jwt.sign(
      { id: tokenId, role: "admin", userModel: "User" },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    const response = NextResponse.json({ message: "Connexion réussie" });

    response.cookies.set({
      name: "adminToken",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24, // 24 heures
    });

    return response;
  } catch (error) {
    console.error("Erreur connexion admin:", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}
