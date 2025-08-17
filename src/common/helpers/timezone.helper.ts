// eslint-disable-next-line @typescript-eslint/no-require-imports
import tzLookup = require('@photostructure/tz-lookup')

export type TimezoneInfo = {
  zoneId: string // например: "Europe/London"
  offsetMinutes: number // смещение от UTC на заданную дату (с учётом DST)
  offsetHours: number // то же в часах (может быть дробным)
}

// простой дневной кэш по зоне/дате
const cache = new Map<string, TimezoneInfo>()

export function getZoneIdByCoords(lat: number, lon: number): string {
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    throw new Error(`Bad coords: lat=${lat}, lon=${lon}`)
  }
  return tzLookup(lat, lon)
}

/** Возвращает IANA-зону и смещение на конкретную дату (DST учитывается автоматически) */
export function getTimezoneInfoByCoords(lat: number, lon: number, at: Date = new Date()): TimezoneInfo {
  const zoneId = getZoneIdByCoords(lat, lon)
  const dayKey = at.toISOString().slice(0, 10)
  const key = `${zoneId}|${dayKey}`

  const cached = cache.get(key)
  if (cached) return cached

  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: zoneId,
    timeZoneName: 'shortOffset',
  })
  const parts = formatter.formatToParts(at)
  const offsetPart = parts.find((p) => p.type === 'timeZoneName')?.value ?? 'UTC'

  // offsetPart выглядит как "UTC+3" или "GMT-5:30"
  const match = offsetPart.match(/([+-]\d{1,2})(?::(\d{2}))?/)
  const hours = match ? parseInt(match[1], 10) : 0
  const minutes = match && match[2] ? parseInt(match[2], 10) : 0
  const totalMinutes = hours * 60 + Math.sign(hours) * minutes

  const info: TimezoneInfo = {
    zoneId,
    offsetMinutes: totalMinutes,
    offsetHours: totalMinutes / 60,
  }
  cache.set(key, info)
  return info
}

/** Если нужен просто offset в минутах */
export function getOffsetMinutesByCoords(lat: number, lon: number, at: Date = new Date()): number {
  return getTimezoneInfoByCoords(lat, lon, at).offsetMinutes
}

/** Если нужен offset в часах (дробное число: 5.5, 9.75 и т.д.) */
export function getOffsetHoursByCoords(lat: number, lon: number, at: Date = new Date()): number {
  return getTimezoneInfoByCoords(lat, lon, at).offsetHours
}
