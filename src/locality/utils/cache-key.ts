// src/locality/utils/cache-key.ts
import { createHash } from 'crypto'
import { FindCitiesSmartOpts } from '../types'
import { normalizeQuery } from './text-normalize'

const CACHE_VER = process.env.LOCALITY_CACHE_VERSION ?? 'v1'

export function buildLocalityCacheKey(q: string, opts: FindCitiesSmartOpts) {
  const qNorm = normalizeQuery(q)
  const parts = [
    'locality',
    CACHE_VER,
    opts.lang ?? 'ru',
    opts.countryIso?.toUpperCase() ?? '-',
    String(Math.min(Math.max(opts.limit ?? 50, 1), 200)),
    String(Math.max(opts.offset ?? 0, 0)),
    createHash('sha1').update(qNorm).digest('hex').slice(0, 12),
  ]
  return parts.join(':')
}
