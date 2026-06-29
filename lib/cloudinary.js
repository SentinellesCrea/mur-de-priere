import crypto from "crypto";

const ROOT_FOLDER = "prayer-wall";
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

function cloudinaryConfig() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error("Configuration Cloudinary manquante");
  }

  return { cloudName, apiKey, apiSecret };
}

export function cloudinaryRoleFolder(role) {
  if (role === "admin") return "admin";
  if (role === "supervisor") return "superviseur";
  return "volontaire";
}

export function buildCloudinaryFolder({ role, userId, context = "misc" }) {
  const safeContext = String(context)
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 50) || "misc";

  return `${ROOT_FOLDER}/${cloudinaryRoleFolder(role)}/${userId}/${safeContext}`;
}

function hasValidImageSignature(buffer, type) {
  if (type === "image/jpeg") {
    return buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  }

  if (type === "image/png") {
    return buffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  }

  if (type === "image/webp") {
    return (
      buffer.subarray(0, 4).toString("ascii") === "RIFF" &&
      buffer.subarray(8, 12).toString("ascii") === "WEBP"
    );
  }

  return false;
}

function signCloudinaryParams(params, apiSecret) {
  const payload = Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== null && value !== "")
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join("&");

  return crypto.createHash("sha1").update(`${payload}${apiSecret}`).digest("hex");
}

export async function uploadImageToCloudinary(file, { role, userId, context }) {
  if (!(file instanceof File) || !ALLOWED_IMAGE_TYPES.has(file.type)) {
    throw new Error("Format d’image non autorisé");
  }

  if (file.size <= 0 || file.size > MAX_IMAGE_SIZE) {
    throw new Error("Image trop volumineuse");
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  if (!hasValidImageSignature(buffer, file.type)) {
    throw new Error("Contenu du fichier invalide");
  }

  const { cloudName, apiKey, apiSecret } = cloudinaryConfig();
  const timestamp = Math.floor(Date.now() / 1000);
  const folder = buildCloudinaryFolder({ role, userId, context });
  const publicId = crypto.randomUUID();

  const paramsToSign = {
    folder,
    public_id: publicId,
    timestamp,
  };

  const formData = new FormData();
  formData.append("file", new Blob([buffer], { type: file.type }), file.name || "image");
  formData.append("api_key", apiKey);
  formData.append("timestamp", String(timestamp));
  formData.append("folder", folder);
  formData.append("public_id", publicId);
  formData.append("signature", signCloudinaryParams(paramsToSign, apiSecret));

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: "POST",
    body: formData,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok || !data.secure_url) {
    throw new Error(data.error?.message || "Erreur upload Cloudinary");
  }

  return {
    url: data.secure_url,
    publicId: data.public_id,
    folder,
  };
}

export function isOwnCloudinaryUrl(url, { role, userId, context }) {
  if (!url) return false;

  try {
    const { cloudName } = cloudinaryConfig();
    const parsed = new URL(url);
    const folder = buildCloudinaryFolder({ role, userId, context });

    return (
      parsed.protocol === "https:" &&
      parsed.hostname === "res.cloudinary.com" &&
      parsed.pathname.startsWith(`/${cloudName}/image/upload/`) &&
      parsed.pathname.includes(`/${folder}/`)
    );
  } catch {
    return false;
  }
}
