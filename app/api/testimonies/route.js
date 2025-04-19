// ✅ API pour gérer les témoignages (ajout et récupération)

import { NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/dbConnect";
import Testimony from "@/models/Testimony";

export async function POST(req) {
  await dbConnect();

  try {
    const { firstName, testimony } = await req.json();

    const newTestimony = new Testimony({
      firstName,
      testimony,
      date: new Date(),
      isModerated: false, // ✅ sécurité explicite : tout nouveau témoignage est non modéré
    });

    await newTestimony.save();

    console.log("✅ Nouveau témoignage soumis :", newTestimony);

    return NextResponse.json(newTestimony, { status: 201 });
  } catch (error) {
    console.error("Erreur API testimonies :", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}

export async function GET() {
  await dbConnect();

  try {
    const testimonies = await Testimony.find({ isModerated: true }).sort({ date: -1 });
    console.log("🔹 Témoignages modérés récupérés :", testimonies);
    return NextResponse.json(testimonies, { status: 200 });
  } catch (error) {
    console.error("Erreur API testimonies :", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}
