export const normalizeQuery = (s: string) => s.trim().replace(/\s+/g, ' ').toLowerCase()

const ruToLatMap: Record<string, string> = {
  а: 'a',
  б: 'b',
  в: 'v',
  г: 'g',
  д: 'd',
  е: 'e',
  ё: 'e',
  ж: 'zh',
  з: 'z',
  и: 'i',
  й: 'j',
  к: 'k',
  л: 'l',
  м: 'm',
  н: 'n',
  о: 'o',
  п: 'p',
  р: 'r',
  с: 's',
  т: 't',
  у: 'u',
  ф: 'f',
  х: 'h',
  ц: 'c',
  ч: 'ch',
  ш: 'sh',
  щ: 'sch',
  ъ: '',
  ы: 'y',
  ь: '',
  э: 'e',
  ю: 'yu',
  я: 'ya',
}
const latToRuMap: Record<string, string> = {
  a: 'а',
  b: 'б',
  v: 'в',
  g: 'г',
  d: 'д',
  e: 'е',
  z: 'з',
  i: 'и',
  j: 'й',
  k: 'к',
  l: 'л',
  m: 'м',
  n: 'н',
  o: 'о',
  p: 'п',
  r: 'р',
  s: 'с',
  t: 'т',
  u: 'у',
  f: 'ф',
  h: 'х',
  c: 'ц',
  y: 'ы',
}

export function ruToLat(s: string) {
  return s
    .toLowerCase()
    .split('')
    .map((ch) => ruToLatMap[ch] ?? ch)
    .join('')
}
export function latToRu(s: string) {
  return s
    .toLowerCase()
    .split('')
    .map((ch) => latToRuMap[ch] ?? ch)
    .join('')
}

/** Возвращает набор вариантов запроса: оригинал, без диакритики, транслит */
export function expandQueryVariants(q: string) {
  const base = normalizeQuery(q)
  const noAccent = base.normalize('NFD').replace(/\p{Diacritic}/gu, '')
  const ru = /[а-яё]/i.test(base) ? base : latToRu(base)
  const lat = /[a-z]/i.test(base) ? base : ruToLat(base)
  // Уникальные варианты
  return Array.from(new Set([base, noAccent, ru, lat].filter(Boolean)))
}
