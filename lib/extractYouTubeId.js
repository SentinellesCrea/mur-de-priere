export function extractYouTubeId(url) {
  try {
    const parsedUrl = new URL(url);
    const hostname = parsedUrl.hostname;

    if (hostname.includes("youtube.com")) {
      return parsedUrl.searchParams.get("v");
    }

    if (hostname.includes("youtu.be")) {
      return parsedUrl.pathname.slice(1);
    }

    const embedMatch = url.match(/embed\/([a-zA-Z0-9_-]{11})/);
    return embedMatch ? embedMatch[1] : null;
  } catch (e) {
    console.error("URL YouTube invalide :", e);
    return null;
  }
}
