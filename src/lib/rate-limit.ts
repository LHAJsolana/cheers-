const attempts = new Map<string, { count: number; resetAt: number }>();

type RateLimitOptions = {
  limit: number;
  windowMs: number;
};

export function checkRateLimit(key: string, options: RateLimitOptions) {
  const now = Date.now();
  const current = attempts.get(key);

  if (!current || current.resetAt <= now) {
    attempts.set(key, { count: 1, resetAt: now + options.windowMs });
    return { allowed: true, retryAfterSeconds: 0 };
  }

  if (current.count >= options.limit) {
    return {
      allowed: false,
      retryAfterSeconds: Math.ceil((current.resetAt - now) / 1000),
    };
  }

  current.count += 1;
  return { allowed: true, retryAfterSeconds: 0 };
}

export function authRateLimitKey(ip: string | null, scope: string, identifier = "anonymous") {
  return `auth:${scope}:${ip ?? "unknown"}:${identifier.toLowerCase()}`;
}
