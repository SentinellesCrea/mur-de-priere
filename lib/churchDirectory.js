const KNOWN_NETWORK_ALIASES = {
  "impact centre chretien": ["ICC"],
  "impact christian centre": ["ICC"],
  "assemblee chretienne pour l evangelisation et le reveil": ["ACER"],
  "centre d evangelisation esprit et vie": ["CEEV"],
  "eglise martin luther king": ["MLK"],
  "porte ouverte chretienne": ["POC"],
};

const KNOWN_SEARCH_EXPANSIONS = {
  icc: ["Impact Centre Chrétien", "Impact Christian Centre"],
  acer: ["Assemblée Chrétienne pour l'Évangélisation et le Réveil"],
  ceev: ["Centre d'Évangélisation Esprit et Vie"],
  mlk: ["Église Martin Luther King"],
  poc: ["Porte Ouverte Chrétienne"],
};

export function normalizeChurchSearchValue(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, " ")
    .trim()
    .toLowerCase();
}

export function tokenizeChurchSearch(...values) {
  return [
    ...new Set(
      values
        .flat(Infinity)
        .flatMap((value) => normalizeChurchSearchValue(value).split(" "))
        .filter((token) => token.length >= 2)
    ),
  ].slice(0, 100);
}

export function inferChurchAliases(church = {}) {
  const explicitAliases = Array.isArray(church.aliases) ? church.aliases : [];
  const searchableNames = [
    church.name,
    church.networkName,
    church.denomination,
  ].map(normalizeChurchSearchValue);
  const inferredAliases = Object.entries(KNOWN_NETWORK_ALIASES)
    .filter(([networkName]) =>
      searchableNames.some(
        (value) => value === networkName || value.includes(networkName)
      )
    )
    .flatMap(([, aliases]) => aliases);

  return [
    ...new Set(
      [...explicitAliases, ...inferredAliases]
        .map((alias) => String(alias || "").trim())
        .filter(Boolean)
    ),
  ].slice(0, 30);
}

export function expandChurchSearchTerm(value) {
  const cleanValue = String(value || "").trim();
  if (!cleanValue) return [];
  return [
    cleanValue,
    ...(KNOWN_SEARCH_EXPANSIONS[normalizeChurchSearchValue(cleanValue)] || []),
  ];
}

export function buildChurchSearchFields(church = {}) {
  const aliases = inferChurchAliases(church);

  return {
    aliases,
    normalizedName: normalizeChurchSearchValue(church.name),
    normalizedCity: normalizeChurchSearchValue(church.city),
    normalizedPostalCode: normalizeChurchSearchValue(church.postalCode),
    normalizedCountry: normalizeChurchSearchValue(church.country),
    normalizedAliases: aliases.map(normalizeChurchSearchValue).filter(Boolean),
    searchTokens: tokenizeChurchSearch(
      church.name,
      church.address,
      church.city,
      church.postalCode,
      church.country,
      church.region,
      church.tradition,
      church.denomination,
      church.networkName,
      church.campusName,
      aliases
    ),
    locationTokens: tokenizeChurchSearch(
      church.address,
      church.city,
      church.postalCode,
      church.country,
      church.region
    ),
  };
}

export function parsePositiveInteger(value, fallback, maximum) {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed < 1) return fallback;
  return Math.min(parsed, maximum);
}
