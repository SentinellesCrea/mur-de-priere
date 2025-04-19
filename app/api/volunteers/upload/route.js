// /app/api/volunteers/upload/route.js
import { NextResponse } from "next/server";
import formidable from "formidable";
import fs from "fs";
import path from "path";

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(req) {
  const uploadDir = path.join(process.cwd(), "public", "uploads");

  // Crée le dossier s’il n'existe pas
  fs.mkdirSync(uploadDir, { recursive: true });

  const form = formidable({
    uploadDir,
    keepExtensions: true,
    filename: (name, ext, part) => {
      return `${Date.now()}-${part.originalFilename}`;
    },
  });

  return new Promise((resolve, reject) => {
    form.parse(req, async (err, fields, files) => {
      if (err) {
        return reject(NextResponse.json({ error: "Erreur upload" }, { status: 500 }));
      }

      const file = files.file[0];
      const filename = path.basename(file.filepath);

      // Retourne le chemin relatif (à enregistrer en DB)
      resolve(NextResponse.json({ path: `/uploads/${filename}` }));
    });
  });
}
