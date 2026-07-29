import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const FORBIDDEN_CATEGORIES = [
  "sexual",
  "sexual_minors",
  "hate",
  "hate_threatening",
  "violence",
  "violence_graphic",
];

export function hasForbiddenModerationCategory(moderation) {
  return (
    !moderation?.rateLimited &&
    FORBIDDEN_CATEGORIES.some((category) => moderation.categories?.[category] === true)
  );
}

export async function moderateText(text) {
  try {
    const response = await openai.moderations.create({
      model: "omni-moderation-latest",
      input: text,
    });

    return {
      ...response.results[0],
      rateLimited: false,
    };
  } catch (error) {
    // 🔥 RATE LIMIT → on n'empêche PAS la création
    if (error.status === 429) {
      console.warn("⚠️ OpenAI rate limit — modération ignorée temporairement");

      return {
        flagged: false,
        categories: {},
        rateLimited: true,
      };
    }

    console.error("❌ Erreur modération OpenAI :", error);
    throw error;
  }
}
