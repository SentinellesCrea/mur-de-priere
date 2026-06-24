import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Testimony from "@/models/Testimony";

export async function GET() {
  try {
    await dbConnect();

    const count = await Testimony.countDocuments({
      isModerate: true, // 👈 on ne compte que les témoignages validés
      isNewTestimony: false,
    });

    return NextResponse.json({ count }, { status: 200 });
  } catch (error) {
    console.error("Erreur count témoignages :", error);
    return NextResponse.json(
      { message: "Erreur serveur" },
      { status: 500 }
    );
  }
}
