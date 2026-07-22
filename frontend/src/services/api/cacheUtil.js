const cache = new Map();

/**
 * Executes a promise-returning function with in-memory TTL caching and request deduplication.
 * Eliminates redundant network requests when multiple components mount simultaneously.
 */
export async function fetchWithCache(key, fetcherFn, ttlMs = 5 * 60 * 1000) {
  const now = Date.now();
  const cached = cache.get(key);

  if (cached && now - cached.timestamp < ttlMs) {
    return cached.promise;
  }

  const promise = fetcherFn().catch((err) => {
    cache.delete(key);
    throw err;
  });

  cache.set(key, { promise, timestamp: now });
  return promise;
}

export function clearCache(keyPrefix) {
  if (!keyPrefix) {
    cache.clear();
    return;
  }
  for (const key of cache.keys()) {
    if (key.startsWith(keyPrefix)) {
      cache.delete(key);
    }
  }
}
