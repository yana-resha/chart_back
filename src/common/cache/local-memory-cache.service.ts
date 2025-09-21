import { Injectable, Logger } from '@nestjs/common'
import { Entry, WithMeta } from './cache.types'

@Injectable()
export class LocalMemoryCacheService {
  private readonly logger = new Logger(LocalMemoryCacheService.name)
  private readonly store = new Map<string, Entry>()
  private readonly inflight = new Map<string, Promise<any>>() // дедупликация конкурентных MISS
  private readonly debug = process.env.LOCALITY_CACHE_DEBUG === '1'

  private readonly MAX_ENTRIES = Number(process.env.LOCALITY_CACHE_MAX ?? 1000)
  private readonly SWEEP_MS = Number(process.env.LOCALITY_CACHE_SWEEP_MS ?? 60_000)

  constructor() {
    // периодическая зачистка протухших ключей
    const timer = setInterval(() => this.sweepExpired(), this.SWEEP_MS)
    // чтобы таймер не держал процесс живым

    if (typeof timer.unref === 'function') timer.unref()
  }

  peekValid(key: string): boolean {
    const e = this.store.get(key)
    return !!(e && e.expiresAt > Date.now())
  }

  async getOrCreateWithMeta<T>(
    key: string,
    ttlSeconds: number,
    factory: () => Promise<T> | T,
  ): Promise<WithMeta<T>> {
    const start = Date.now()
    const now = start
    const e = this.store.get(key)

    // HIT
    if (e && e.expiresAt > now) {
      e.touchedAt = now
      const leftSec = Math.max(0, Math.floor((e.expiresAt - now) / 1000))
      if (this.debug) this.logger.debug(`HIT ${key} (left ~${leftSec}s)`)
      return {
        value: e.value as T,
        meta: { key, ttlSec: ttlSeconds, leftSec, source: 'HIT', tookMs: Date.now() - start },
      }
    }

    // WAIT (уже есть «в полёте» вычисление по этому ключу)
    const infl = this.inflight.get(key)
    if (infl) {
      if (this.debug) this.logger.debug(`WAIT ${key}`)
      const value = (await infl) as T
      const cur = this.store.get(key)
      const leftSec = cur ? Math.max(0, Math.floor((cur.expiresAt - Date.now()) / 1000)) : undefined
      return {
        value,
        meta: { key, ttlSec: ttlSeconds, leftSec, source: 'WAIT', tookMs: Date.now() - start },
      }
    }

    // MISS/STALE → идём в фабрику
    if (this.debug) this.logger.debug(`${e ? 'STALE' : 'MISS'} ${key}`)

    const p = Promise.resolve(factory())
      .then((val) => {
        this.inflight.delete(key)
        this.save(key, val, ttlSeconds)
        return val
      })
      .catch((err) => {
        this.inflight.delete(key)
        throw err
      })

    this.inflight.set(key, p)
    const value = (await p) as T
    const cur = this.store.get(key)
    const leftSec = cur ? Math.max(0, Math.floor((cur.expiresAt - Date.now()) / 1000)) : undefined

    return {
      value,
      meta: {
        key,
        ttlSec: ttlSeconds,
        leftSec,
        source: e ? 'STALE' : 'MISS',
        tookMs: Date.now() - start,
      },
    }
  }

  // Обычный метод — просто делегирует
  async getOrCreate<T>(key: string, ttlSeconds: number, factory: () => Promise<T> | T): Promise<T> {
    const { value } = await this.getOrCreateWithMeta<T>(key, ttlSeconds, factory)
    return value
  }

  // --- обслуживание ---

  delete(key: string) {
    this.store.delete(key)
  }
  clear() {
    this.store.clear()
  }
  size() {
    return this.store.size
  }

  private save<T>(key: string, value: T, ttlSeconds: number) {
    const expiresAt = Date.now() + ttlSeconds * 1000
    const entry: Entry = { value, expiresAt, touchedAt: Date.now() }
    this.store.set(key, entry)
    if (this.debug) this.logger.debug(`SET ${key} ttl=${ttlSeconds}s`)

    // простой лимит: если вышли за MAX_ENTRIES — выкидываем «наименее недавно тронутые»
    if (this.store.size > this.MAX_ENTRIES) {
      const toDrop = this.store.size - this.MAX_ENTRIES
      const victims = [...this.store.entries()]
        .sort((a, b) => a[1].touchedAt - b[1].touchedAt) // старые вперёд
        .slice(0, toDrop)
      for (const [k] of victims) this.store.delete(k)
      if (this.debug) this.logger.warn(`EVICT ${victims.length} (size=${this.store.size})`)
    }
  }

  private sweepExpired() {
    const now = Date.now()
    let removed = 0
    for (const [k, v] of this.store) {
      if (v.expiresAt <= now) {
        this.store.delete(k)
        removed++
      }
    }
    if (removed && this.debug) this.logger.debug(`SWEEP expired=${removed} size=${this.store.size}`)
  }
}
