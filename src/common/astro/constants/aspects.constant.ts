import { AspectCategory, AspectType } from '../enums/aspects.enum'

export const ASPECT_DESCRIPTION: Record<AspectType, string> = {
  [AspectType.Conjunction]: 'Соединение',
  [AspectType.Opposition]: 'Оппозиция',
  [AspectType.Trine]: 'Тригон',
  [AspectType.Square]: 'Квадрат',
  [AspectType.Sextile]: 'Cекстиль',
  [AspectType.Quincunx]: 'Квинконс',
}

export const ASPECT_CATEGORY_MAP: Record<AspectCategory, AspectType[]> = {
  [AspectCategory.HARMONIOUS]: [AspectType.Trine, AspectType.Sextile],
  [AspectCategory.TENSE]: [AspectType.Square, AspectType.Opposition],
  [AspectCategory.NEUTRAL]: [AspectType.Conjunction, AspectType.Quincunx],
}
