import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Comment from "@/models/Comment";
import { cookies } from "next/headers";

export async function DELETE(req, { params }) {
  try {
    await dbConnect();

    const { id } = params;

    const comment = await Comment.findById(id);

    if (!comment) {
      return NextResponse.json(
        { message: "Commentaire introuvable." },
        { status: 404 }
      );
    }

    /* ================= VERIFICATION AUTHOR TOKEN ================= */

    const cookieStore = cookies();
    const authorToken = cookieStore.get("commentAuthorToken")?.value;

    if (!authorToken || comment.authorToken !== authorToken) {
      return NextResponse.json(
        { message: "Vous ne pouvez supprimer que votre propre commentaire." },
        { status: 403 }
      );
    }

    /* ================= LIMITE 48H ================= */

    const now = new Date();
    const createdAt = new Date(comment.createdAt);

    const limit = 48 * 60 * 60 * 1000;

    if (now - createdAt > limit) {
      return NextResponse.json(
        { message: "La suppression n'est plus possible après 48h." },
        { status: 403 }
      );
    }

    await Comment.findByIdAndDelete(id);

    return NextResponse.json({
      message: "Commentaire supprimé",
      id,
    });

  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "Erreur serveur." },
      { status: 500 }
    );
  }
}