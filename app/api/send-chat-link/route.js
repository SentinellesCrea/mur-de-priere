import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import dbConnect from "@/lib/dbConnect";
import Conversation from "@/models/Conversation";
import { requireAuth } from "@/lib/auth";
import { enforceRateLimit, isSafeHttpUrl } from "@/lib/apiSecurity";
import sanitizeHtml from "sanitize-html";

export async function POST(req) {
  try {
    await dbConnect();
    const volunteer = await requireAuth("volunteer");
    if (!volunteer) {
      return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
    }

    const limited = enforceRateLimit(req, {
      key: `chat-link:${volunteer._id}`,
      limit: 10,
      windowMs: 60 * 60 * 1000,
    });
    if (limited) return limited;

    const { link } = await req.json();

    if (!isSafeHttpUrl(link, req.nextUrl.origin)) {
      return NextResponse.json({ message: "Lien invalide" }, { status: 400 });
    }

    const conversationId = new URL(link).pathname.match(/^\/conversation\/([a-f0-9]{32})$/i)?.[1];
    const conversation = conversationId
      ? await Conversation.findOne({ conversationId, volunteerId: volunteer._id })
      : null;
    if (!conversation?.prayerEmail) {
      return NextResponse.json({ message: "Conversation invalide" }, { status: 404 });
    }

    const email = conversation.prayerEmail;
    const name = sanitizeHtml(conversation.prayerName || "", {
      allowedTags: [],
      allowedAttributes: {},
    });

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
        text: `Bonjour ${name || ""},

      Un bénévole souhaite vous répondre au sujet de votre demande de prière.
      Cliquez sur le lien pour dialoguer : ${link}

      Soyez béni 🙏

      — L'équipe Mur de Prière`,
        html: `
          <div style="font-family: sans-serif; font-size: 14px; color: #333;">
            <p>Bonjour ${name || ""},</p>

            <p>Un bénévole souhaite vous répondre au sujet de votre demande de prière.<br />
            Cliquez sur le lien ci-dessous pour échanger :</p>

            <p style="margin: 1rem 0;">
              <a href="${link}" style="color: #1a73e8; text-decoration: underline;">${link}</a>
            </p>

            <p>Soyez béni 🙏</p>

            <hr style="margin: 2rem 0; border: none; border-top: 1px solid #eee;" />

            <table cellpadding="0" cellspacing="0" border="0" style="width: 100%;">
              <tr>
                <td style="vertical-align: middle;">
                  <strong style="font-size: 16px; color: #222;">— L'équipe Mur de Prière</strong><br />
                  <span style="font-size: 12px; color: #777;">Un lieu pour déposer et porter les prières</span>
                </td>
                <td align="right">
                  <img src="https://www.mur-de-priere.com/logo-mur-de-priere.png" alt="Logo Mur de Prière" width="60" style="border: none;" />
                </td>
              </tr>
            </table>
          </div>
        `,
      });

    return NextResponse.json({ message: "Email envoyé" }, { status: 200 });
  } catch (error) {
    console.error("❌ Erreur envoi email lien messagerie :", error.message);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}
