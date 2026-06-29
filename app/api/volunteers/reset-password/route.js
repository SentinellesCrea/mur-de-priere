import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Volunteer from "@/models/Volunteer";
import User from "@/models/User";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import { enforceRateLimit, isValidEmail } from "@/lib/apiSecurity";

export async function POST(req) {
  await dbConnect();
  const limited = enforceRateLimit(req, {
    key: "password-reset",
    limit: 5,
    windowMs: 60 * 60 * 1000,
  });
  if (limited) return limited;

  const body = await req.json();
  const email = String(body.email || "").trim().toLowerCase();

  if (!isValidEmail(email)) {
    return NextResponse.json({ message: "Si ce compte existe, un email sera envoyé." });
  }

  const user = await User.findOne({
    email,
    role: { $in: ["volunteer", "supervisor"] },
    status: { $ne: "rejected" },
    deletedAt: null,
  }).select("+passwordResetVersion +deletedAt");

  const volunteer = user
    ? null
    : await Volunteer.findOne({ email, status: { $ne: "rejected" } }).select("+passwordResetVersion");

  const account = user || volunteer;

  if (!account) {
    return NextResponse.json({ message: "Si ce compte existe, un email sera envoyé." });
  }

  // Créer un token temporaire valable 15 min
  const token = jwt.sign(
    {
      id: account._id,
      role: account.role,
      userModel: user ? "User" : "Volunteer",
      purpose: "password-reset",
      version: account.passwordResetVersion || 0,
    },
    process.env.JWT_SECRET,
    { expiresIn: "15m" }
  );


  // Lien de réinitialisation
  const resetLink = `${process.env.NEXT_PUBLIC_SITE_URL}/volunteers/reset-password?token=${token}`;

  // Configurer l’email
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER, // Gmail d’envoi
      pass: process.env.GMAIL_APP_PASSWORD, // Mot de passe d’application
    },
  });

  const mailOptions = {
    from: `"Mur de Prière" <${process.env.GMAIL_USER}>`,
    to: account.email,
    subject: "Réinitialisation de votre mot de passe",
    html: `
      <p>Bonjour ${account.firstName || "bénévole"},</p>
      <p>Vous avez demandé à réinitialiser votre mot de passe. Cliquez sur le lien ci-dessous :</p>
      <p><a href="${resetLink}" target="_blank" style="color: #a60030;">Réinitialiser mon mot de passe</a></p>
      <p>Ce lien expire dans 15 minutes.</p>
      <p>Si vous n’avez pas fait cette demande, ignorez ce message.</p>
      <br/>
      <p>L’équipe Mur de Prière 🙏</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return NextResponse.json({ message: "Email de réinitialisation envoyé." });
  } catch (error) {
    console.error("Erreur d’envoi de mail :", error);
    return NextResponse.json({ message: "Erreur lors de l’envoi de l’email." }, { status: 500 });
  }
}
