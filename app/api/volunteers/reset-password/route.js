import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Volunteer from "@/models/Volunteer";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";

export async function POST(req) {
  await dbConnect();

  const { email } = await req.json();

  if (!email) {
    return NextResponse.json({ message: "Email requis." }, { status: 400 });
  }

  const volunteer = await Volunteer.findOne({ email });

  if (!volunteer) {
    return NextResponse.json({ message: "Aucun compte trouvé avec cet email." }, { status: 404 });
  }

  // Créer un token temporaire valable 15 min
  const token = jwt.sign(
    { id: volunteer._id, role: volunteer.role },
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
    from: `"Mur de Prière" <${process.env.EMAIL_USER}>`,
    to: volunteer.email,
    subject: "Réinitialisation de votre mot de passe",
    html: `
      <p>Bonjour ${volunteer.firstName || "bénévole"},</p>
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
