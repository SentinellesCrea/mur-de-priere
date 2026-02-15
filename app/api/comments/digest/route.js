import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import PrayerRequest from "@/models/PrayerRequest";
import { sendEmail } from "@/lib/sendEmail";

function getCurrentCycleStart() {
  const now = new Date();
  const cycleStart = new Date(now);

  cycleStart.setHours(20, 0, 0, 0);

  if (now.getHours() < 20) {
    cycleStart.setDate(cycleStart.getDate() - 1);
  }

  return cycleStart;
}

export async function GET(req) {
  try {
    /* ================= SECURITÉ ================= */

    const { searchParams } = new URL(req.url);
    const secret = searchParams.get("secret");

    if (!secret || secret !== process.env.DIGEST_SECRET) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    await dbConnect();

    const currentCycleStart = getCurrentCycleStart();

    /* ================= REQUÊTE PRINCIPALE ================= */

    const prayers = await PrayerRequest.find({
      commentCycleStart: currentCycleStart,
      dailyCommentCount: { $gt: 1 }, // 1 seul = déjà notifié
      email: { $exists: true, $ne: "" },
      digestSentAt: { $ne: currentCycleStart }, // 🔒 anti double envoi
    })
      .limit(500); // sécurité anti surcharge

    if (!prayers.length) {
      return NextResponse.json(
        { message: "Aucun digest à envoyer." },
        { status: 200 }
      );
    }

    /* ================= ENVOI EMAIL ================= */

    for (const prayer of prayers) {
      try {

        const prayerUrl = `https://mur-de-priere.com/?highlight=${prayer._id}`;

        const subject = "📊 Résumé de vos commentaires aujourd’hui";

        const html = `
          <h2>Résumé de vos commentaires 🙏</h2>

          <p>Aujourd’hui, votre demande de prière a reçu 
          <strong>${prayer.dailyCommentCount}</strong> nouveaux commentaires.</p>

          <p>
            <a href="${prayerUrl}" 
               style="
                 display:inline-block;
                 padding:12px 22px;
                 background:#d8947c;
                 color:white;
                 text-decoration:none;
                 border-radius:8px;
                 font-weight:600;
               ">
              Voir la prière
            </a>
          </p>

          <p style="font-size:12px;color:#666;">
            Continuez à vous fortifier dans la prière.
          </p>
        `;

        await sendEmail({
          to: prayer.email,
          subject,
          html,
        });

        /* ================= RESET SECURISÉ ================= */

        prayer.dailyCommentCount = 0;
        prayer.commentCycleStart = null;
        prayer.digestSentAt = currentCycleStart;

        await prayer.save();

      } catch (emailError) {
        console.error(
          `Erreur envoi digest pour prière ${prayer._id}:`,
          emailError
        );
      }
    }

    return NextResponse.json(
      { message: `Digest envoyé pour ${prayers.length} prières.` },
      { status: 200 }
    );

  } catch (error) {
    console.error("Erreur route digest :", error);
    return NextResponse.json(
      { message: "Erreur serveur." },
      { status: 500 }
    );
  }
}
