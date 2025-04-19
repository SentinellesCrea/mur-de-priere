// ✅ API pour gérer les témoignages approuvés uniquement

import { NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/dbConnect";
import Testimony from "@/models/Testimony";

export async function GET() {
  await dbConnect();

  try {
    const approvedTestimonies = await Testimony.find({ isModerated: true }).sort({ date: -1 });
    console.log("🔹 Témoignages approuvés récupérés :", approvedTestimonies);
    return NextResponse.json(approvedTestimonies, { status: 200 });
  } catch (error) {
    console.error("Erreur API testimonies/approved :", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}
