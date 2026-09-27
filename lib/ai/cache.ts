// Server-side response cache for expensive AI queries
interface CacheEntry<T> {
  data: T
  expiresAt: number
}

const cacheMap = new Map<string, CacheEntry<any>>()

export function getCachedAIResult<T>(key: string): T | null {
  const entry = cacheMap.get(key)
  if (!entry) return null
  if (Date.now() > entry.expiresAt) {
    cacheMap.delete(key)
    return null
  }
  return entry.data as T
}

export function setCachedAIResult<T>(key: string, data: T, ttlMs: number = 5 * 60 * 1000): void {
  cacheMap.set(key, {
    data,
    expiresAt: Date.now() + ttlMs
  })
}

export function invalidateAICache(keyPrefix?: string): void {
  if (!keyPrefix) {
    cacheMap.clear()
    return
  }
  for (const k of cacheMap.keys()) {
    if (k.startsWith(keyPrefix)) {
      cacheMap.delete(k)
    }
  }
}
