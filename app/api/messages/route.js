import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Message from "@/models/Message";

export async function POST(req) {
  try {
    await dbConnect();
    const body = await req.json();
    const { conversationId, sender, message } = body;

    if (!conversationId || !sender || !message) {
      return NextResponse.json({ message: "Champs manquants" }, { status: 400 });
    }

    const newMessage = await Message.create({ conversationId, sender, message });
    return NextResponse.json(newMessage, { status: 201 });
  } catch (error) {
    console.error("Erreur message POST:", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}
