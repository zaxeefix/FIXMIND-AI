type Bucket = { count: number; resetsAt: number };
const buckets = new Map<string, Bucket>();

export function rateLimit(key: string, limit = 10, windowMs = 60 * 60 * 1000, now = Date.now()) {
  const bucket = buckets.get(key);
  if (!bucket || bucket.resetsAt <= now) {
    buckets.set(key, { count: 1, resetsAt: now + windowMs });
    return { allowed: true, remaining: limit - 1, resetsAt: now + windowMs };
  }
  bucket.count += 1;
  return { allowed: bucket.count <= limit, remaining: Math.max(0, limit - bucket.count), resetsAt: bucket.resetsAt };
}
