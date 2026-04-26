export class PharmacyCache {
  private ttl: number
  private store = new Map<string, { data: any; expiry: number }>()

  constructor(ttlMs: number) {
    this.ttl = ttlMs
  }

  get<T>(key: string): T | null {
    const entry = this.store.get(key)
    if (!entry || Date.now() > entry.expiry) {
      this.store.delete(key)
      return null
    }
    return entry.data as T
  }

  set(key: string, data: any): void {
    this.store.set(key, { data, expiry: Date.now() + this.ttl })
    if (this.store.size > 500) {
      const oldest = [...this.store.entries()].sort((a, b) => a[1].expiry - b[1].expiry)[0]
      if (oldest) this.store.delete(oldest[0])
    }
  }

  clear(): void {
    this.store.clear()
  }
}
