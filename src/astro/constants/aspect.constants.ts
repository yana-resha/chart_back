import { AspectCategory, AspectType } from '../types/aspect.types'

export const ASPECT_CATEGORY_MAP: Record<AspectCategory, AspectType[]> = {
  [AspectCategory.HARMONIOUS]: [AspectType.Trine, AspectType.Sextile],
  [AspectCategory.TENSE]: [AspectType.Square, AspectType.Opposition],
  [AspectCategory.NEUTRAL]: [AspectType.Conjunction, AspectType.Quincunx],
}
