export function isStrongPassword(password) {
  return (
    typeof password === "string" &&
    password.length >= 12 &&
    password.length <= 128 &&
    /[A-Z]/.test(password) &&
    /\d/.test(password) &&
    /[^A-Za-z0-9]/.test(password)
  );
}

export const STRONG_PASSWORD_MESSAGE =
  "Le mot de passe doit contenir au moins 12 caractères, une majuscule, un chiffre et un caractère spécial";
