import { Aspect, AspectType } from '../types/aspect.types'
import { AstroConfiguration, AstroConfigurationType } from '../types/configuration.types'

function getAngleDiff(a: number, b: number): number {
  const diff = (((a - b) % 360) + 360) % 360
  return diff > 180 ? 360 - diff : diff
}

interface PlanetPosition {
  name: string
  longitude: number
}

export class AspectConfigurationDetector {
  static detectConfigurations(aspects: Aspect[], positions: PlanetPosition[]): AstroConfiguration[] {
    const configurations: AstroConfiguration[] = []

    // === Параметры ===
    const MIN_TRINE_STRENGTH = 0

    const planetMap = Object.fromEntries(positions.map((p) => [p.name, p]))

    // === Группировка по типам аспектов ===
    const trines = aspects.filter((a) => a.aspectType === AspectType.Trine)
    const sextiles = aspects.filter((a) => a.aspectType === AspectType.Sextile)
    const oppositions = aspects.filter((a) => a.aspectType === AspectType.Opposition)
    const squares = aspects.filter((a) => a.aspectType === AspectType.Square)

    const getTrine = (a: string, b: string) =>
      trines.find((t) => (t.planetA === a && t.planetB === b) || (t.planetA === b && t.planetB === a))

    // === GRAND TRINE ===
    const seenGrandTrines = new Set<string>()
    const trinePlanets = Array.from(new Set(trines.flatMap((t) => [t.planetA, t.planetB])))

    for (let i = 0; i < trinePlanets.length; i++) {
      for (let j = i + 1; j < trinePlanets.length; j++) {
        for (let k = j + 1; k < trinePlanets.length; k++) {
          const [A, B, C] = [trinePlanets[i], trinePlanets[j], trinePlanets[k]]

          const t1 = getTrine(A, B)
          const t2 = getTrine(A, C)
          const t3 = getTrine(B, C)

          if (t1 && t2 && t3) {
            const sorted = [A, B, C].sort()
            const key = sorted.join(',')
            if (!seenGrandTrines.has(key)) {
              seenGrandTrines.add(key)
              configurations.push({
                type: AstroConfigurationType.GrandTrine,
                planets: sorted,
              })
            }
          }
        }
      }
    }

    // === T-SQUARE (по симметрии углов к оппозиции, один на ось с учётом силы аспектов) ===
    const seenTSquares = new Set<string>()

    const aspectMap = new Map<string, Aspect>()
    for (const a of aspects) {
      aspectMap.set(`${a.planetA}-${a.planetB}`, a)
      aspectMap.set(`${a.planetB}-${a.planetA}`, a)
    }

    const bestTSquarePerOpposition = new Map<
      string,
      {
        A: string
        B: string
        C: string
        angleCA: number
        angleCB: number
        delta: number
        strengthSum: number
      }
    >()

    for (const opp of oppositions) {
      const [A, B] = [opp.planetA, opp.planetB]

      const posA = planetMap[A]
      const posB = planetMap[B]
      if (!posA || !posB) continue

      const oppKey = [A, B].sort().join(',')

      for (const C of new Set(squares.flatMap((s) => [s.planetA, s.planetB]))) {
        if (C === A || C === B) continue
        const posC = planetMap[C]
        if (!posC) continue

        const hasSquareToA = squares.some(
          (sq) => (sq.planetA === C && sq.planetB === A) || (sq.planetB === C && sq.planetA === A),
        )
        const hasSquareToB = squares.some(
          (sq) => (sq.planetA === C && sq.planetB === B) || (sq.planetB === C && sq.planetA === B),
        )
        if (!hasSquareToA || !hasSquareToB) continue

        const angleCA = getAngleDiff(posC.longitude, posA.longitude)
        const angleCB = getAngleDiff(posC.longitude, posB.longitude)
        const delta = Math.abs(angleCA - angleCB)

        const isTSquare = Math.abs(angleCA - 90) <= 8 && Math.abs(angleCB - 90) <= 8 && delta <= 6
        if (!isTSquare) continue

        const getStrength = (a: string, b: string) => aspectMap.get(`${a}-${b}`)?.strength ?? 0
        const strengthSum = getStrength(A, B) + getStrength(C, A) + getStrength(C, B)

        const existing = bestTSquarePerOpposition.get(oppKey)
        if (
          !existing ||
          delta < existing.delta ||
          (Math.abs(delta - existing.delta) < 0.5 && strengthSum > existing.strengthSum)
        ) {
          bestTSquarePerOpposition.set(oppKey, { A, B, C, angleCA, angleCB, delta, strengthSum })
        }
      }
    }

    for (const { A, B, C } of bestTSquarePerOpposition.values()) {
      const trio = [A, B, C].sort()
      const key = trio.join(',')
      if (!seenTSquares.has(key)) {
        seenTSquares.add(key)
        configurations.push({
          type: AstroConfigurationType.TSquare,
          planets: trio,
        })
      }
    }

    // === GRAND CROSS ===
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

    // === BISEXTILE ===
    for (let i = 0; i < sextiles.length; i++) {
      const { planetA: sa1, planetB: sb1 } = sextiles[i]

      for (let j = i + 1; j < sextiles.length; j++) {
        const { planetA: sa2, planetB: sb2 } = sextiles[j]

        const set1 = new Set([sa1, sb1])
        const set2 = new Set([sa2, sb2])
        const common = [...set1].filter((p) => set2.has(p))

        if (common.length !== 1) continue // общая планета одна
        const shared = common[0]
        const others = [...new Set([...set1, ...set2].filter((p) => p !== shared))]

        if (others.length !== 2) continue

        const [a, b] = others
        const hasQuincunx = aspects.some(
          (asp) =>
            ((asp.planetA === a && asp.planetB === b) || (asp.planetA === b && asp.planetB === a)) &&
            asp.aspectType === AspectType.Quincunx,
        )

        if (hasQuincunx) {
          configurations.push({
            type: AstroConfigurationType.Bisexile,
            planets: [shared, a, b].sort(), // сортируем чтобы не было дублей
          })
        }
      }
    }

    // === SAIL ===
    const seenSails = new Set<string>()

    for (let i = 0; i < trines.length; i++) {
      const { planetA: A, planetB: B, strength: strAB } = trines[i]
      if (strAB < MIN_TRINE_STRENGTH) continue

      for (const t1 of trines) {
        if (t1 === trines[i]) continue
        const C = t1.planetA === A || t1.planetB === A ? (t1.planetA === A ? t1.planetB : t1.planetA) : null
        if (!C) continue

        const t2 = getTrine(B, C)
        if (!t2) continue

        const triangle = [A, B, C]
        const unique = new Set(triangle)
        if (unique.size !== 3) continue

        const sextilePartners = new Map<string, number>()
        for (const s of sextiles) {
          for (const T of triangle) {
            const other = s.planetA === T ? s.planetB : s.planetB === T ? s.planetA : null
            if (!other || triangle.includes(other)) continue
            sextilePartners.set(other, (sextilePartners.get(other) ?? 0) + 1)
          }
        }

        for (const [D, count] of sextilePartners.entries()) {
          if (count < 2) continue
          const config = [...triangle, D]
          const key = config.slice().sort().join(',')
          if (!seenSails.has(key)) {
            seenSails.add(key)
            configurations.push({
              type: AstroConfigurationType.Sail,
              planets: config,
            })
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
