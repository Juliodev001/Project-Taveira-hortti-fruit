type Entry = { data: unknown; expires: number }
const store = new Map<string, Entry>()
const inflight = new Map<string, Promise<unknown>>()

export const memCache = {
  get<T>(key: string): T | null {
    const e = store.get(key)
    if (!e) return null
    if (Date.now() > e.expires) { store.delete(key); return null }
    return e.data as T
  },

  set(key: string, data: unknown, ttlMs = 30_000) {
    store.set(key, { data, expires: Date.now() + ttlMs })
  },

  invalidate(prefix: string) {
    for (const key of store.keys()) {
      if (key.startsWith(prefix)) store.delete(key)
    }
  },

  // Single-flight: requests simultâneas ao mesmo key compartilham uma única query ao banco
  async fetch<T>(key: string, fn: () => Promise<T>, ttlMs = 30_000): Promise<T> {
    const hit = this.get<T>(key)
    if (hit !== null) return hit

    const existing = inflight.get(key)
    if (existing) return existing as Promise<T>

    const promise = fn()
      .then((data) => { this.set(key, data, ttlMs); return data })
      .finally(() => inflight.delete(key))

    inflight.set(key, promise)
    return promise
  },
}
