// src/locality/utils/uniq.ts
export function uniqByGeonameId<T extends { geonameid: string }>(rows: T[]): T[] {
  return Array.from(new Map(rows.map((r) => [r.geonameid, r])).values())
}
