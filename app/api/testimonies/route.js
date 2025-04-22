import { NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/dbConnect";
import Testimony from "@/models/Testimony";
import { Filter } from "bad-words";  // Importation de la bibliothèque bad-words
import badWords from "@/data/badWordsList";

const filter = new Filter();  // Initialisation du filtre

const containsBadWords = (text) => {
  const normalizedText = text
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Supprimer les accents
    .replace(/\s+/g, " "); // Normaliser les espaces

  // Vérification avec expression régulière pour un mot entier
  for (let word of badWords) {
    const regex = new RegExp(`\\b${word}\\b`, 'i');  // Utilisation des bornes de mot pour ne pas détecter les sous-mots
    if (regex.test(normalizedText)) {
      return true;
    }
  }
  return false;
};


export async function POST(req) {
  await dbConnect();

  try {
    const { firstName, testimony } = await req.json();

    // Vérification du langage vulgaire
    if (containsBadWords(testimony)) {
      return NextResponse.json(
        { message: "Le témoignage contient un langage inapproprié, merci de le corriger." },
        { status: 400 }
      );
    }

    const newTestimony = new Testimony({
      firstName,
      testimony,
      date: new Date(),
      isNew: true, // ✅ sécurité explicite : tout nouveau témoignage 
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
    // Récupère tous les témoignages, qu'ils soient nouveaux ou non
    const testimonies = await Testimony.find({}).sort({ date: -1 }); // Trie par date décroissante
    console.log("🔹 Témoignages récupérés :", testimonies);
    return NextResponse.json(testimonies, { status: 200 });
  } catch (error) {
    console.error("Erreur API testimonies :", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}

