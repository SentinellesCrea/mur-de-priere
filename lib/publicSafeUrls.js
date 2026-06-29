export const RESOURCE_PLACEHOLDER_IMAGE = "/images/resource-placeholder.jpg";

export function safePublicUrl(value, fallback = "") {
  if (typeof value !== "string" || value.length > 2048) return fallback;
  if (value.startsWith("/") && !value.startsWith("//")) return value;

  try {
    const url = new URL(value);
    return url.protocol === "https:" ? url.toString() : fallback;
  } catch {
    return fallback;
  }
}

export function safePublicImageUrl(value) {
  return safePublicUrl(value, RESOURCE_PLACEHOLDER_IMAGE);
}

export function safePublicVideoUrl(value) {
  if (typeof value !== "string" || value.length > 2048) return "";

  try {
    const url = new URL(value);
    if (url.protocol !== "https:") return "";
    if (
      ![
        "youtube.com",
        "www.youtube.com",
        "www.youtube-nocookie.com",
        "player.vimeo.com",
      ].includes(url.hostname)
    ) {
      return "";
    }

    return url.toString();
  } catch {
    return "";
  }
}

export function safeResourceSlug(slug) {
  return typeof slug === "string" && /^[a-z0-9][a-z0-9-]{0,120}$/i.test(slug)
    ? slug
    : "";
}
