// In-memory store for duplicate detection.
// Resets on server restart — fine for a simple landing.
// For production at scale, use Redis or check Google Sheets directly.

const recentSubmissions = new Map<string, number>();

const DUPLICATE_WINDOW_MS = 30 * 60 * 1000; // 30 minutes

export function checkDuplicate(phone: string, email: string): string | null {
  const now = Date.now();

  // Clean expired entries
  for (const [key, timestamp] of recentSubmissions) {
    if (now - timestamp > DUPLICATE_WINDOW_MS) {
      recentSubmissions.delete(key);
    }
  }

  const phoneKey = `phone:${phone}`;
  const emailKey = `email:${email.toLowerCase()}`;

  if (recentSubmissions.has(phoneKey)) {
    return "Заявка с этим номером телефона уже была отправлена. Повторная отправка возможна через 30 минут.";
  }

  if (recentSubmissions.has(emailKey)) {
    return "Заявка с этим email уже была отправлена. Повторная отправка возможна через 30 минут.";
  }

  return null;
}

export function markSubmitted(phone: string, email: string) {
  const now = Date.now();
  recentSubmissions.set(`phone:${phone}`, now);
  recentSubmissions.set(`email:${email.toLowerCase()}`, now);
}
