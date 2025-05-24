import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Testimony from "@/models/Testimony";
import { getToken } from "@/lib/auth";

// 🔹 GET — Récupérer les témoignages à modérer
export async function GET(req) {
  try {
    await dbConnect();

    const supervisor = await getToken("supervisor", req);
    if (!supervisor) {
      return NextResponse.json({ message: "Accès réservé aux superviseurs" }, { status: 403 });
    }

    const testimonies = await Testimony.find({
      isNewTestimony: true,
      isModerate: false,
    }).sort({ date: -1 });

    return NextResponse.json(testimonies, { status: 200 });

  } catch (err) {
    console.error("❌ Erreur GET témoignages à modérer :", err);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}

// 🔹 PUT — Valider/modérer un témoignage
export async function PUT(req) {
  try {
    await dbConnect();

    const supervisor = await getToken("supervisor", req);
    if (!supervisor) {
      return NextResponse.json({ message: "Accès réservé aux superviseurs" }, { status: 403 });
    }

    const { id } = await req.json();
    if (!id) {
      return NextResponse.json({ message: "ID requis" }, { status: 400 });
    }

    const updated = await Testimony.findByIdAndUpdate(id, {
      isNewTestimony: false,
      isModerate: true,
    });

    if (!updated) {
      return NextResponse.json({ message: "Témoignage introuvable" }, { status: 404 });
    }

    return NextResponse.json({ message: "Témoignage validé" }, { status: 200 });

  } catch (err) {
    console.error("❌ Erreur PUT témoignage :", err);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}
