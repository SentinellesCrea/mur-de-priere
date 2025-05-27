import { randomBytes } from "crypto";

export function generateConversationId() {
  return randomBytes(16).toString("hex"); // génère un id unique 32 caractères
}
