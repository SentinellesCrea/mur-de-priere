import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Conversation from "@/models/Conversation";
import { requireAuth } from "@/lib/auth";
import PrayerRequest from "@/models/PrayerRequest";

export async function POST(req) {
  try {
    await dbConnect();

    const body = await req.json();
    const { conversationId, prayerRequestId } = body;

    if (!/^[a-f0-9]{32}$/i.test(conversationId || "") || !prayerRequestId) {
      return NextResponse.json({ message: "Données de conversation invalides" }, { status: 400 });
    }

    const volunteer = await requireAuth("volunteer");
    if (!volunteer?._id) {
      return NextResponse.json({ message: "Non authentifié" }, { status: 401 });
    }

    const prayer = await PrayerRequest.findOne({
      _id: prayerRequestId,
      $or: [{ assignedTo: volunteer._id }, { reserveTo: volunteer._id }],
    });
    if (!prayer) {
      return NextResponse.json({ message: "Cette prière ne vous est pas attribuée" }, { status: 403 });
    }

    const existing = await Conversation.findOne({
      volunteerId: volunteer._id,
      prayerRequestId: prayer._id,
    });
    if (existing) {
      return NextResponse.json(existing, { status: 200 });
    }

    const newConv = await Conversation.create({
      conversationId,
      volunteerId: volunteer._id,
      prayerRequestId: prayer._id,
      prayerName: prayer.name,
      prayerEmail: prayer.email,
      prayerPhone: prayer.phone,
    });
  const populatedConv = await Conversation.findById(newConv._id).populate("volunteerId", "firstName lastName");
  return NextResponse.json(populatedConv, { status: 201 });
  } catch (error) {
    console.error("❌ Erreur POST conversation :", error.message);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}

export async function GET() {
  try {
    await dbConnect();

    const volunteer = await requireAuth("volunteer");
    if (!volunteer?._id) {
      return NextResponse.json({ message: "Non authentifié" }, { status: 401 });
    }

const conversations = await Conversation.find({ volunteerId: volunteer._id })
  .sort({ createdAt: -1 })
  .populate("volunteerId", "firstName lastName"); // 🟢 important

    return NextResponse.json(conversations, { status: 200 });
  } catch (error) {
    console.error("❌ Erreur GET /api/conversations :", error.message);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
