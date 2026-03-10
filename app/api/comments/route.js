import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Comment from "@/models/Comment";
import PrayerRequest from "@/models/PrayerRequest";
import { sendEmail } from "@/lib/sendEmail";
import { cookies } from "next/headers";
import sanitizeHtml from "sanitize-html";

function getCurrentCycleStart() {
  const now = new Date();
  const cycleStart = new Date(now);

  cycleStart.setHours(20, 0, 0, 0);

  if (now.getHours() < 20) {
    cycleStart.setDate(cycleStart.getDate() - 1);
  }

  return cycleStart;
}

export async function POST(req) {
  try {
    await dbConnect();

    const { prayerRequestId, authorName, text } = await req.json();

    if (!prayerRequestId || !text?.trim()) {
      return NextResponse.json(
        { message: "Champs requis manquants." },
        { status: 400 }
      );
    }

    const safeText = sanitizeHtml(text.trim());

    if (!safeText) {
      return NextResponse.json(
        { message: "Le commentaire est vide ou invalide." },
        { status: 400 }
      );
    }

    if (safeText.length > 300) {
      return NextResponse.json(
        { message: "Le commentaire est trop long." },
        { status: 400 }
      );
    }

    const prayer = await PrayerRequest.findById(prayerRequestId);

    if (!prayer || prayer.allowComments === false) {
      return NextResponse.json(
        { message: "Commentaires désactivés pour cette prière." },
        { status: 403 }
      );
    }

    /* ================= IDENTIFICATION VISITEUR ================= */

    const cookieStore = await cookies();
    const visitorToken = cookieStore.get("prayerAuthorToken")?.value;

    /* ================= ANTI-SPAM ================= */

    if (visitorToken) {
      const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);

      const recentComments = await Comment.countDocuments({
        prayerRequest: prayerRequestId,
        visitorToken,
        createdAt: { $gte: twoHoursAgo },
      });

      if (recentComments >= 3) {
        return NextResponse.json(
          {
            message:
              "Vous avez déjà commenté plusieurs fois cette prière. Réessayez plus tard.",
          },
          { status: 429 }
        );
      }
    }

    /* ================= ENREGISTREMENT COMMENTAIRE ================= */

    const comment = new Comment({
      prayerRequest: prayerRequestId,
      authorName: authorName?.trim() || "Un intercesseur anonyme",
      text: safeText,
      visitorToken: visitorToken || null,
      isModerated: true,
    });

    await comment.save();

    /* ================= IDENTIFICATION AUTEUR ================= */

    const isAuthor =
      visitorToken &&
      prayer.authorToken &&
      visitorToken === prayer.authorToken;

    /* ================= GESTION EMAIL ================= */

    if (!isAuthor && prayer.email && prayer.email.trim() !== "") {
      try {
        const currentCycleStart = getCurrentCycleStart();

        const isNewCycle =
          !prayer.commentCycleStart ||
          prayer.commentCycleStart.getTime() !== currentCycleStart.getTime();

        if (isNewCycle) {
          prayer.commentCycleStart = currentCycleStart;
          prayer.dailyCommentCount = 1;

          const subject = "💬 Nouveau commentaire sur votre demande de prière";

          const html = `
            <h2>Quelqu’un a commenté votre prière 🙏</h2>
            <p><strong>Commentaire :</strong></p>
            <p>${safeText}</p>
            <p>Continuez à vous fortifier dans la prière.</p>
          `;

          await sendEmail({
            to: prayer.email,
            subject,
            html,
          });
        } else {
          prayer.dailyCommentCount = (prayer.dailyCommentCount || 0) + 1;
        }

        await prayer.save();
      } catch (emailError) {
        console.error("❌ Erreur envoi email commentaire :", emailError);
      }
    }

    return NextResponse.json(
      { message: "Commentaire enregistré avec succès." },
      { status: 201 }
    );
  } catch (err) {
    console.error("❌ Erreur POST /api/comments :", err);
    return NextResponse.json(
      { message: "Erreur serveur." },
      { status: 500 }
    );
  }
}