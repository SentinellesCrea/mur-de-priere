import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import dbConnect from "@/lib/dbConnect";
import Volunteer from "@/models/Volunteer";
import User from "@/models/User";
import { enforceRateLimit } from "@/lib/apiSecurity";
import { isStrongPassword, STRONG_PASSWORD_MESSAGE } from "@/lib/passwordSecurity";

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

    if (!token || !isStrongPassword(newPassword)) {
      return NextResponse.json(
        { message: !token ? "Token manquant." : STRONG_PASSWORD_MESSAGE },
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

    const { id, role, purpose, version, userModel } = decoded;

    if (purpose !== "password-reset" || !["volunteer", "supervisor"].includes(role)) {
      return NextResponse.json(
        { message: "Rôle non autorisé." },
        { status: 403 }
      );
    }

    const account =
      userModel === "User"
        ? await User.findById(id).select("+passwordResetVersion +deletedAt")
        : await Volunteer.findById(id).select("+passwordResetVersion");

    if (!account) {
      return NextResponse.json(
        { message: "Utilisateur introuvable." },
        { status: 404 }
      );
    }

    if (account.deletedAt || account.status === "rejected") {
      return NextResponse.json({ message: "Compte non autorisé." }, { status: 403 });
    }

    if ((account.passwordResetVersion || 0) !== version) {
      return NextResponse.json({ message: "Lien déjà utilisé ou invalide." }, { status: 401 });
    }

    account.password = newPassword;
    account.passwordResetVersion = (account.passwordResetVersion || 0) + 1;
    await account.save();

    if (userModel === "User" && account.legacyId) {
      const legacyVolunteer = await Volunteer.findById(account.legacyId).select("+passwordResetVersion");
      if (legacyVolunteer) {
        legacyVolunteer.password = newPassword;
        legacyVolunteer.passwordResetVersion = (legacyVolunteer.passwordResetVersion || 0) + 1;
        await legacyVolunteer.save();
      }
    }

    if (userModel !== "User") {
      const linkedUser = await User.findOne({ legacyModel: "Volunteer", legacyId: account._id }).select("+passwordResetVersion");
      if (linkedUser) {
        linkedUser.password = newPassword;
        linkedUser.passwordResetVersion = (linkedUser.passwordResetVersion || 0) + 1;
        await linkedUser.save();
      }
    }

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
