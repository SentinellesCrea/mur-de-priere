import badWords from "../data/badWordsList.js";

// Des termes neutres ou trop ambigus présents dans l'ancienne liste ne doivent
// pas empêcher une personne de déposer une demande de prière légitime.
const ALLOWED_TERMS = new Set([
  "arabe",
  "assimile",
  "assimilee",
  "bete",
  "bibi",
  "bic",
  "cave",
  "coche",
  "conspirationniste",
  "espece de",
  "femme transmasculine",
  "folle",
  "fragile",
  "frise",
]);

function normalizeText(value) {
  return String(value || "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[0@]/g, (character) => (character === "0" ? "o" : "a"))
    .replace(/[1|]/g, "i")
    .replace(/3/g, "e")
    .replace(/4/g, "a")
    .replace(/[5$]/g, "s")
    .replace(/7/g, "t")
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const profanityPatterns = [...new Set(badWords.map(normalizeText))]
  .filter((term) => term.length >= 3 && !ALLOWED_TERMS.has(term))
  .sort((left, right) => right.length - left.length)
  .map((term) => {
    const characters = [...term].map((character) =>
      character === " " ? "\\s+" : escapeRegExp(character)
    );

    // Autorise les séparateurs utilisés pour contourner le filtre
    // (ex. « c.o.n.n.a.r.d »), sans chercher à l'intérieur d'un mot sain.
    return new RegExp(`(^|[^a-z0-9])${characters.join("[^a-z0-9]*")}($|[^a-z0-9])`, "i");
  });

export function containsProfanity(value) {
  const normalized = normalizeText(value);
  return normalized ? profanityPatterns.some((pattern) => pattern.test(normalized)) : false;
}
