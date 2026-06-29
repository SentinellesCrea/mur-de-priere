import { NextResponse } from "next/server";
import Volunteer from "@/models/Volunteer";
import dbConnect from "@/lib/dbConnect";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { enforceRateLimit } from "@/lib/apiSecurity";
import { findUserByEmail, upsertUserFromLegacyVolunteer } from "@/lib/teamUser";

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
    const normalizedEmail = String(email || "").trim().toLowerCase();
    let authUser = await findUserByEmail(normalizedEmail);
    let tokenId = authUser?._id;
    let passwordHash = authUser?.password;

    if (authUser && !["volunteer", "supervisor"].includes(authUser.role)) {
      return NextResponse.json({ error: "Email ou mot de passe incorrect" }, { status: 401 });
    }

    if (!authUser) {
      const volunteer = await Volunteer.findOne({
        email: normalizedEmail,
      }).select("+password +passwordResetVersion +deletedAt");

      if (!volunteer) {
        return NextResponse.json({ error: "Email ou mot de passe incorrect" }, { status: 401 });
      }

      authUser = await upsertUserFromLegacyVolunteer(volunteer);
      tokenId = authUser._id;
      passwordHash = volunteer.password;
    }

    const isMatch = await bcrypt.compare(password, passwordHash);
    if (!isMatch) {
      return NextResponse.json({ error: "Email ou mot de passe incorrect" }, { status: 401 });
    }

    if (!authUser.isValidated || authUser.status === "rejected" || authUser.deletedAt) {
      return NextResponse.json({ error: "Votre compte n'est pas encore validé" }, { status: 403 });
    }

    const role = authUser.role || "volunteer";
    if (!["volunteer", "supervisor"].includes(role)) {
      return NextResponse.json({ error: "Rôle non autorisé" }, { status: 403 });
    }

    const token = jwt.sign(
      { id: tokenId, role, userModel: "User" },
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
