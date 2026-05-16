interface Bucket {
  count: number;
  firstAt: number;
  lockedUntil?: number;
}

const store = new Map<string, Bucket>();
const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 10;
const LOCK_MS = 15 * 60 * 1000;

export function checkRateLimit(key: string): { allowed: boolean; retryAfterMs?: number } {
  const now = Date.now();
  const rec = store.get(key);

  if (rec?.lockedUntil && now < rec.lockedUntil) {
    return { allowed: false, retryAfterMs: rec.lockedUntil - now };
  }

  if (!rec || now - rec.firstAt > WINDOW_MS) {
    store.set(key, { count: 1, firstAt: now });
    return { allowed: true };
  }

  rec.count += 1;

  if (rec.count > MAX_ATTEMPTS) {
    rec.lockedUntil = now + LOCK_MS;
    return { allowed: false, retryAfterMs: LOCK_MS };
  }

  return { allowed: true };
}

export function clearRateLimit(key: string): void {
  store.delete(key);
}

// Prune stale buckets every 30 minutes
setInterval(
  () => {
    const now = Date.now();
    Array.from(store.keys()).forEach((k) => {
      const rec = store.get(k);
      if (!rec) return;
      const stale = now - rec.firstAt > WINDOW_MS * 2;
      const unlocked = !rec.lockedUntil || now > rec.lockedUntil;
      if (stale && unlocked) store.delete(k);
    });
  },
  30 * 60 * 1000,
);
