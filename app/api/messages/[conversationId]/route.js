import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import dbConnect from "@/lib/dbConnect";
import Message from "@/models/Message";
import Conversation from "@/models/Conversation";
import { requireAuth } from "@/lib/auth";

export async function GET(_, { params }) {
  try {
    await dbConnect();
    const { conversationId } = await params;
    if (!/^[a-f0-9]{32}$/i.test(conversationId || "")) {
      return NextResponse.json({ message: "Identifiant invalide" }, { status: 400 });
    }

    const conversation = await Conversation.findOne({ conversationId });
    if (!conversation) {
      return NextResponse.json({ message: "Conversation introuvable" }, { status: 404 });
    }

    const hasVolunteerCookie = Boolean((await cookies()).get("volunteerToken")?.value);
    if (hasVolunteerCookie) {
      const volunteer = await requireAuth("volunteer");
      if (!volunteer || String(conversation.volunteerId) !== String(volunteer._id)) {
        return NextResponse.json({ message: "Accès refusé" }, { status: 403 });
      }
    }

    const messages = await Message.find({ conversationId })
      .select("sender message timestamp createdAt")
      .sort({ timestamp: 1 })
      .lean();
    return NextResponse.json(messages, { status: 200 });
  } catch (error) {
    console.error("Erreur GET messages:", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}
