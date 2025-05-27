import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req) {
  try {
    const { email, name, link } = await req.json();

    if (!email || !link) {
      return NextResponse.json({ message: "Email ou lien manquant" }, { status: 400 });
    }

    const transporter = nodemailer.createTransport({
      host: process.env.GMAIL_HOST,
      port: parseInt(process.env.GMAIL_PORT),
      secure: true,
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: `"Mur de Prière" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: "Lien de discussion - Mur de Prière",
      text: `Bonjour ${name || ""},\n\nUn bénévole souhaite vous répondre à votre demande de prière.\nCliquez ici pour dialoguer : ${link}\n\nSoyez béni.`,
      html: `<p>Bonjour ${name || ""},</p><p>Un bénévole souhaite vous répondre à votre demande de prière.</p><p><a href="${link}">${link}</a></p><p>Soyez béni 🙏</p>`,
    });

    return NextResponse.json({ message: "Email envoyé" }, { status: 200 });
  } catch (error) {
    console.error("❌ Erreur envoi email lien messagerie :", error.message);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}
