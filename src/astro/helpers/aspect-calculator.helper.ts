import {
  AspectType,
  AspectOrbSettings,
  AspectWeightSettings,
  PlanetImportanceSettings,
  Aspect,
  StrongestPlanet,
  EvaluateChartStrength,
  EvaluateChartStrengthVariables,
} from '../types/aspect.types'
import { PlanetPosition } from '../types/sweph.types'

export class AspectCalculator {
  static readonly MOON_ORB_MULTIPLIER = 1.2 // Орбис с Луной увеличивается на 20%
  static readonly MOON_STRENGTH_MULTIPLIER = 1.2 // Сила аспектов к Луне увеличивается на 10%
  static readonly DEFAULT_MAX_ORB: Record<AspectType, number> = {
    [AspectType.Conjunction]: 8,
    [AspectType.Opposition]: 8,
    [AspectType.Trine]: 7,
    [AspectType.Square]: 6,
    [AspectType.Sextile]: 5,
    [AspectType.Quincunx]: 3,
  }

  static readonly DEFAULT_WEIGHTS: Record<AspectType, number> = {
    [AspectType.Conjunction]: 1.2,
    [AspectType.Opposition]: 1.1,
    [AspectType.Trine]: 1.0,
    [AspectType.Square]: 1.0,
    [AspectType.Sextile]: 0.8,
    [AspectType.Quincunx]: 0.7,
  }

  static readonly DEFAULT_IMPORTANCE: Record<string, number> = {
    Sun: 1.5,
    Moon: 1.4,
    Mercury: 1.2,
    Venus: 1.2,
    Mars: 1.2,
    Jupiter: 1.1,
    Saturn: 1.1,
    Uranus: 1.0,
    Neptune: 1.0,
    Pluto: 1.0,
    NorthNode: 0.8,
    Chiron: 0.7,
    Lilith: 0.7,
  }

  static readonly ASPECTS = {
    [AspectType.Conjunction]: 0,
    [AspectType.Opposition]: 180,
    [AspectType.Trine]: 120,
    [AspectType.Square]: 90,
    [AspectType.Sextile]: 60,
    [AspectType.Quincunx]: 150,
  }

  static readonly MAJOR_ASPECTS = new Set([
    AspectType.Conjunction,
    AspectType.Opposition,
    AspectType.Trine,
    AspectType.Square,
    AspectType.Sextile,
  ])

  // Расширенный орбис аспектов с Луной (например, на +20%).
  //Увеличение силы аспекта с Луной (например, ×1.1).
  static calculateAspects(
    planets: PlanetPosition[],
    customOrbs?: AspectOrbSettings,
    customWeights?: AspectWeightSettings,
    customImportance?: PlanetImportanceSettings,
  ): Aspect[] {
    const aspects: Aspect[] = []

    for (let i = 0; i < planets.length; i++) {
      for (let j = i + 1; j < planets.length; j++) {
        const planetA = planets[i]
        const planetB = planets[j]

        // 🔥 Пропускаем аспекты между Раху и Кету
        if (
          (planetA.name === 'Rahu' && planetB.name === 'Ketu') ||
          (planetA.name === 'Ketu' && planetB.name === 'Rahu')
        ) {
          continue
        }

        const angle = this.getAngleBetween(planetA.longitude, planetB.longitude)

        for (const [aspectType, exactAngle] of Object.entries(this.ASPECTS)) {
          const orb = Math.abs(angle - exactAngle)

          let maxOrb =
            customOrbs?.[aspectType as AspectType] ?? this.DEFAULT_MAX_ORB[aspectType as AspectType]

          // 📍 Если один из участников Луна — увеличиваем орбис
          if (planetA.name === 'Moon' || planetB.name === 'Moon') {
            maxOrb *= this.MOON_ORB_MULTIPLIER
          }

          if (orb <= maxOrb) {
            let baseStrength = this.calculateStrength(orb, maxOrb)

            const aspectWeight =
              customWeights?.[aspectType as AspectType] ?? this.DEFAULT_WEIGHTS[aspectType as AspectType]
            const planetAImportance =
              customImportance?.[planetA.name] ?? this.DEFAULT_IMPORTANCE[planetA.name] ?? 1.0
            const planetBImportance =
              customImportance?.[planetB.name] ?? this.DEFAULT_IMPORTANCE[planetB.name] ?? 1.0

            const averageImportance = (planetAImportance + planetBImportance) / 2

            // 📍 Если Луна участвует — усиливаем аспект
            if (planetA.name === 'Moon' || planetB.name === 'Moon') {
              baseStrength *= this.MOON_STRENGTH_MULTIPLIER
            }

            const strength = parseFloat((baseStrength * aspectWeight * averageImportance).toFixed(1))

            aspects.push({
              planetA: planetA.name,
              planetB: planetB.name,
              aspectType: aspectType as AspectType,
              angle: this.ASPECTS[aspectType],
              orb: parseFloat(orb.toFixed(2)),
              strength,
              isExact: orb <= 1,
              isVeryExact: orb <= 0.5 || strength >= 95,
            })
          }
        }
      }
    }

    return this.sortAspects(aspects)
  }

