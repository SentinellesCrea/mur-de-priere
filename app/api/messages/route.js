import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import sanitizeHtml from "sanitize-html";
import dbConnect from "@/lib/dbConnect";
import Message from "@/models/Message";
import Conversation from "@/models/Conversation";
import { requireAuth } from "@/lib/auth";
import { enforceRateLimit } from "@/lib/apiSecurity";

export async function POST(req) {
  try {
    await dbConnect();
    const limited = enforceRateLimit(req, {
      key: "chat-message",
      limit: 60,
      windowMs: 60 * 60 * 1000,
    });
    if (limited) return limited;

    const { conversationId, message } = await req.json();
    if (!/^[a-f0-9]{32}$/i.test(conversationId || "") || typeof message !== "string") {
      return NextResponse.json({ message: "Données invalides" }, { status: 400 });
    }

    const safeMessage = sanitizeHtml(message.trim(), {
      allowedTags: [],
      allowedAttributes: {},
    }).slice(0, 5000);
    if (!safeMessage) {
      return NextResponse.json({ message: "Message vide" }, { status: 400 });
    }

    const conversation = await Conversation.findOne({ conversationId });
    if (!conversation) {
      return NextResponse.json({ message: "Conversation introuvable" }, { status: 404 });
    }

    const hasVolunteerCookie = Boolean((await cookies()).get("volunteerToken")?.value);
    let sender = "guest";
    if (hasVolunteerCookie) {
      const volunteer = await requireAuth("volunteer");
      if (!volunteer || String(conversation.volunteerId) !== String(volunteer._id)) {
        return NextResponse.json({ message: "Accès refusé" }, { status: 403 });
      }
      sender = "volunteer";
    }

    const newMessage = await Message.create({ conversationId, sender, message: safeMessage });
    return NextResponse.json(newMessage, { status: 201 });
  } catch (error) {
    console.error("Erreur message POST:", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}
