import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Testimony from "@/models/Testimony";
import { Filter } from "bad-words";
import badWords from "@/data/badWordsList";

const filter = new Filter();

const containsBadWords = (text) => {
  const normalizedText = text
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ");

  for (let word of badWords) {
    const regex = new RegExp(`\\b${word}\\b`, 'i');
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

    if (!firstName || !testimony || firstName.trim() === "" || testimony.trim() === "") {
      return NextResponse.json({ message: "Champs requis manquants ou vides" }, { status: 400 });
    }

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
      isNewTestimony: true,
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
    const testimonies = await Testimony.find({}).sort({ date: -1 });
    console.log("🔹 Témoignages récupérés :", testimonies);
    return NextResponse.json(testimonies, { status: 200 });
  } catch (error) {
    console.error("Erreur API testimonies :", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}
