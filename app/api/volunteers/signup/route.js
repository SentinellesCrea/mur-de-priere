import { NextResponse } from "next/server";
import Volunteer from "@/models/Volunteer";
import dbConnect from "@/lib/dbConnect";
import { sendVolunteerWelcomeEmail } from "@/lib/sendVolunteerWelcomeEmail";
import { enforceRateLimit, isValidEmail } from "@/lib/apiSecurity";
import sanitizeHtml from "sanitize-html";

export async function POST(req) {
  try {
    await dbConnect();
    const limited = enforceRateLimit(req, {
      key: "volunteer-signup",
      limit: 5,
      windowMs: 60 * 60 * 1000,
    });
    if (limited) return limited;

    let { firstName, lastName, email, password, phone } = await req.json();
    email = String(email || "").trim().toLowerCase();
    firstName = sanitizeHtml(String(firstName || ""), { allowedTags: [], allowedAttributes: {} }).trim().slice(0, 80);
    lastName = sanitizeHtml(String(lastName || ""), { allowedTags: [], allowedAttributes: {} }).trim().slice(0, 80);
    phone = String(phone || "").trim().slice(0, 30);

    // 🔍 Vérification des champs requis
    if (!firstName || !lastName || !isValidEmail(email) || !password || !phone) {
      return NextResponse.json({ error: "Tous les champs sont obligatoires" }, { status: 400 });
    }
    if (password.length < 12 || password.length > 128) {
      return NextResponse.json({ error: "Le mot de passe doit contenir au moins 12 caractères" }, { status: 400 });
    }

    // 📧 Vérifier si un bénévole existe déjà avec cet email
    const existingVolunteer = await Volunteer.findOne({ email });
    if (existingVolunteer) {
      return NextResponse.json({ error: "Cet email est déjà utilisé" }, { status: 400 });
    }

    // ✅ Création du nouveau bénévole
    const newVolunteer = new Volunteer({
      firstName,
      lastName,
      email,
      password, // 🛡️ Le hachage est fait automatiquement via le pre-save middleware
      phone
    });

    await newVolunteer.save();
    
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
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
