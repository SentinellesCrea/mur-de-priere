import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Comment from "@/models/Comment";
import sanitizeHtml from "sanitize-html";
import { cookies } from "next/headers";

export async function PUT(req, { params }) {
  try {
    await dbConnect();

    const { id } = await params;
    const { text } = await req.json();

    if (!text || text.trim().length < 3) {
      return NextResponse.json(
        { message: "Le commentaire est trop court." },
        { status: 400 }
      );
    }

    const comment = await Comment.findById(id);

    if (!comment) {
      return NextResponse.json(
        { message: "Commentaire introuvable." },
        { status: 404 }
      );
    }

    /* ================= VERIFICATION AUTHOR TOKEN ================= */

    const cookieStore = await cookies();
    const authorToken = cookieStore.get("commentAuthorToken")?.value;

    if (!authorToken || comment.authorToken !== authorToken) {
      return NextResponse.json(
        { message: "Vous ne pouvez modifier que votre propre commentaire." },
        { status: 403 }
      );
    }

    /* ================= SECURITE 48H ================= */

    const now = new Date();
    const createdAt = new Date(comment.createdAt);

    const limit = 48 * 60 * 60 * 1000;

    if (now - createdAt > limit) {
      return NextResponse.json(
        { message: "La modification n'est plus possible après 48h." },
        { status: 403 }
      );
    }

    /* ================= SANITIZE ================= */

    const safeText = sanitizeHtml(text);

    comment.text = safeText;
    comment.isEdited = true;

    await comment.save();

    return NextResponse.json({
      message: "Commentaire modifié avec succès.",
      text: comment.text,
    });

  } catch (error) {
    console.error("Erreur modification commentaire :", error);

    return NextResponse.json(
      { message: "Erreur serveur." },
      { status: 500 }
    );
  }
}