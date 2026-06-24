const BLOCK_TYPES = new Set([
  "hero", "text", "verse", "textImage", "image", "video", "audio", "divider", "callout",
]);
const DATA_KEYS = new Set([
  "title", "subtitle", "image", "ctaLabel", "ctaLink", "text", "variant",
  "verse", "reference", "src", "caption", "position", "imagePosition", "url", "audioUrl",
]);

function safeUrl(value, { video = false } = {}) {
  if (!value) return "";
  if (typeof value !== "string" || value.length > 2048) return "";
  if (value.startsWith("/") && !value.startsWith("//")) return video ? "" : value;

  try {
    const url = new URL(value);
    if (url.protocol !== "https:") return "";
    if (
      video &&
      !["youtube.com", "www.youtube.com", "www.youtube-nocookie.com", "player.vimeo.com"].includes(url.hostname)
    ) {
      return "";
    }
    return url.toString();
  } catch {
    return "";
  }
}

export function sanitizeResourceUrl(value) {
  return safeUrl(value);
}

export function sanitizeResourceBlocks(blocks) {
  if (!Array.isArray(blocks)) return [];

  return blocks.slice(0, 100).flatMap((block, order) => {
    if (!block || !BLOCK_TYPES.has(block.type)) return [];
    const data = {};

    for (const [key, value] of Object.entries(block.data || {})) {
      if (!DATA_KEYS.has(key)) continue;
      if (typeof value !== "string") continue;
      if (["url", "audioUrl", "src", "image"].includes(key)) {
        data[key] = safeUrl(value, { video: block.type === "video" });
      } else if (key === "ctaLink") {
        data[key] = safeUrl(value);
      } else {
        data[key] = value.slice(0, 10000);
      }
    }

    return [{ type: block.type, order, data }];
  });
}
