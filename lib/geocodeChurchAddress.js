export async function geocodeChurchAddress(address) {
  const response = await fetch(
    `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1`,
    {
      headers: {
        "User-Agent": "MurDePriere/1.0 (mur-de-priere.com)",
        "Accept-Language": "fr",
      },
    }
  );

  if (!response.ok) {
    throw new Error("Service de géolocalisation indisponible");
  }

  const results = await response.json();
  if (!Array.isArray(results) || results.length === 0) return null;

  const lat = Number(results[0].lat);
  const lng = Number(results[0].lon);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;

  return { lat, lng };
}

export function buildChurchFullAddress({ address, postalCode, city, country }) {
  return [address, [postalCode, city].filter(Boolean).join(" "), country]
    .filter(Boolean)
    .join(", ");
}
