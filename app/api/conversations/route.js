import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Conversation from "@/models/Conversation";
import { getTokenFromAppRouter } from "@/lib/auth";

export async function POST(req) {
  try {
    await dbConnect();

    const body = await req.json();
    const { conversationId, prayerName, prayerEmail, prayerPhone } = body;

    if (!conversationId) {
      return NextResponse.json({ message: "conversationId manquant" }, { status: 400 });
    }

    const volunteer = await getTokenFromAppRouter("volunteer");
    console.log("🎯 volunteer identifié :", volunteer);

    if (!volunteer?._id) {
      return NextResponse.json({ message: "Non authentifié" }, { status: 401 });
    }

    const existing = await Conversation.findOne({
      volunteerId: volunteer._id,
      $or: [
        { prayerEmail },
        { prayerPhone }
      ]
    });
    if (existing) {
      return NextResponse.json(existing, { status: 200 });
    }

    const newConv = await Conversation.create({
      conversationId,
      volunteerId: volunteer._id,
      prayerName,
      prayerEmail,
      prayerPhone,
    });

    return NextResponse.json(newConv, { status: 201 });
  } catch (error) {
    console.error("❌ Erreur POST conversation :", error.message);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}

export async function GET() {
  try {
    await dbConnect();

    const volunteer = await getTokenFromAppRouter("volunteer");
    console.log("✅ Volunteer connecté :", volunteer);

    if (!volunteer?._id) {
      throw new Error("Bénévole non authentifié");
    }

    const conversations = await Conversation.find({ volunteerId: volunteer._id }).sort({ createdAt: -1 });

    return NextResponse.json(conversations, { status: 200 });
  } catch (error) {
    console.error("❌ Erreur GET /api/conversations :", error.message);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
