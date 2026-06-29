import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Volunteer from "@/models/Volunteer";
import { requireAuth } from "@/lib/auth";
import { enforceRateLimit, isValidEmail } from "@/lib/apiSecurity";
import sanitizeHtml from "sanitize-html";
import { findUserByEmail, upsertUserFromLegacyVolunteer } from "@/lib/teamUser";
import { isStrongPassword, STRONG_PASSWORD_MESSAGE } from "@/lib/passwordSecurity";

const ALLOWED_GENDERS = ["male", "female", "other", "prefer_not_to_say"];

// ✅ POST : Créer un nouveau bénévole
export async function POST(req) {
  await dbConnect();

  try {
    const limited = enforceRateLimit(req, {
      key: "volunteer-create",
      limit: 5,
      windowMs: 60 * 60 * 1000,
    });
    if (limited) return limited;
    const body = await req.json();
    const firstName = sanitizeHtml(String(body.firstName || ""), { allowedTags: [], allowedAttributes: {} }).trim().slice(0, 80);
    const lastName = sanitizeHtml(String(body.lastName || ""), { allowedTags: [], allowedAttributes: {} }).trim().slice(0, 80);
    const phone = String(body.phone || "").trim().slice(0, 30);
    const { password } = body;
    const email = String(body.email || "").trim().toLowerCase();
    const gender = ALLOWED_GENDERS.includes(body.gender) ? body.gender : "";

    if (!firstName || !lastName || !isValidEmail(email) || !phone || !password || !gender) {
      return NextResponse.json(
        { message: "Prénom, nom, email, téléphone, genre et mot de passe sont obligatoires" },
        { status: 400 }
      );
    }

    const existingVolunteer = await Volunteer.findOne({ email });
    const existingUser = await findUserByEmail(email);
    if (existingVolunteer || existingUser) {
      return NextResponse.json(
        { message: "Cet email est déjà utilisé" },
        { status: 400 }
      );
    }

    if (!isStrongPassword(password)) {
      return NextResponse.json({ message: STRONG_PASSWORD_MESSAGE }, { status: 400 });
    }

    const newVolunteer = await Volunteer.create({
      firstName,
      lastName,
      email,
      phone,
      gender,
      password,
    });
    await upsertUserFromLegacyVolunteer(newVolunteer);


    return NextResponse.json(
      { message: "Bénévole enregistré avec succès", volunteer: { _id: newVolunteer._id } },
      { status: 201 }
    );
  } catch (error) {
    console.error("❌ Erreur serveur :", error);
    return NextResponse.json(
      { message: "Erreur serveur", error: error.message },
      { status: 500 }
    );
  }
}

// ✅ GET : Liste sécurisée uniquement pour l'admin
export async function GET() {
  try {
    await dbConnect();

    const user = await requireAuth();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Accès interdit" }, { status: 403 });
    }

    const volunteers = await Volunteer.find().select("-password");

    return NextResponse.json(volunteers, { status: 200 });
  } catch (error) {
    console.error("❌ Erreur serveur :", error);
    return NextResponse.json(
      { message: "Erreur serveur" },
      { status: 500 }
    );
  }
}
