// ✅ API pour gérer les témoignages 

import { NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/dbConnect";
import Testimony from "@/models/Testimony";

export async function GET() {
  await dbConnect();

  try {
    // Récupère tous les témoignages, qu'ils soient nouveaux ou non
    const testimonies = await Testimony.find({}).sort({ date: -1 }); // Trie par date décroissante
    return NextResponse.json(testimonies, { status: 200 });
  } catch (error) {
    console.error("Erreur API testimonies :", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}
