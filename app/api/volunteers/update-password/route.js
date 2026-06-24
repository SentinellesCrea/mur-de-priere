import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import dbConnect from "@/lib/dbConnect";
import Volunteer from "@/models/Volunteer";
import { enforceRateLimit } from "@/lib/apiSecurity";

export async function POST(req) {
  await dbConnect();

  try {
    const limited = enforceRateLimit(req, {
      key: "password-update",
      limit: 8,
      windowMs: 60 * 60 * 1000,
    });
    if (limited) return limited;
    const { token, newPassword } = await req.json();

    if (!token || typeof newPassword !== "string" || newPassword.length < 12 || newPassword.length > 128) {
      return NextResponse.json(
        { message: "Token ou mot de passe manquant." },
        { status: 400 }
      );
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ["HS256"] });
    } catch {
      return NextResponse.json(
        { message: "Lien invalide ou expiré." },
        { status: 401 }
      );
    }

    const { id, role, purpose, version } = decoded;

    if (purpose !== "password-reset" || !["volunteer", "supervisor"].includes(role)) {
      return NextResponse.json(
        { message: "Rôle non autorisé." },
        { status: 403 }
      );
    }

    const volunteer = await Volunteer.findById(id).select("+passwordResetVersion");
    if (!volunteer) {
      return NextResponse.json(
        { message: "Utilisateur introuvable." },
        { status: 404 }
      );
    }

    if ((volunteer.passwordResetVersion || 0) !== version) {
      return NextResponse.json({ message: "Lien déjà utilisé ou invalide." }, { status: 401 });
    }

    volunteer.password = newPassword;
    volunteer.passwordResetVersion = (volunteer.passwordResetVersion || 0) + 1;
    await volunteer.save();

    return NextResponse.json({
      message: "Mot de passe mis à jour avec succès.",
    });

  } catch (error) {
    console.error("❌ Erreur update-password :", error.message);
    return NextResponse.json(
      { message: "Erreur interne." },
      { status: 500 }
    );
  }
}
