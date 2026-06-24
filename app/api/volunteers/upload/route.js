import { NextResponse } from "next/server";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import crypto from "crypto";
import { requireAuth } from "@/lib/auth";
import { enforceRateLimit } from "@/lib/apiSecurity";

const ALLOWED_TYPES = new Map([
  ["image/jpeg", ".jpg"],
  ["image/png", ".png"],
  ["image/webp", ".webp"],
]);
const MAX_FILE_SIZE = 5 * 1024 * 1024;

function hasValidSignature(buffer, type) {
  if (type === "image/jpeg") return buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  if (type === "image/png") return buffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  if (type === "image/webp") {
    return buffer.subarray(0, 4).toString("ascii") === "RIFF" &&
      buffer.subarray(8, 12).toString("ascii") === "WEBP";
  }
  return false;
}

export async function POST(req) {
  const volunteer = await requireAuth("volunteer");
  if (!volunteer) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const limited = enforceRateLimit(req, {
    key: `profile-upload:${volunteer._id}`,
    limit: 5,
    windowMs: 60 * 60 * 1000,
  });
  if (limited) return limited;

  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!(file instanceof File) || !ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json({ error: "Format d’image non autorisé" }, { status: 400 });
    }
    if (file.size <= 0 || file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "Image trop volumineuse" }, { status: 400 });
    }

    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });

    const buffer = Buffer.from(await file.arrayBuffer());
    if (!hasValidSignature(buffer, file.type)) {
      return NextResponse.json({ error: "Contenu du fichier invalide" }, { status: 400 });
    }

    const filename = `${crypto.randomUUID()}${ALLOWED_TYPES.get(file.type)}`;
    await writeFile(path.join(uploadDir, filename), buffer, {
      flag: "wx",
      mode: 0o600,
    });

    return NextResponse.json({ path: `/uploads/${filename}` });
  } catch (error) {
    console.error("Erreur upload :", error);
    return NextResponse.json({ error: "Erreur upload" }, { status: 500 });
  }
}
