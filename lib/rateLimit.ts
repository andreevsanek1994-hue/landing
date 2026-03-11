// Simple in-memory rate limiter per IP.
// Allows `maxRequests` per `windowMs`.

const hits = new Map<string, number[]>();

const MAX_REQUESTS = 5;
const WINDOW_MS = 60 * 1000; // 1 minute

export function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const timestamps = hits.get(ip) ?? [];

  // Keep only timestamps within window
  const recent = timestamps.filter((t) => now - t < WINDOW_MS);

  if (recent.length >= MAX_REQUESTS) {
    hits.set(ip, recent);
    return true;
  }

  recent.push(now);
  hits.set(ip, recent);
  return false;
}
