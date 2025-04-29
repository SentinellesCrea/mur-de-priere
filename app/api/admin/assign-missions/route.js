// /app/api/admin/assign-missions/route.js

import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/sendEmail"; // ✅ Import
import dbConnect from "@/lib/dbConnect";
import { getToken } from "@/lib/auth"; // ✅ chemin exact de ta fonction d'auth
import PrayerRequest from "@/models/PrayerRequest";
import Volunteer from "@/models/Volunteer";

export async function PUT(req) {
  try {
    await dbConnect();
    const { volunteerId, prayerRequestIds } = await req.json();

    for (const id of prayerRequestIds) {
      const prayer = await PrayerRequest.findById(id);
      if (prayer) {
        prayer.assignedTo = volunteerId;
        await prayer.save();
      }
    }

    // 🔥 Envoi Email ici
    const volunteer = await Volunteer.findById(volunteerId);
    if (volunteer?.email) {
      await sendEmail({
        to: volunteer.email,
        subject: "Nouvelle mission de prière assignée",
        html: `
          <h2>Bonjour ${volunteer.firstName || "Bénévole"},</h2>
          <p>Une nouvelle mission vous a été assignée sur <strong>Mur de Prière</strong>.</p>
          <p>Connectez-vous à votre espace pour la découvrir et prier 🙏.</p>
          <p style="margin-top:20px;">Merci pour votre engagement précieux 🌟</p>
          <p>L'équipe Mur de Prière</p>
        `
      });
    }

    return NextResponse.json({ message: "Missions assignées et email envoyé ✅" });
  } catch (error) {
    console.error("Erreur assignation ou email :", error.message);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}



export async function GET() {
  try {
    await dbConnect();

    const admin = await getToken("admin");
    if (!admin) {
      return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
    }

    // Rechercher toutes les prières libres
    const availablePrayerRequests = await PrayerRequest.find({
      assignedTo: null,
      reserveTo: null,
      wantsVolunteer: true,
    }).sort({ datePublication: -1 }); // Facultatif ➔ pour trier les plus récentes en premier

    return NextResponse.json(availablePrayerRequests, { status: 200 });
  } catch (error) {
    console.error("Erreur GET /admin/assign-missions :", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}
