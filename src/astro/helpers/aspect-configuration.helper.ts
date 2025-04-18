import { Aspect, AspectType } from '../types/aspect.types'
import { AstroConfiguration, AstroConfigurationType } from '../types/configuration.types'

export class AspectConfigurationDetector {
  static detectConfigurations(aspects: Aspect[]): AstroConfiguration[] {
    const configurations: AstroConfiguration[] = []

    const trines = aspects.filter((aspect) => aspect.aspectType === AspectType.Trine && aspect.orb <= 5)

    const oppositions = aspects.filter(
      (aspect) => aspect.aspectType === AspectType.Opposition && aspect.orb <= 6,
    )

    const squares = aspects.filter((aspect) => aspect.aspectType === AspectType.Square && aspect.orb <= 6)

    // --- GRAND TRINE ---
    const candidates = new Map<string, Set<string>>()
    for (const aspect of trines) {
      candidates.set(aspect.planetA, (candidates.get(aspect.planetA) ?? new Set()).add(aspect.planetB))
      candidates.set(aspect.planetB, (candidates.get(aspect.planetB) ?? new Set()).add(aspect.planetA))
    }

    const planetKeys = Array.from(candidates.keys())
    for (let i = 0; i < planetKeys.length; i++) {
      for (let j = i + 1; j < planetKeys.length; j++) {
        for (let k = j + 1; k < planetKeys.length; k++) {
          const [p1, p2, p3] = [planetKeys[i], planetKeys[j], planetKeys[k]]
          if (candidates.get(p1)?.has(p2) && candidates.get(p1)?.has(p3) && candidates.get(p2)?.has(p3)) {
            configurations.push({
              type: AstroConfigurationType.GrandTrine,
              planets: [p1, p2, p3],
            })
          }
        }
      }
    }

    // --- T-SQUARE ---
    for (const opp of oppositions) {
      const { planetA, planetB } = opp
      const squareToA = squares.filter((a) => a.planetA === planetA || a.planetB === planetA)
      const squareToB = squares.filter((a) => a.planetA === planetB || a.planetB === planetB)

      for (const sqA of squareToA) {
        const third = sqA.planetA === planetA ? sqA.planetB : sqA.planetA
        const match = squareToB.find((sqB) => sqB.planetA === third || sqB.planetB === third)

        if (match) {
          configurations.push({
            type: AstroConfigurationType.TSquare,
            planets: [planetA, planetB, third],
          })
        }
      }
    }

    // --- GRAND CROSS ---
    const allPlanets = Array.from(new Set(aspects.flatMap((a) => [a.planetA, a.planetB])))
    for (let i = 0; i < allPlanets.length; i++) {
      for (let j = i + 1; j < allPlanets.length; j++) {
        for (let k = j + 1; k < allPlanets.length; k++) {
          for (let l = k + 1; l < allPlanets.length; l++) {
            const combo = [allPlanets[i], allPlanets[j], allPlanets[k], allPlanets[l]]

            const squarePairs = this.countMatchingAspects(combo, squares)
            const oppoPairs = this.countMatchingAspects(combo, oppositions)

            if (squarePairs >= 4 && oppoPairs >= 2) {
              configurations.push({
                type: AstroConfigurationType.GrandCross,
                planets: combo,
              })
            }
          }
        }
      }
    }

    return configurations
  }

  private static countMatchingAspects(planets: string[], aspects: Aspect[]) {
    let count = 0
    for (let i = 0; i < planets.length; i++) {
      for (let j = i + 1; j < planets.length; j++) {
        if (
          aspects.find(
            (a) =>
              (a.planetA === planets[i] && a.planetB === planets[j]) ||
              (a.planetA === planets[j] && a.planetB === planets[i]),
          )
        ) {
          count++
        }
      }
    }
    return count
  }
}
