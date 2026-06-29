import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/sendEmail";
import dbConnect from "@/lib/dbConnect";
import { requireAuth } from "@/lib/auth";
import PrayerRequest from "@/models/PrayerRequest";
import Volunteer from "@/models/Volunteer";

// ✅ PUT : assigner des missions à un bénévole et envoyer un email
export async function PUT(req) {
  try {
    await dbConnect();

    // 🔒 Authentification
    const admin = await requireAuth("admin", req);
    if (!admin) {
      return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
    }

    const { volunteerId, prayerRequestIds } = await req.json();

    for (const id of prayerRequestIds) {
      const prayer = await PrayerRequest.findOne({
        _id: id,
        wantsVolunteer: true,
        assignedTo: null,
        reserveTo: null,
        isAnswered: false,
        isModerated: true,
        rejectedAt: { $exists: false },
      });
      if (prayer) {
        const volunteer = await Volunteer.findById(volunteerId).select("role email firstName isValidated status");
        if (
          !volunteer ||
          !["volunteer", "supervisor"].includes(volunteer.role) ||
          !volunteer.isValidated ||
          volunteer.status === "rejected"
        ) {
          continue;
        }

        prayer.assignedTo = volunteer._id;
        prayer.reserveTo = null;
        prayer.assignedBy = admin._id;
        prayer.assignedByRole = "admin";
        prayer.assignedAt = new Date();
        prayer.isAssigned = volunteer.role === "supervisor";
        await prayer.save();
      }
    }

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

// ✅ GET : récupérer toutes les prières à assigner
export async function GET(req) {
  try {
    await dbConnect();

    const admin = await requireAuth("admin", req);
    if (!admin) {
      return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
    }

    const availablePrayerRequests = await PrayerRequest.find({
      assignedTo: null,
      reserveTo: null,
      wantsVolunteer: true,
      isAnswered: false,
      isModerated: true,
      rejectedAt: { $exists: false },
    }).sort({ datePublication: -1 });

    return NextResponse.json(availablePrayerRequests, { status: 200 });
  } catch (error) {
    console.error("Erreur GET /admin/assign-missions :", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}
