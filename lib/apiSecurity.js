import { NextResponse } from "next/server";
import { rateLimit } from "@/lib/rateLimit";

export function enforceRateLimit(request, options) {
  const retryAfter = rateLimit(request, options);
  if (!retryAfter) return null;

  return NextResponse.json(
    { message: "Trop de tentatives. Réessayez plus tard." },
    { status: 429, headers: { "Retry-After": String(retryAfter) } }
  );
}

export function isValidEmail(value) {
  return typeof value === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function isSafeHttpUrl(value, allowedOrigin) {
  try {
    const url = new URL(value);
    if (!['http:', 'https:'].includes(url.protocol)) return false;
    return !allowedOrigin || url.origin === allowedOrigin;
  } catch {
    return false;
  }
}
