import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Message from "@/models/Message";

export async function GET(_, { params }) {
  try {
    await dbConnect();
    const { conversationId } = await params;

    const messages = await Message.find({ conversationId }).sort({ timestamp: 1 });
    return NextResponse.json(messages, { status: 200 });
  } catch (error) {
    console.error("Erreur GET messages:", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}
