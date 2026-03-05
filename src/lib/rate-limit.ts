// Simple in-memory rate limiter (per IP)
// For production at scale, use Redis (Upstash) — this works for current load

const store = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(ip: string, maxRequests: number, windowMs: number): boolean {
  const now = Date.now();
  const record = store.get(ip);

  if (!record || now > record.resetAt) {
    store.set(ip, { count: 1, resetAt: now + windowMs });
    return true; // allowed
  }

  if (record.count >= maxRequests) {
    return false; // blocked
  }

  record.count++;
  return true; // allowed
}

export function getClientIp(request: Request): string {
  const forwarded = (request.headers as Headers).get('x-forwarded-for');
  return forwarded ? forwarded.split(',')[0].trim() : 'unknown';
}
