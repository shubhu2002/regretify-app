// Minimal in-memory rate limiter for hot auth endpoints.
//
// Note: state is per server instance (fine for a single Node server; on
// serverless it still throttles bursts against a warm instance). For
// distributed, durable limiting swap this for Upstash/Redis.

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

export function rateLimit(
	key: string,
	limit: number,
	windowMs: number,
): { allowed: boolean; retryAfterSec: number } {
	const now = Date.now();
	const bucket = buckets.get(key);

	if (!bucket || bucket.resetAt <= now) {
		buckets.set(key, { count: 1, resetAt: now + windowMs });
		return { allowed: true, retryAfterSec: 0 };
	}

	bucket.count += 1;
	if (bucket.count > limit) {
		return {
			allowed: false,
			retryAfterSec: Math.ceil((bucket.resetAt - now) / 1000),
		};
	}
	return { allowed: true, retryAfterSec: 0 };
}

export function resetRateLimit(key: string) {
	buckets.delete(key);
}

// Periodically drop expired buckets so the map doesn't grow forever
setInterval(() => {
	const now = Date.now();
	for (const [key, bucket] of buckets) {
		if (bucket.resetAt <= now) buckets.delete(key);
	}
}, 60_000).unref?.();
