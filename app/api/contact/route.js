import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { enforceRateLimit, isValidEmail } from "@/lib/apiSecurity";

const CONTACT_EMAIL = "contact.murdepriere@gmail.com";

export async function POST(req) {
  try {
    const limited = enforceRateLimit(req, {
      key: "contact-form",
      limit: 5,
      windowMs: 60 * 60 * 1000,
    });
    if (limited) return limited;
    const payload = await req.json();
    const name = typeof payload.name === "string" ? payload.name.trim() : "";
    const email = typeof payload.email === "string" ? payload.email.trim() : "";
    const subject = typeof payload.subject === "string" ? payload.subject.trim() : "";
    const message = typeof payload.message === "string" ? payload.message.trim() : "";

    if (!name || !isValidEmail(email) || !subject || !message) {
      return NextResponse.json({ error: "Tous les champs sont obligatoires" }, { status: 400 });
    }
    if (name.length > 100 || subject.length > 200 || message.length > 5000) {
      return NextResponse.json({ error: "Message trop long" }, { status: 400 });
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    const mailOptions = {
      from: `"Mur de Prière" <${process.env.GMAIL_USER}>`,
      replyTo: email,
      to: CONTACT_EMAIL,
      subject: `Mur de Prière - ${subject}`,
      text: `
      Nouvelle demande de contact :

      Nom : ${name}
      Email : ${email}

      Message :
      ${message}
            `,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({ message: "Message envoyé avec succès" }, { status: 200 });
  } catch (error) {
    console.error("Erreur API contact :", error);
    return NextResponse.json({ error: "Erreur lors de l'envoi du message" }, { status: 500 });
  }
}
