/**
 * In-memory sliding window rate limiter.
 *
 * Tracks request timestamps per key (typically an IP address) and enforces
 * a maximum number of requests within a rolling time window.
 */

interface RateLimitEntry {
  timestamps: number[];
}

const store = new Map<string, RateLimitEntry>();

// Cleanup stale entries every 60 seconds to prevent unbounded memory growth
const CLEANUP_INTERVAL_MS = 60_000;

let cleanupTimer: ReturnType<typeof setInterval> | null = null;

function ensureCleanupRunning() {
  if (cleanupTimer) return;
  cleanupTimer = setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store) {
      // Remove timestamps older than the largest reasonable window (5 minutes)
      entry.timestamps = entry.timestamps.filter((t) => now - t < 5 * 60_000);
      if (entry.timestamps.length === 0) {
        store.delete(key);
      }
    }
    // If the store is empty, stop the cleanup timer
    if (store.size === 0 && cleanupTimer) {
      clearInterval(cleanupTimer);
      cleanupTimer = null;
    }
  }, CLEANUP_INTERVAL_MS);

  // Allow Node.js to exit even if the timer is still running
  if (cleanupTimer && typeof cleanupTimer === 'object' && 'unref' in cleanupTimer) {
    cleanupTimer.unref();
  }
}

/**
 * Check whether a request from the given key (IP) is allowed under the
 * specified rate limit.
 *
 * @param key       - Identifier for the requester (e.g. IP address)
 * @param limit     - Maximum number of requests allowed within the window
 * @param windowMs  - Duration of the sliding window in milliseconds
 * @returns An object indicating whether the request is allowed and how many
 *          requests remain in the current window.
 */
export function rateLimit(
  key: string,
  limit: number,
  windowMs: number,
): { allowed: boolean; remaining: number } {
  ensureCleanupRunning();

  const now = Date.now();
  let entry = store.get(key);

  if (!entry) {
    entry = { timestamps: [] };
    store.set(key, entry);
  }

  // Remove timestamps outside the current window
  entry.timestamps = entry.timestamps.filter((t) => now - t < windowMs);

  if (entry.timestamps.length >= limit) {
    return { allowed: false, remaining: 0 };
  }

  entry.timestamps.push(now);
  return { allowed: true, remaining: limit - entry.timestamps.length };
}
