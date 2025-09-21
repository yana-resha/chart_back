// src/locality/utils/collapse-seats.ts
import { GeonamesCity } from '../models/geonames-city.model'

const norm = (s?: string | null) => (s ?? '').trim().toLowerCase()
const isSeat = (code?: string | null) => !!code && /^PPLA\d*$/.test(code) // PPLA, PPLA2..PPLA5
const isPpl = (code?: string | null) => code === 'PPL'

/**
 * Внутри одной группы (одно имя + один admin2/admin1/country)
 * если есть PPL — удаляем все PPLA*.
 */
export function collapseSeatsPreferPPL(rows: GeonamesCity[]): GeonamesCity[] {
  const keyOf = (c: GeonamesCity) =>
    `${norm(c.asciiname_ru ?? c.asciiname)}|${c.admin2_id ?? c.admin1_id ?? c.country ?? ''}`

  const groups = new Map<string, GeonamesCity[]>()
  for (const r of rows) {
    const k = keyOf(r)
    const arr = groups.get(k)
    if (arr) arr.push(r)
    else groups.set(k, [r])
  }

  const out: GeonamesCity[] = []
  for (const group of groups.values()) {
    const hasPpl = group.some((g) => isPpl(g.feature_code))
    if (!hasPpl) {
      // нет PPL — оставляем всё как есть (PPLA* сохраняем)
      out.push(...group)
      continue
    }
    // есть PPL — выкидываем только PPLA*
    out.push(...group.filter((g) => !isSeat(g.feature_code)))
  }

  // финальная дедупликация на всякий случай
  return Array.from(new Map(out.map((r) => [r.geonameid, r])).values())
}
