import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req) {
  try {
    const { name, email, subject, message } = await req.json();

    if (!name || !email || !subject || !message) {
      return NextResponse.json({ error: "Tous les champs sont obligatoires" }, { status: 400 });
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    const mailOptions = {
      from: `"Mur de Prière" <${process.env.GMAIL_USER}>`, // ✅ Utiliser ton adresse en "from"
      replyTo: email, // ✅ Pour permettre la réponse directe à l'utilisateur
      to: process.env.GMAIL_USER,
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
