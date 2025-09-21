import { CacheWithMeta, CacheWithPeek, CacheBasic } from './cache.types'

export function hasGetOrCreateWithMeta(x: unknown): x is CacheWithMeta {
  return !!x && typeof (x as any).getOrCreateWithMeta === 'function'
}
export function hasPeekValid(x: unknown): x is CacheWithPeek {
  return !!x && typeof (x as any).peekValid === 'function'
}
export function hasGetOrCreate(x: unknown): x is CacheBasic {
  return !!x && typeof (x as any).getOrCreate === 'function'
}