  // рассчитать аспекты по конкетной планете (Пока нигде не используется)
  static calculatePlanetAspects(
    planets: PlanetPosition[],
    targetPlanet: string,
    customOrbs?: AspectOrbSettings,
    customWeights?: AspectWeightSettings,
    customImportance?: PlanetImportanceSettings,
  ): Aspect[] {
    const aspects = this.calculateAspects(planets, customOrbs, customWeights, customImportance)

    return aspects.filter((aspect) => aspect.planetA === targetPlanet || aspect.planetB === targetPlanet)
  }

  private static sortAspects(aspects: Aspect[]): Aspect[] {
    return aspects.sort((a, b) => b.strength - a.strength)
  }

  private static getAngleBetween(long1: number, long2: number): number {
    let diff = Math.abs(long1 - long2)
    if (diff > 180) {
      diff = 360 - diff
    }
    return diff
  }

  private static calculateStrength(orb: number, maxOrb: number): number {
    const strength = Math.max(0, 100 * (1 - orb / maxOrb))
    return parseFloat(strength.toFixed(1))
  }

  // найти самую сильную планету по аспектам
  // которая участвует в самых сильных аспектах (суммарно)
  static getStrongestPlanet(aspects: Aspect[]): StrongestPlanet {
    const planetStrengthMap: Record<string, number> = {}

    for (const aspect of aspects) {
      const strength = aspect.strength

      planetStrengthMap[aspect.planetA] = (planetStrengthMap[aspect.planetB] ?? 0) + strength
      planetStrengthMap[aspect.planetB] = (planetStrengthMap[aspect.planetA] ?? 0) + strength
    }

    const strongest = Object.entries(planetStrengthMap).reduce(
      (acc, [planet, totalStrength]) => (totalStrength > acc.totalStrength ? { planet, totalStrength } : acc),
      { planet: '', totalStrength: 0 },
    )

    return strongest
  }

  // оценка карты по количеству аспектов
  static evaluateChartStrength(aspects: Aspect[]): EvaluateChartStrength {
    const maxPossibleAspects = (12 * 11) / 2 // максимальное количество пар между 12 планетами
    const aspectCount = aspects.length
    const normalizedScore = Math.min((aspectCount / maxPossibleAspects) * 100, 100)

    let label: EvaluateChartStrengthVariables

    if (normalizedScore < 20) {
      label = EvaluateChartStrengthVariables.VERY_LOW
    } else if (normalizedScore < 40) {
      label = EvaluateChartStrengthVariables.LOW
    } else if (normalizedScore < 60) {
      label = EvaluateChartStrengthVariables.MIDDLE
    } else if (normalizedScore < 80) {
      label = EvaluateChartStrengthVariables.STRONG
    } else {
      label = EvaluateChartStrengthVariables.VERY_STRONG
    }

    return {
      score: Math.round(normalizedScore),
      label,
    }
  }
}
