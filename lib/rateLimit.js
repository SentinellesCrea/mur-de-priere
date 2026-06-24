const buckets = globalThis.__prayerWallRateLimits || new Map();
globalThis.__prayerWallRateLimits = buckets;

function requestIp(request) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

export function rateLimit(request, { key, limit, windowMs }) {
  const now = Date.now();

  if (buckets.size > 10_000) {
    for (const [storedKey, value] of buckets) {
      if (value.resetAt <= now || buckets.size > 9_000) buckets.delete(storedKey);
      if (buckets.size <= 9_000) break;
    }
  }

  const bucketKey = `${key}:${requestIp(request)}`;
  const current = buckets.get(bucketKey);

  if (!current || current.resetAt <= now) {
    buckets.set(bucketKey, { count: 1, resetAt: now + windowMs });
    return null;
  }

  current.count += 1;
  if (current.count <= limit) return null;

  return Math.max(1, Math.ceil((current.resetAt - now) / 1000));
}
