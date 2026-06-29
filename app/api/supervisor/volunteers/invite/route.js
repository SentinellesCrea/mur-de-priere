import { NextResponse } from "next/server";
import crypto from "crypto";
import sanitizeHtml from "sanitize-html";
import dbConnect from "@/lib/dbConnect";
import { requireAuth } from "@/lib/auth";
import { enforceRateLimit, isValidEmail } from "@/lib/apiSecurity";
import { sendEmail } from "@/lib/sendEmail";
import Volunteer from "@/models/Volunteer";
import User from "@/models/User";
import VolunteerInvitation from "@/models/VolunteerInvitation";

function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export async function GET(req) {
  try {
    await dbConnect();

    const supervisor = await requireAuth("supervisor", req);
    if (!supervisor) {
      return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
    }

    await VolunteerInvitation.updateMany(
      { invitedBy: supervisor._id, status: "pending", expiresAt: { $lte: new Date() } },
      { status: "expired" }
    );

    const invitations = await VolunteerInvitation.find({
      invitedBy: supervisor._id,
      status: "pending",
      expiresAt: { $gt: new Date() },
    })
      .select("firstName lastName email phone gender status expiresAt createdAt")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(invitations || [], { status: 200 });
  } catch (error) {
    console.error("❌ Erreur récupération invitations bénévoles :", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await dbConnect();

    const supervisor = await requireAuth("supervisor", req);
    if (!supervisor) {
      return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
    }

    const limited = enforceRateLimit(req, {
      key: `supervisor-volunteer-invite:${supervisor._id}`,
      limit: 20,
      windowMs: 60 * 60 * 1000,
    });
    if (limited) return limited;

    const body = await req.json();
    const firstName = sanitizeHtml(String(body.firstName || ""), { allowedTags: [], allowedAttributes: {} }).trim().slice(0, 80);
    const lastName = sanitizeHtml(String(body.lastName || ""), { allowedTags: [], allowedAttributes: {} }).trim().slice(0, 80);
    const email = String(body.email || "").trim().toLowerCase();
    const phone = String(body.phone || "").trim().slice(0, 30);
    const gender = ["male", "female", "other", "prefer_not_to_say", ""].includes(body.gender) ? body.gender : "";

    if (!firstName || !lastName || !isValidEmail(email)) {
      return NextResponse.json({ message: "Prénom, nom et email valide requis" }, { status: 400 });
    }

    const [existingVolunteer, existingUser] = await Promise.all([
      Volunteer.findOne({ email }).select("_id"),
      User.findOne({ email }).select("_id"),
    ]);

    if (existingVolunteer || existingUser) {
      return NextResponse.json({ message: "Un compte existe déjà avec cet email" }, { status: 400 });
    }

    await VolunteerInvitation.updateMany(
      { email, status: "pending" },
      { status: "expired" }
    );

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7);

    await VolunteerInvitation.create({
      firstName,
      lastName,
      email,
      phone,
      gender,
      tokenHash: hashToken(token),
      invitedBy: supervisor._id,
      expiresAt,
    });

    const origin = req.headers.get("origin") || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const link = `${origin}/volunteers/complete-profile?token=${token}`;

    await sendEmail({
      to: email,
      subject: "Invitation à rejoindre l’équipe Mur de Prière",
      html: `
        <h2>Bonjour ${firstName},</h2>
        <p>Tu as été invité(e) à rejoindre l’équipe des bénévoles du <strong>Mur de Prière</strong>.</p>
        <p>Pour finaliser ton profil et créer ton mot de passe, clique sur le lien ci-dessous :</p>
        <p><a href="${link}" style="display:inline-block;background:#5c40e7;color:white;padding:12px 18px;border-radius:12px;text-decoration:none;font-weight:bold;">Compléter mon profil</a></p>
        <p>Ce lien est valable 7 jours.</p>
      `,
    });

    return NextResponse.json({ message: "Invitation envoyée" }, { status: 201 });
  } catch (error) {
    console.error("❌ Erreur invitation bénévole :", error);
    return NextResponse.json({ message: error.message || "Erreur serveur" }, { status: 500 });
  }
}
