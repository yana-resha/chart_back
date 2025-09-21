export type CacheSource = 'HIT' | 'MISS' | 'STALE' | 'WAIT'

export interface CacheMeta {
  key: string
  ttlSec: number
  leftSec?: number
  source: CacheSource
  tookMs: number
}

export interface WithMeta<T> {
  value: T
  meta: CacheMeta
}

export type Entry<T = unknown> = {
  value: T
  expiresAt: number
  // для простого LRU
  touchedAt: number
}

export interface CacheBasic {
  getOrCreate<T>(key: string, ttlSec: number, factory: () => Promise<T> | T): Promise<T>
}

export interface CacheWithMeta {
  getOrCreateWithMeta<T>(
    key: string,
    ttlSec: number,
    factory: () => Promise<T> | T,
  ): Promise<{ value: T; meta: CacheMeta }>
}

export interface CacheWithPeek {
  /** Остаток TTL в секундах, если запись валидна; иначе false */
  peekValid(key: string): number | false
}
