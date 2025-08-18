import { ApiProperty } from '@nestjs/swagger'
import { AspectType, AspectCategory } from 'src/common/astro/enums/aspects.enum'

export class Aspect {
  @ApiProperty({ example: 'Sun' })
  planetA: string

  @ApiProperty({ example: 'Moon' })
  planetB: string

  @ApiProperty({ example: AspectType.Conjunction })
  aspectType: AspectType

  @ApiProperty({ example: 0.85, description: 'Орб (расстояние от точного аспекта)' })
  orb: number

  @ApiProperty({ example: true, description: 'Является ли аспект точным (орб < 1°)' })
  isExact: boolean

  @ApiProperty({ example: true, description: 'Угол аспекта' })
  angle: number

  @ApiProperty({
    example: false,
    description: 'Является ли аспект супер-точным аспект (orb <= 0.5 || strength >= 95)',
  })
  isVeryExact: boolean

  @ApiProperty({ example: 0.92, description: 'Сила аспекта от 0 до 1' })
  strength: number
}

export class StrongestPlanet {
  @ApiProperty({ example: 'Sun' })
  planet: string
  @ApiProperty({ example: 4.56, description: 'Сила по всем аспектам' })
  totalStrength: number
}

export enum EvaluateChartStrengthVariables {
  LOW = 'low',
  VERY_LOW = 'very low',
  MIDDLE = 'middle',
  STRONG = 'strong',
  VERY_STRONG = 'very strong',
}

class AspectCategoryStats {
  @ApiProperty({ example: 12 })
  count: number

  @ApiProperty({ example: 43.0 })
  percent: number

  @ApiProperty({ type: [String], example: ['Trine', 'Sextile'] })
  items: AspectType[]
}

export class ChartAspectStatistics {
  @ApiProperty({ example: 66 })
  maxPossibleAspects: number

  @ApiProperty({ example: 28 })
  totalAspects: number

  @ApiProperty({ example: 42 })
  normalizedScore: number

  @ApiProperty({ example: 'middle' })
  label: EvaluateChartStrengthVariables;

  @ApiProperty({ type: AspectCategoryStats })
  [AspectCategory.HARMONIOUS]: AspectCategoryStats;

  @ApiProperty({ type: AspectCategoryStats })
  [AspectCategory.TENSE]: AspectCategoryStats;

  @ApiProperty({ type: AspectCategoryStats })
  [AspectCategory.NEUTRAL]: AspectCategoryStats
}

export type AspectOrbSettings = Partial<Record<AspectType, number>>
export type AspectWeightSettings = Partial<Record<AspectType, number>>
export type PlanetImportanceSettings = Partial<Record<string, number>>
