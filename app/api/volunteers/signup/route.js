import { NextResponse } from "next/server";
import Volunteer from "@/models/Volunteer";
import dbConnect from "@/lib/dbConnect";
import { sendVolunteerWelcomeEmail } from "@/lib/sendVolunteerWelcomeEmail";
import { enforceRateLimit, isValidEmail } from "@/lib/apiSecurity";
import sanitizeHtml from "sanitize-html";
import { findUserByEmail, upsertUserFromLegacyVolunteer } from "@/lib/teamUser";
import { isStrongPassword, STRONG_PASSWORD_MESSAGE } from "@/lib/passwordSecurity";

const ALLOWED_GENDERS = ["male", "female", "other", "prefer_not_to_say"];

export async function POST(req) {
  try {
    await dbConnect();
    const limited = enforceRateLimit(req, {
      key: "volunteer-signup",
      limit: 5,
      windowMs: 60 * 60 * 1000,
    });
    if (limited) return limited;

    let { firstName, lastName, email, password, phone, gender } = await req.json();
    email = String(email || "").trim().toLowerCase();
    firstName = sanitizeHtml(String(firstName || ""), { allowedTags: [], allowedAttributes: {} }).trim().slice(0, 80);
    lastName = sanitizeHtml(String(lastName || ""), { allowedTags: [], allowedAttributes: {} }).trim().slice(0, 80);
    phone = String(phone || "").trim().slice(0, 30);
    gender = ALLOWED_GENDERS.includes(gender) ? gender : "";

    // 🔍 Vérification des champs requis
    if (!firstName || !lastName || !isValidEmail(email) || !password || !phone || !gender) {
      return NextResponse.json({ message: "Prénom, nom, email, téléphone, genre et mot de passe sont obligatoires" }, { status: 400 });
    }
    if (!isStrongPassword(password)) {
      return NextResponse.json(
        { message: STRONG_PASSWORD_MESSAGE },
        { status: 400 }
      );
    }

    // 📧 Vérifier si un bénévole existe déjà avec cet email
    const existingVolunteer = await Volunteer.findOne({ email });
    const existingUser = await findUserByEmail(email);
    if (existingVolunteer || existingUser) {
      return NextResponse.json({ message: "Cet email est déjà utilisé" }, { status: 400 });
    }

    // ✅ Création du nouveau bénévole
    const newVolunteer = new Volunteer({
      firstName,
      lastName,
      email,
      password, // 🛡️ Le hachage est fait automatiquement via le pre-save middleware
      phone,
      gender,
    });

    await newVolunteer.save();
    await upsertUserFromLegacyVolunteer(newVolunteer);
    
    try {
      await sendVolunteerWelcomeEmail({
        email: newVolunteer.email,
        firstName: newVolunteer.firstName,
      });
    } catch (emailError) {
      console.error("Erreur email de bienvenue :", emailError.message);
    }

    return NextResponse.json({ message: "Compte créé avec succès" }, { status: 201 });

  } catch (error) {
    console.error("❌ Erreur serveur :", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}
