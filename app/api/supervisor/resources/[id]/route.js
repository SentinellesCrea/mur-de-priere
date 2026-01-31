import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Resource from "@/models/Resource";
import { requireAuth } from "@/lib/auth"; // ou ton auth supervisor

export async function GET(req, { params }) {
  try {
    await dbConnect();
    await requireAuth("supervisor");

    const { id } = params;

    const resource = await Resource.findById(id).lean();

    if (!resource) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(resource);
  } catch (err) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  try {
    await dbConnect();
    await requireAuth("supervisor");

    const { id } = params;
    const body = await req.json();

    const updated = await Resource.findByIdAndUpdate(id, body, {
      new: true,
    });

    return NextResponse.json(updated);
  } catch (err) {
    return NextResponse.json({ error: "Erreur update" }, { status: 500 });
  }
}
